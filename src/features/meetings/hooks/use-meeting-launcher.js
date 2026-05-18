import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MEETING_CALL, MEETINGS_CREATE } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import {
  buildMeetingRoomPath,
  getMeetingVariantConfig,
  normalizeLiveKitCredentials,
  normalizeMeetingRecord,
} from "../utils/meeting-utils";

function buildAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export function useMeetingLauncher(variant) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const { homePath } = getMeetingVariantConfig(variant);

  function openMeetingsHome() {
    navigate(homePath);
  }

  function openMeetingRoom(meeting, options = {}) {
    const normalizedMeeting = normalizeMeetingRecord(meeting);

    if (!normalizedMeeting.id) {
      toast.error("Meeting ID is missing.");
      return null;
    }

    const baseUrl = buildMeetingRoomPath(variant, normalizedMeeting.id, options.mode);
    const nextPath = baseUrl.includes("?")
      ? `${baseUrl}&standalone=true`
      : `${baseUrl}?standalone=true`;

    window.open(nextPath, "_blank", "width=1280,height=720,noopener,noreferrer");

    return normalizedMeeting;
  }

  async function startDirectCall(targetUser, options = {}) {
    const targetUserId =
      targetUser?.userId ||
      targetUser?.user_id ||
      targetUser?.id ||
      null;

    if (!session?.accessToken) {
      toast.error("Please sign in again to start a call.");
      return null;
    }

    if (!targetUserId) {
      toast.error("This user is missing a call target ID.");
      return null;
    }

    try {
      const requestedCallType = options.mode === "audio" ? "audio" : "video";
      const response = await apiClient.post(
        MEETING_CALL(targetUserId),
        { call_type: requestedCallType },
        { headers: buildAuthHeaders(session.accessToken) }
      );
      const meeting = normalizeMeetingRecord(response.data);
      const credentials = normalizeLiveKitCredentials(response.data);
      const connectionDetails =
        credentials.token && (credentials.serverUrl || import.meta.env.VITE_LIVEKIT_URL)
          ? {
              token: credentials.token,
              serverUrl: credentials.serverUrl || import.meta.env.VITE_LIVEKIT_URL || "",
              roomName: credentials.roomName || meeting.roomName || "",
            }
          : null;

      if (!meeting.id) {
        throw new Error("Call response did not include a meeting ID.");
      }

      const baseUrl = buildMeetingRoomPath(variant, meeting.id, options.mode, true);
      const nextPath = baseUrl.includes("?")
        ? `${baseUrl}&standalone=true`
        : `${baseUrl}?standalone=true`;

      window.open(nextPath, "_blank", "width=1280,height=720,noopener,noreferrer");

      return meeting;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start the call."
      );

      return null;
    }
  }

  async function startChannelCall(channel, options = {}) {
    const channelId =
      channel?.channel_id ||
      channel?.id ||
      channel?.uuid ||
      null;

    if (!session?.accessToken) {
      toast.error("Please sign in again to start a channel call.");
      return null;
    }

    if (!channelId) {
      toast.error("Select a channel before starting a call.");
      return null;
    }

    try {
      const requestedCallType = options.mode === "audio" ? "audio" : "video";
      const channelName = channel?.name || channel?.channel_name || "Channel";
      const response = await apiClient.post(
        MEETINGS_CREATE,
        {
          title: `${channelName} call`,
          meeting_type: "public",
          scheduled_at: new Date().toISOString(),
          channel_id: channelId,
          call_type: requestedCallType,
          is_channel_call: true,
        },
        { headers: buildAuthHeaders(session.accessToken) }
      );
      const meeting = normalizeMeetingRecord(response.data);

      if (!meeting.id) {
        throw new Error("Channel call response did not include a meeting ID.");
      }

      const baseUrl = buildMeetingRoomPath(variant, meeting.id, requestedCallType, true);
      const nextPath = baseUrl.includes("?")
        ? `${baseUrl}&standalone=true`
        : `${baseUrl}?standalone=true`;

      window.open(nextPath, "_blank", "width=1280,height=720,noopener,noreferrer");
      toast.success(`Calling #${channelName}. Channel members can join the room.`);

      return meeting;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.detail ||
          error.message ||
          "Unable to start the channel call."
      );

      return null;
    }
  }

  return {
    homePath,
    openMeetingsHome,
    openMeetingRoom,
    startDirectCall,
    startChannelCall,
  };
}
