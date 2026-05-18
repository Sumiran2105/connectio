import "@livekit/components-styles";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, LoaderCircle, PhoneOff, Video } from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  VideoConference,
} from "@livekit/components-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import {
  MEETING_DETAILS,
  MEETING_JOIN,
  MEETING_LEAVE,
  MEETING_LIVEKIT_TOKEN,
  USER_EVENTS_WEBSOCKET,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import {
  getMeetingVariantConfig,
  normalizeLiveKitCredentials,
  normalizeMeetingRecord,
} from "../utils/meeting-utils";

const FALLBACK_LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || "";

function buildAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function getSessionUserId(session) {
  return session?.userId || session?.user_id || session?.id || null;
}

function parseSocketPayload(rawPayload) {
  if (!rawPayload) return null;
  if (typeof rawPayload === "object") return rawPayload;
  if (typeof rawPayload !== "string") return null;
  try {
    return JSON.parse(rawPayload);
  } catch {
    return null;
  }
}

function CallMonitor({ isDirect, onLeave }) {
  const participants = useParticipants();
  const [hadOtherParticipants, setHadOtherParticipants] = useState(false);

  useEffect(() => {
    if (participants.length > 1) {
      setHadOtherParticipants(true);
    }
  }, [participants.length]);

  useEffect(() => {
    if (isDirect && hadOtherParticipants && participants.length <= 1) {
      onLeave();
    }
  }, [isDirect, hadOtherParticipants, participants.length, onLeave]);

  return null;
}

export function SharedMeetingRoomPage({ layout = "user" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { meetingId } = useParams();
  const session = useAuthStore((state) => state.session);
  const leaveAttemptedRef = useRef(false);
  const joinedMeetingRef = useRef(false);
  const prefetchedCredentialsRef = useRef(
    normalizeLiveKitCredentials(location.state?.connectionDetails)
  );
  const [meeting, setMeeting] = useState(() =>
    normalizeMeetingRecord(location.state?.meeting, meetingId)
  );
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const Layout = layout === "admin" ? AdminLayout : UserLayout;
  const { backLabel, homePath } = getMeetingVariantConfig(layout);
  const callMode = searchParams.get("mode") === "audio" ? "audio" : "video";
  const userId = getSessionUserId(session);
  const socketRef = useRef(null);
  const heartbeatRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function requestJoin(headers) {
      const joinResponse = await apiClient.post(
        MEETING_JOIN(meetingId),
        {},
        { headers }
      );

      const meeting = normalizeMeetingRecord(joinResponse.data, meetingId);
      const credentials = normalizeLiveKitCredentials(joinResponse.data);
      const serverUrl = credentials.serverUrl || FALLBACK_LIVEKIT_URL;

      joinedMeetingRef.current = true;

      return {
        meeting,
        connectionDetails:
          credentials.token && serverUrl
            ? {
                token: credentials.token,
                serverUrl,
                roomName: credentials.roomName || meeting.roomName || "",
              }
            : null,
      };
    }

    async function requestConnectionDetails(headers) {
      const tokenResponse = await apiClient.post(
        MEETING_LIVEKIT_TOKEN(meetingId),
        {},
        { headers }
      );
      const credentials = normalizeLiveKitCredentials(tokenResponse.data);
      const serverUrl = credentials.serverUrl || FALLBACK_LIVEKIT_URL;

      if (!credentials.token || !serverUrl) {
        throw new Error("LiveKit token response is missing a token or server URL.");
      }

      return {
        token: credentials.token,
        serverUrl,
        roomName: credentials.roomName || "",
      };
    }

    async function bootstrapRoom() {
      if (!meetingId || !session?.accessToken) {
        if (isMounted) {
          setErrorMessage("Your session is missing. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const headers = buildAuthHeaders(session.accessToken);
        const joinResult = await requestJoin(headers);
        const prefetched = prefetchedCredentialsRef.current;
        const joinConnection = joinResult.connectionDetails;
        const hasPrefetchedConnection =
          prefetched.token && (prefetched.serverUrl || FALLBACK_LIVEKIT_URL);

        if (joinResult.meeting?.id) {
          setMeeting(joinResult.meeting);
        }

        if (joinConnection || hasPrefetchedConnection) {
          const connection = joinConnection || {
            token: prefetched.token,
            serverUrl: prefetched.serverUrl || FALLBACK_LIVEKIT_URL,
            roomName: prefetched.roomName || joinResult.meeting.roomName || "",
          };

          if (!isMounted) {
            return;
          }

          setConnectionDetails({
            ...connection,
            roomName: connection.roomName || joinResult.meeting.roomName || meeting.roomName || "",
          });
          return;
        }

        try {
          const connection = await requestConnectionDetails(headers);

          if (!isMounted) {
            return;
          }

          setConnectionDetails({
            ...connection,
            roomName: connection.roomName || joinResult.meeting.roomName || meeting.roomName || "",
          });
        } catch (error) {
          throw error;
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const nextMessage =
          error.response?.data?.message ||
          error.message ||
          "Unable to join this meeting right now.";

        console.error("Meeting room bootstrap failed:", error);
        setErrorMessage(nextMessage);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    bootstrapRoom();

    return () => {
      isMounted = false;
    };
  }, [meetingId, session?.accessToken]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (meetingId && session?.accessToken && !leaveAttemptedRef.current && joinedMeetingRef.current) {
        const headers = buildAuthHeaders(session.accessToken);
        // Use sendBeacon for reliable leave notification on window close
        const url = new URL(MEETING_LEAVE(meetingId), window.location.origin);
        
        // Note: fetch with keepalive: true is a modern alternative to sendBeacon
        void fetch(url, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          keepalive: true,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (
        !meetingId ||
        !session?.accessToken ||
        leaveAttemptedRef.current ||
        !joinedMeetingRef.current
      ) {
        return;
      }

      leaveAttemptedRef.current = true;
      void apiClient.post(
        MEETING_LEAVE(meetingId),
        {},
        { headers: buildAuthHeaders(session.accessToken) }
      );
    };
  }, [meetingId, session?.accessToken]);

  // Handle Real-Time Call Cancellation/Declining via WebSockets
  useEffect(() => {
    if (!userId || !meetingId) return;

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

    function startHeartbeat() {
      clearTimers();
      heartbeatRef.current = window.setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ event: "heartbeat" }));
        }
      }, 20000);
    }

    function connectSocket() {
      if (disposed) return;
      const socketUrl = USER_EVENTS_WEBSOCKET(userId);
      if (!socketUrl) return;

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
        if (!payload) return;

        const eventStr = String(payload.event || "").toLowerCase();
        const isTermination = 
          eventStr.includes("cancel") || 
          eventStr.includes("end") || 
          eventStr.includes("decline") || 
          eventStr.includes("reject");

        if (isTermination) {
          const targetId = 
            payload.meeting_id || 
            payload.meetingId || 
            payload.id || 
            payload.meeting?.id || 
            payload.data?.meeting_id || 
            payload.data?.id;

          if (targetId && String(targetId) === String(meetingId)) {
            toast.info("The call has ended or was declined.");
            void leaveMeeting(true);
          }
        }
      };

      socket.onerror = () => undefined;

      socket.onclose = () => {
        clearTimers();
        if (disposed) return;
        reconnectRef.current = window.setTimeout(() => connectSocket(), 2000);
      };
    }

    connectSocket();

    return () => {
      disposed = true;
      clearTimers();
      if (
        socketRef.current &&
        (socketRef.current.readyState === WebSocket.OPEN ||
          socketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        socketRef.current.close();
      }
      socketRef.current = null;
    };
  }, [userId, meetingId]);

  // Robust Polling Fallback to ensure call closes even if WebSockets fail
  useEffect(() => {
    if (!meetingId || !session?.accessToken) return;

    let disposed = false;
    const headers = buildAuthHeaders(session.accessToken);

    const pollInterval = window.setInterval(async () => {
      if (disposed) return;

      try {
        const response = await apiClient.get(MEETING_DETAILS(meetingId), { headers });
        const rawStatus = 
          response.data?.status || 
          response.data?.meeting?.status || 
          response.data?.state || 
          response.data?.meeting?.state;
          
        const isInactive = 
          response.data?.is_active === false || 
          response.data?.meeting?.is_active === false ||
          response.data?.active === false ||
          response.data?.meeting?.active === false;
          
        if (isInactive) {
          toast.info("The call has ended or was declined.");
          void leaveMeeting(true);
          return;
        }
          
        if (typeof rawStatus === "string") {
          const status = rawStatus.toLowerCase();
          if (status === "declined" || status === "ended" || status === "cancelled" || status === "rejected") {
            toast.info("The call has ended or was declined.");
            void leaveMeeting(true);
          }
        }
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          toast.info("The call is no longer available.");
          void leaveMeeting(true);
        }
      }
    }, 3000);

    return () => {
      disposed = true;
      window.clearInterval(pollInterval);
    };
  }, [meetingId, session?.accessToken]);

  async function leaveMeeting(shouldNavigate = true) {
    if (!meetingId || !session?.accessToken) {
      if (shouldNavigate) {
        navigate(homePath, { replace: true });
      }
      return;
    }

    if (!leaveAttemptedRef.current && joinedMeetingRef.current) {
      leaveAttemptedRef.current = true;

      try {
        await apiClient.post(
          MEETING_LEAVE(meetingId),
          {},
          { headers: buildAuthHeaders(session.accessToken) }
        );
      } catch (error) {
        console.error("Failed to leave meeting:", error);
      }
    }

    if (shouldNavigate) {
      if (isStandalone) {
        window.close();
      } else {
        navigate(homePath, { replace: true });
      }
    }
  }

  function handleDisconnected() {
    toast.message("Call ended");
    void leaveMeeting(true);
  }

  const isStandalone = searchParams.get("standalone") === "true";

  const content = (
    <div className={`flex h-full min-h-0 flex-col ${isStandalone ? "bg-[#0b0f19]" : "bg-[#eff4f4]"}`}>
      <div
        className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 ${
          isStandalone
            ? "border-b border-white/5 bg-[#0b0f19]/80 backdrop-blur-md"
            : "border-b border-brand-line/20 bg-white"
        }`}
      >
        <div className="min-w-0">
          {!isStandalone && (
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition-colors hover:text-brand-primary"
            >
              <ChevronLeft className="size-4" />
              {backLabel}
            </button>
          )}
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 items-center justify-center rounded-2xl ${
                isStandalone ? "bg-brand-primary/20 text-brand-primary" : "bg-brand-primary/10 text-brand-primary"
              }`}
            >
              <Video className="size-5" />
            </div>
            <div className="min-w-0">
              <h1
                className={`truncate text-xl font-black tracking-tight sm:text-2xl ${
                  isStandalone ? "text-white" : "text-brand-ink"
                }`}
              >
                {meeting.title || "Meeting Room"}
              </h1>
              <p className={`truncate text-sm ${isStandalone ? "text-white/60" : "text-brand-secondary"}`}>
                {connectionDetails?.roomName || meeting.roomName || `Meeting ID: ${meetingId}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div
            className={`flex max-w-md flex-col items-center gap-4 rounded-[28px] border px-8 py-10 text-center shadow-sm ${
              isStandalone ? "border-white/10 bg-white/5 text-white" : "border-brand-line bg-white"
            }`}
          >
            <LoaderCircle className="size-10 animate-spin text-brand-primary" />
            <div>
              <h2 className={`text-lg font-bold ${isStandalone ? "text-white" : "text-brand-ink"}`}>
                Connecting to your room
              </h2>
              <p className={`mt-2 text-sm ${isStandalone ? "text-white/60" : "text-brand-secondary"}`}>
                We&apos;re fetching the meeting token and setting up audio, video, and screen sharing.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && errorMessage ? (
        <div className="flex flex-1 items-center justify-center p-6">
          <div
            className={`max-w-lg rounded-[28px] border px-8 py-10 shadow-sm ${
              isStandalone ? "border-red-500/20 bg-white/5" : "border-red-200 bg-white"
            }`}
          >
            <h2 className={`text-lg font-bold ${isStandalone ? "text-white" : "text-brand-ink"}`}>
              Unable to open this meeting
            </h2>
            <p className={`mt-3 text-sm leading-6 ${isStandalone ? "text-white/60" : "text-brand-secondary"}`}>
              {errorMessage}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => (isStandalone ? window.close() : navigate(homePath, { replace: true }))}
                className="rounded-xl bg-brand-primary px-5 py-2.5 font-bold text-white hover:bg-brand-primary/90"
              >
                {isStandalone ? "Close Window" : "Return"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className={`rounded-xl px-5 py-2.5 font-bold ${
                  isStandalone ? "border-white/10 text-white hover:bg-white/5" : ""
                }`}
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {!isLoading && !errorMessage && connectionDetails ? (
        <div className="min-h-0 flex-1">
          <LiveKitRoom
            audio
            connect
            data-lk-theme="default"
            onDisconnected={handleDisconnected}
            serverUrl={connectionDetails.serverUrl}
            token={connectionDetails.token}
            video={callMode !== "audio"}
            className="h-full bg-[#111827]"
          >
            <VideoConference />
            <RoomAudioRenderer />
            <CallMonitor 
              isDirect={
                searchParams.get("isCall") === "true" ||
                meeting.meeting_type === "direct" || 
                meeting.is_direct || 
                meeting.type === "direct"
              } 
              onLeave={() => {
                toast.info("The other participant has left the call.");
                void leaveMeeting(true);
              }} 
            />
          </LiveKitRoom>
        </div>
      ) : null}
    </div>
  );

  if (isStandalone) {
    return <div className="h-screen w-screen overflow-hidden">{content}</div>;
  }

  return (
    <Layout
      showFloatingActions={false}
      contentClassName="!px-0 !py-0 !overflow-hidden"
      contentInnerClassName="!mx-0 !h-full !max-w-none !w-full"
    >
      {content}
    </Layout>
  );
}
