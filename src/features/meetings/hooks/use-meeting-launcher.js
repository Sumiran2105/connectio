import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MEETING_CALL } from "@/config/api";
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

    navigate(buildMeetingRoomPath(variant, normalizedMeeting.id, options.mode), {
      state: { meeting: normalizedMeeting },
    });

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

      navigate(buildMeetingRoomPath(variant, meeting.id, options.mode), {
        state: { meeting, connectionDetails },
      });

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

  return {
    homePath,
    openMeetingsHome,
    openMeetingRoom,
    startDirectCall,
  };
}
