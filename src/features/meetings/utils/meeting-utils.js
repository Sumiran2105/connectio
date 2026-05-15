function pickFirstString(values) {
  return values.find((value) => typeof value === "string" && value.trim()) || "";
}

export function getMeetingId(record) {
  if (!record || typeof record !== "object") {
    return null;
  }

  return (
    record.id ||
    record.meeting_id ||
    record.meetingId ||
    record.uuid ||
    record._id ||
    null
  );
}

export function normalizeMeetingRecord(payload, fallbackId = "") {
  const sources = [
    payload,
    payload?.data,
    payload?.meeting,
    payload?.item,
    payload?.result,
    payload?.data?.meeting,
    payload?.data?.item,
    payload?.result?.meeting,
  ];

  for (const source of sources) {
    if (!source || typeof source !== "object") {
      continue;
    }

    const id = getMeetingId(source) || fallbackId || null;
    const title = pickFirstString([
      source.title,
      source.name,
      source.topic,
      source.subject,
    ]) || (id ? `Meeting ${String(id).slice(-6)}` : "Meeting");
    const joinLink = pickFirstString([
      source.join_link,
      source.joinLink,
      source.meeting_link,
      source.meetingLink,
      source.invite_link,
      source.inviteLink,
      source.share_url,
      source.shareUrl,
      source.url,
      source.link,
    ]);
    const roomName = pickFirstString([
      source.room_name,
      source.roomName,
      source.livekit_room,
      source.livekitRoom,
      source.room,
    ]);

    if (id || joinLink || roomName) {
      return {
        ...source,
        id,
        title,
        joinLink,
        roomName,
      };
    }
  }

  return {
    id: fallbackId || null,
    title: fallbackId ? `Meeting ${String(fallbackId).slice(-6)}` : "Meeting",
    joinLink: "",
    roomName: "",
  };
}

export function normalizeLiveKitCredentials(payload) {
  const sources = [
    payload,
    payload?.data,
    payload?.result,
    payload?.livekit,
    payload?.data?.livekit,
  ];

  for (const source of sources) {
    if (!source || typeof source !== "object") {
      continue;
    }

    const token = pickFirstString([
      source.token,
      source.livekit_token,
      source.livekitToken,
      source.access_token,
      source.accessToken,
      source.participant_token,
      source.participantToken,
    ]);
    const serverUrl = pickFirstString([
      source.url,
      source.livekit_url,
      source.livekitUrl,
      source.server_url,
      source.serverUrl,
      source.ws_url,
      source.wsUrl,
    ]);
    const roomName = pickFirstString([
      source.room_name,
      source.roomName,
      source.room,
      source.livekit_room,
      source.livekitRoom,
    ]);

    if (token || serverUrl || roomName) {
      return { token, serverUrl, roomName };
    }
  }

  return { token: "", serverUrl: "", roomName: "" };
}

export function extractInviteToken(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    const joinIndex = segments.findIndex((segment) => segment === "join");

    if (joinIndex >= 0 && segments[joinIndex + 1]) {
      return segments[joinIndex + 1];
    }

    return segments.at(-1) || trimmed;
  } catch {
    return trimmed.replace(/^\/+|\/+$/g, "");
  }
}

export function toLocalDateTimeValue(date) {
  const instance = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(instance.getTime())) {
    return "";
  }

  const offset = instance.getTimezoneOffset();
  const localDate = new Date(instance.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export function getMeetingVariantConfig(variant = "user") {
  if (variant === "admin") {
    return {
      homePath: "/admin/dashboard/meetings",
      title: "Meetings",
      intro:
        "Create a meeting, join by invite, and move into the shared LiveKit room from the admin workspace.",
      backLabel: "Back to Meetings",
    };
  }

  return {
    homePath: "/user/dashboard/meet",
    title: "Meet",
    intro:
      "Create a meeting, join by invite, and move into a full LiveKit room for audio, video, and screen share.",
    backLabel: "Back to Meet",
  };
}

export function buildMeetingRoomPath(variant = "user", meetingId, mode = "video") {
  const { homePath } = getMeetingVariantConfig(variant);
  const search = mode === "audio" ? "?mode=audio" : "";
  return `${homePath}/${meetingId}/room${search}`;
}
