import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoaderCircle, Phone, PhoneOff, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MEETING_ACCEPT,
  MEETING_DECLINE,
  MEETING_DETAILS,
  USER_EVENTS_WEBSOCKET,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import {
  buildMeetingRoomPath,
  normalizeMeetingRecord,
} from "../utils/meeting-utils";

function buildAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function getSessionUserId(session) {
  return session?.userId || session?.user_id || session?.id || null;
}

function parseSocketPayload(rawPayload) {
  if (!rawPayload) {
    return null;
  }

  if (typeof rawPayload === "object") {
    return rawPayload;
  }

  if (typeof rawPayload !== "string") {
    return null;
  }

  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

function resolveCallMode(payload, meeting) {
  const rawMode =
    payload?.call_type ||
    payload?.callType ||
    payload?.mode ||
    meeting?.call_type ||
    meeting?.callType ||
    "video";

  return String(rawMode).toLowerCase() === "audio" ? "audio" : "video";
}

function resolveCallerLabel(payload) {
  return (
    payload?.from_user_name ||
    payload?.fromName ||
    payload?.caller_name ||
    payload?.callerName ||
    payload?.name ||
    "A teammate"
  );
}

function getCallerInitials(name) {
  return String(name || "Call")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getWorkspaceVariant(role) {
  return role === "USER" ? "user" : "admin";
}

function getActiveMeetingId(pathname) {
  const match = pathname.match(/\/(?:meet|meetings)\/([^/]+)\/room/i);
  return match?.[1] || null;
}

function createRingToneBurst(audioContext) {
  const oscillatorFrequencies = [740, 622];
  const burstStartTime = audioContext.currentTime + 0.02;
  const toneDuration = 0.32;
  const toneGap = 0.18;

  oscillatorFrequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const toneStart = burstStartTime + index * (toneDuration + toneGap);
    const toneEnd = toneStart + toneDuration;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, toneStart);

    gainNode.gain.setValueAtTime(0.0001, toneStart);
    gainNode.gain.exponentialRampToValueAtTime(0.07, toneStart + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(toneStart);
    oscillator.stop(toneEnd + 0.04);

    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  });
}

export function IncomingCallLayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);
  const reconnectRef = useRef(null);
  const activeMeetingIdRef = useRef(null);
  const ringtoneContextRef = useRef(null);
  const ringtoneLoopRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const incomingCallIdRef = useRef(null);
  const [isHydrating, setIsHydrating] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const accessToken = session?.accessToken || "";
  const userId = getSessionUserId(session);
  const workspaceVariant = getWorkspaceVariant(session?.role);
  const activeMeetingId = getActiveMeetingId(location.pathname);
  const callerInitials = getCallerInitials(incomingCall?.callerLabel);
  const incomingCallLabel = incomingCall?.mode === "audio" ? "Audio call" : "Video call";
  const incomingCallDescription = incomingCall?.mode === "audio" ? "an audio call" : "a video call";

  function stopRingtone() {
    if (ringtoneLoopRef.current) {
      window.clearInterval(ringtoneLoopRef.current);
      ringtoneLoopRef.current = null;
    }

    if (ringtoneContextRef.current) {
      const currentContext = ringtoneContextRef.current;
      ringtoneContextRef.current = null;
      void currentContext.close().catch(() => undefined);
    }
  }

  async function startRingtone() {
    if (typeof window === "undefined") {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    stopRingtone();

    try {
      const audioContext = new AudioContextClass();
      ringtoneContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      createRingToneBurst(audioContext);
      ringtoneLoopRef.current = window.setInterval(() => {
        if (audioContext.state === "running") {
          createRingToneBurst(audioContext);
        }
      }, 2800);
    } catch {
      stopRingtone();
    }
  }

  useEffect(() => {
    activeMeetingIdRef.current = activeMeetingId;

    if (incomingCall?.meeting?.id && incomingCall.meeting.id === activeMeetingId) {
      setIncomingCall(null);
    }
  }, [activeMeetingId, incomingCall]);

  useEffect(() => {
    if (!accessToken || !userId || session?.role === "SUPER_ADMIN") {
      setIncomingCall(null);
      stopRingtone();
      return undefined;
    }

    let disposed = false;

    function clearTimers() {
      if (heartbeatRef.current) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    }

    async function hydrateIncomingCall(payload) {
      const nextMeetingId = payload?.meeting_id || payload?.meetingId || null;

      if (!nextMeetingId || nextMeetingId === activeMeetingIdRef.current) {
        return;
      }

      setIsHydrating(true);

      let meeting = normalizeMeetingRecord(payload, nextMeetingId);

      try {
        const response = await apiClient.get(MEETING_DETAILS(nextMeetingId), {
          headers: buildAuthHeaders(accessToken),
        });
        meeting = normalizeMeetingRecord(response.data, nextMeetingId);
      } catch {
        // Keep the fallback meeting stub when details are unavailable.
      } finally {
        if (!disposed) {
          setIsHydrating(false);
        }
      }

      if (disposed) {
        return;
      }

      const mode = resolveCallMode(payload, meeting);
      const callerLabel = resolveCallerLabel(payload);

      setIncomingCall((current) => {
        if (current?.meeting?.id === nextMeetingId) {
          return current;
        }

        incomingCallIdRef.current = nextMeetingId;
        return {
          callerLabel,
          meeting,
          mode,
        };
      });

      toast.message(`${callerLabel} is calling you.`);
    }

    function startHeartbeat() {
      clearTimers();
      heartbeatRef.current = window.setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ event: "heartbeat" }));
        }
      }, 20000);
    }

    function connectSocket() {
      if (disposed) {
        return;
      }

      const socketUrl = USER_EVENTS_WEBSOCKET(userId);

      if (!socketUrl) {
        return;
      }

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          socket.close();
          return;
        }

        startHeartbeat();
      };

      socket.onmessage = (event) => {
        const payload = parseSocketPayload(event.data);

        if (!payload) {
          return;
        }

        if (payload.event === "incoming_call") {
          void hydrateIncomingCall(payload);
          return;
        }

        if (payload.event === "call_cancelled" || payload.event === "call_ended") {
          const cancelledId = payload.meeting_id || payload.meetingId;
          if (cancelledId && cancelledId === incomingCallIdRef.current) {
            setIncomingCall(null);
            incomingCallIdRef.current = null;
            stopRingtone();
          }
        }
      };

      socket.onerror = () => undefined;

      socket.onclose = () => {
        clearTimers();

        if (disposed) {
          return;
        }

        reconnectRef.current = window.setTimeout(() => {
          connectSocket();
        }, 2000);
      };
    }

    connectSocket();

    return () => {
      disposed = true;
      clearTimers();
      stopRingtone();

      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        socketRef.current.close();
      }

      socketRef.current = null;
    };
  }, [accessToken, session?.role, userId]);

  useEffect(() => {
    if (incomingCall?.meeting?.id) {
      void startRingtone();
      return () => {
        stopRingtone();
      };
    }

    stopRingtone();
    return undefined;
  }, [incomingCall?.meeting?.id]);

  async function dismissIncomingCall(shouldNotifyBackend = false) {
    if (shouldNotifyBackend && incomingCall?.meeting?.id && accessToken) {
      try {
        setIsSubmittingAction(true);
        await apiClient.post(
          MEETING_DECLINE(incomingCall.meeting.id),
          {},
          { headers: buildAuthHeaders(accessToken) }
        );
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          error.response?.data?.detail ||
          "Unable to decline the call right now."
        );
      } finally {
        setIsSubmittingAction(false);
      }
    }

    stopRingtone();
    setIncomingCall(null);
    incomingCallIdRef.current = null;
  }

  async function acceptIncomingCall() {
    if (!incomingCall?.meeting?.id) {
      return;
    }

    try {
      setIsSubmittingAction(true);

      await apiClient.post(
        MEETING_ACCEPT(incomingCall.meeting.id),
        {},
        { headers: buildAuthHeaders(accessToken) }
      );

      const baseUrl = buildMeetingRoomPath(
        workspaceVariant,
        incomingCall.meeting.id,
        incomingCall.mode,
        true
      );
      const nextPath = baseUrl.includes("?")
        ? `${baseUrl}&standalone=true`
        : `${baseUrl}?standalone=true`;

      window.open(nextPath, "_blank", "width=1280,height=720,noopener,noreferrer");

      stopRingtone();
      setIncomingCall(null);
      incomingCallIdRef.current = null;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        "Unable to accept the call right now."
      );
    } finally {
      setIsSubmittingAction(false);
    }
  }

  return (
    <Dialog
      open={Boolean(incomingCall)}
      onOpenChange={(open) => (!open && !isSubmittingAction ? dismissIncomingCall(false) : null)}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-lg rounded-[30px] border border-brand-line/80 bg-white p-0 shadow-[0_32px_110px_rgba(66,85,74,0.18)]"
      >
        <div className="p-7 sm:p-8">
          <DialogHeader className="gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                  {incomingCall?.mode === "audio" ? (
                    <Phone className="size-3.5 text-brand-primary" />
                  ) : (
                    <Video className="size-3.5 text-brand-primary" />
                  )}
                  Incoming Call
                </span>
                <div className="space-y-2">
                  <DialogTitle className="text-[2rem] font-semibold tracking-tight text-brand-ink">
                    {incomingCall?.callerLabel || "Incoming call"}
                  </DialogTitle>
                  <DialogDescription className="max-w-md text-[15px] leading-7 text-brand-secondary">
                    would like to start {incomingCallDescription} with you. Accept to
                    join the call in your workspace.
                  </DialogDescription>
                </div>
              </div>

              <div className="flex size-16 shrink-0 items-center justify-center rounded-[26px] bg-brand-primary text-lg font-bold text-white shadow-[0_18px_40px_rgba(13,122,87,0.22)]">
                {callerInitials}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-y border-brand-line/70 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Caller
                </p>
                <p className="mt-1 truncate text-base font-semibold text-brand-ink">
                  {incomingCall?.callerLabel || "Workspace contact"}
                </p>
              </div>
              <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-brand-primary/8 px-3 py-1.5 text-sm font-medium text-brand-primary">
                {incomingCall?.mode === "audio" ? (
                  <Phone className="size-4" />
                ) : (
                  <Video className="size-4" />
                )}
                {incomingCallLabel}
              </div>
            </div>
          </DialogHeader>
        </div>

        <DialogFooter className="border-brand-line bg-[#fbfcfb] sm:grid sm:grid-cols-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-[52px] rounded-2xl border-rose-200 bg-rose-50 text-base font-semibold text-rose-600 hover:bg-rose-100 hover:text-rose-700"
            onClick={() => void dismissIncomingCall(true)}
            disabled={isSubmittingAction}
          >
            <PhoneOff className="size-4" />
            Decline
          </Button>
          <Button
            type="button"
            className="h-[52px] rounded-2xl bg-brand-primary text-base font-semibold text-white hover:bg-brand-primary/90"
            onClick={() => void acceptIncomingCall()}
            disabled={isHydrating || isSubmittingAction}
          >
            {isHydrating || isSubmittingAction ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                {isHydrating ? "Opening" : "Joining"}
              </>
            ) : (
              <>
                {incomingCall?.mode === "audio" ? (
                  <Phone className="size-4" />
                ) : (
                  <Video className="size-4" />
                )}
                Join Call
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
