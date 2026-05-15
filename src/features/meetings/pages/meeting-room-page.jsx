import "@livekit/components-styles";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, LoaderCircle, PhoneOff, Video } from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoConference,
} from "@livekit/components-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import {
  MEETING_JOIN,
  MEETING_LEAVE,
  MEETING_LIVEKIT_TOKEN,
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
    return () => {
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
      navigate(homePath, { replace: true });
    }
  }

  function handleDisconnected() {
    toast.message("Call ended");
    void leaveMeeting(true);
  }

  return (
    <Layout
      showFloatingActions={false}
      contentClassName="!px-0 !py-0 !overflow-hidden"
      contentInnerClassName="!mx-0 !h-full !max-w-none !w-full"
    >
      <div className="flex h-full min-h-0 flex-col bg-[#eff4f4]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-line/20 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-secondary transition-colors hover:text-brand-primary"
            >
              <ChevronLeft className="size-4" />
              {backLabel}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Video className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight text-brand-ink sm:text-2xl">
                  {meeting.title || "Meeting Room"}
                </h1>
                <p className="truncate text-sm text-brand-secondary">
                  {connectionDetails?.roomName || meeting.roomName || `Meeting ID: ${meetingId}`}
                </p>
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => void leaveMeeting(true)}
            className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-600"
          >
            <PhoneOff className="mr-2 size-4" />
            Leave
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex max-w-md flex-col items-center gap-4 rounded-[28px] border border-brand-line bg-white px-8 py-10 text-center shadow-sm">
              <LoaderCircle className="size-10 animate-spin text-brand-primary" />
              <div>
                <h2 className="text-lg font-bold text-brand-ink">Connecting to your room</h2>
                <p className="mt-2 text-sm text-brand-secondary">
                  We&apos;re fetching the meeting token and setting up audio, video, and screen sharing.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-lg rounded-[28px] border border-red-200 bg-white px-8 py-10 shadow-sm">
              <h2 className="text-lg font-bold text-brand-ink">Unable to open this meeting</h2>
              <p className="mt-3 text-sm leading-6 text-brand-secondary">{errorMessage}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => navigate(homePath, { replace: true })}
                  className="rounded-xl bg-brand-primary px-5 py-2.5 font-bold text-white hover:bg-brand-primary/90"
                >
                  Return
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-xl px-5 py-2.5 font-bold"
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
            </LiveKitRoom>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
