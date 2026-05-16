import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Copy,
  Hash,
  Link2,
  LoaderCircle,
  Phone,
  Plus,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import {
  CHANNELS_LIST,
  MEETING_DETAILS,
  MEETING_JOIN_BY_LINK,
  MEETINGS_CREATE,
} from "@/config/api";
import { isDirectChannel } from "@/channels/utils/channel-utils";
import {
  extractInviteToken,
  getMeetingVariantConfig,
  normalizeMeetingRecord,
  toLocalDateTimeValue,
} from "../utils/meeting-utils";
import { useMeetingLauncher } from "../hooks/use-meeting-launcher";

const recentCalls = [
  {
    id: 1,
    name: "Aniket Jadhav",
    duration: "0m 59s",
    date: "30/03",
    status: "answered",
  },
  {
    id: 2,
    name: "Aniket Jadhav",
    duration: null,
    date: "30/03",
    status: "missed",
  },
  {
    id: 3,
    name: "Arjun",
    duration: "2m 15s",
    date: "28/03",
    status: "answered",
  },
];

function buildAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

function Avatar({ name, size = "size-12" }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = ["bg-pink-400", "bg-sky-400", "bg-emerald-400", "bg-amber-400"];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center rounded-full ${color} text-sm font-bold text-white shadow-sm`}
    >
      {initials}
    </div>
  );
}

function getInitialFormState(mode = "instant") {
  const scheduledAt = new Date();

  if (mode === "scheduled") {
    scheduledAt.setMinutes(scheduledAt.getMinutes() + 30);
  }

  return {
    title: mode === "instant" ? "Instant meeting" : "Team sync",
    meeting_type: "public",
    channel_id: "",
    scheduled_at: toLocalDateTimeValue(scheduledAt),
  };
}

export function SharedMeetPage({ layout = "user" }) {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const { openMeetingRoom } = useMeetingLauncher(layout);
  const accessToken = session?.accessToken;
  const [joinValue, setJoinValue] = useState("");
  const [channels, setChannels] = useState([]);
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState("instant");
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormState());
  const hasCreatedMeetingAccess = Boolean(createdMeeting?.joinLink || createdMeeting?.id);
  const Layout = layout === "admin" ? AdminLayout : UserLayout;
  const { homePath, intro, title } = getMeetingVariantConfig(layout);

  useEffect(() => {
    if (!isCreateOpen || !accessToken) {
      return;
    }

    let isMounted = true;

    async function fetchChannels() {
      try {
        setIsLoadingChannels(true);

        const response = await apiClient.get(CHANNELS_LIST, {
          headers: buildAuthHeaders(accessToken),
        });
        const channelData = Array.isArray(response.data)
          ? response.data
          : response.data?.items || response.data?.data || [];
        const workspaceChannels = channelData.filter(
          (channel) => channel && !isDirectChannel(channel)
        );

        if (!isMounted) {
          return;
        }

        setChannels(workspaceChannels);
        setFormData((current) => ({
          ...current,
          channel_id:
            current.channel_id || workspaceChannels[0]?.id || workspaceChannels[0]?.channel_id || "",
        }));
      } catch {
        if (isMounted) {
          toast.error("Unable to load channels for meeting creation.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingChannels(false);
        }
      }
    }

    fetchChannels();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isCreateOpen]);

  function openCreateModal(mode) {
    setCreateMode(mode);
    setFormData(getInitialFormState(mode));
    setIsCreateOpen(true);
  }

  function closeCreateModal() {
    setIsCreateOpen(false);
  }

  async function resolveMeetingTarget(rawValue) {
    const trimmed = rawValue.trim();
    const headers = buildAuthHeaders(accessToken);

    if (!trimmed) {
      throw new Error("Enter a meeting ID or invite link.");
    }

    const inviteToken = extractInviteToken(trimmed);
    const looksLikeLink = trimmed.includes("://") || trimmed.includes("/join/");

    if (!looksLikeLink) {
      try {
        const detailsResponse = await apiClient.get(MEETING_DETAILS(trimmed), {
          headers,
        });
        const meeting = normalizeMeetingRecord(detailsResponse.data, trimmed);

        if (meeting.id) {
          return meeting;
        }
      } catch (error) {
        if (!inviteToken) {
          throw error;
        }
      }
    }

    const joinLinkResponse = await apiClient.get(MEETING_JOIN_BY_LINK(inviteToken), {
      headers,
    });
    const meeting = normalizeMeetingRecord(joinLinkResponse.data, trimmed);

    if (!meeting.id) {
      throw new Error("The invite link did not return a meeting ID.");
    }

    return meeting;
  }

  async function handleJoinMeeting(rawValue = joinValue) {
    if (!accessToken) {
      toast.error("Please sign in again to join a meeting.");
      return;
    }

    try {
      setIsJoining(true);
      const meeting = await resolveMeetingTarget(rawValue);

      openMeetingRoom(meeting);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to find that meeting."
      );
    } finally {
      setIsJoining(false);
    }
  }

  async function handleCreateMeeting() {
    if (!accessToken) {
      toast.error("Please sign in again to create a meeting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        title: formData.title.trim() || "Meeting",
        meeting_type: formData.meeting_type,
        scheduled_at: new Date(formData.scheduled_at || new Date()).toISOString(),
      };

      if (formData.channel_id) {
        payload.channel_id = formData.channel_id;
      }

      const response = await apiClient.post(MEETINGS_CREATE, payload, {
        headers: buildAuthHeaders(accessToken),
      });
      const meeting = normalizeMeetingRecord(response.data);

      setCreatedMeeting({
        ...meeting,
        title: meeting.title || payload.title,
      });
      setJoinValue(meeting.joinLink || meeting.id || "");
      setIsCreateOpen(false);

      if (createMode === "instant") {
        toast.success("Meeting created. Opening room...");
        openMeetingRoom(meeting);
      } else {
        toast.success("Meeting scheduled successfully.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to create the meeting."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyMeetingValue() {
    const valueToCopy = createdMeeting?.joinLink || createdMeeting?.id;

    if (!valueToCopy) {
      return;
    }

    try {
      await navigator.clipboard.writeText(valueToCopy);
      toast.success("Meeting details copied.");
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  }

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">{title}</h1>
          <p className="mt-2 text-base text-gray-600">{intro}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6 rounded-[30px] border border-brand-line bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => openCreateModal("instant")}
                className="group flex items-center gap-4 rounded-[24px] border border-brand-line bg-[#f3f7f7] px-6 py-6 text-left transition-all hover:border-brand-primary/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-transform group-hover:scale-105">
                  <Plus className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-brand-ink">Create meeting</p>
                  <p className="mt-1 text-sm text-brand-secondary">Generate a room from your workspace channel.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => openCreateModal("scheduled")}
                className="group flex items-center gap-4 rounded-[24px] border border-brand-line bg-[#f7f5ef] px-6 py-6 text-left transition-all hover:border-brand-primary/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105">
                  <Calendar className="size-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-brand-ink">Schedule meeting</p>
                  <p className="mt-1 text-sm text-brand-secondary">Pick a time, channel, and privacy level.</p>
                </div>
              </button>
            </div>

            <div className="rounded-[26px] border border-brand-line/70 bg-[#f9fbfb] p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                    Latest invite
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-ink">
                    {createdMeeting?.title || "No meeting created yet"}
                  </h2>
                </div>
                {hasCreatedMeetingAccess ? (
                  <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Ready
                  </div>
                ) : null}
              </div>

              {hasCreatedMeetingAccess ? (
                <div className="mt-5 space-y-4">
                  <div className="rounded-2xl border border-brand-line bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                      {createdMeeting.joinLink ? "Invite link" : "Meeting ID"}
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-brand-ink">
                      {createdMeeting.joinLink || createdMeeting.id}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyMeetingValue}
                      className="inline-flex items-center rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-soft"
                    >
                      <Copy className="mr-2 size-4" />
                      Copy
                    </button>
                    {createdMeeting.id ? (
                      <button
                        type="button"
                        onClick={() => void handleJoinMeeting(createdMeeting.id)}
                        className="inline-flex items-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary/90"
                      >
                        <Video className="mr-2 size-4" />
                        Open room
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-brand-line bg-white p-6 text-sm text-brand-secondary">
                  Create a meeting and the invite link or meeting ID will appear here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-brand-line bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
              Join meeting
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-ink">
              Enter a meeting ID or invite link
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-secondary">
              Paste the full invite URL from your backend or the raw meeting ID. We&apos;ll resolve it and take you into the LiveKit room.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-brand-line bg-[#f4f8f8] p-4">
                <label
                  htmlFor="meetingTarget"
                  className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60"
                >
                  <Link2 className="size-4" />
                  Invite
                </label>
                <input
                  id="meetingTarget"
                  type="text"
                  value={joinValue}
                  onChange={(event) => setJoinValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleJoinMeeting();
                    }
                  }}
                  placeholder="Paste meeting ID or invite link"
                  className="w-full rounded-2xl border border-brand-line bg-white px-4 py-3 text-sm font-medium text-brand-ink outline-none ring-0 transition-all placeholder:text-brand-secondary/40 focus:border-brand-primary/30"
                />
              </div>

              <button
                type="button"
                onClick={() => void handleJoinMeeting()}
                disabled={isJoining}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isJoining ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Video className="mr-2 size-4" />
                )}
                Join now
              </button>
            </div>

            <div className="mt-8 rounded-[24px] border border-brand-line bg-[#f9fbfb] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                Recent calls
              </p>
              <div className="mt-4 space-y-3">
                {recentCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-brand-line bg-white p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={call.name} size="size-10" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-brand-ink">{call.name}</p>
                        <p className="mt-1 text-xs text-brand-secondary">
                          {call.status === "answered"
                            ? `${call.duration} • ${call.date}`
                            : `No answer • ${call.date}`}
                        </p>
                      </div>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary/70">
                      <Phone className="mr-1 size-3" />
                      {call.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[32px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-brand-line/20 px-6 py-5 sm:px-8">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                  {createMode === "instant" ? "Create meeting" : "Schedule meeting"}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-ink">
                  {createMode === "instant"
                    ? "Set up a room for your next call"
                    : "Plan the meeting before you send the invite"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-xl border border-brand-line bg-white px-4 py-2 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-soft"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 px-6 py-6 sm:px-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-brand-line bg-[#f7fbfb] px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary/30"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                    <Hash className="size-4" />
                    Channel
                  </label>
                  <select
                    value={formData.channel_id}
                    onChange={(event) =>
                      setFormData((current) => ({ ...current, channel_id: event.target.value }))
                    }
                    disabled={isLoadingChannels}
                    className="w-full rounded-2xl border border-brand-line bg-[#f7fbfb] px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary/30 disabled:opacity-70"
                  >
                    <option value="">
                      {isLoadingChannels ? "Loading channels..." : "Select channel"}
                    </option>
                    {channels.map((channel) => (
                      <option
                        key={channel.id || channel.channel_id}
                        value={channel.id || channel.channel_id}
                      >
                        {channel.name || channel.channel_name || "Untitled channel"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                    Privacy
                  </label>
                  <select
                    value={formData.meeting_type}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        meeting_type: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-brand-line bg-[#f7fbfb] px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary/30"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-secondary/60">
                  <Calendar className="size-4" />
                  Start time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_at}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      scheduled_at: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-brand-line bg-[#f7fbfb] px-4 py-3 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary/30"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-brand-line/20 px-6 py-5 sm:px-8">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-xl border border-brand-line bg-white px-5 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateMeeting()}
                disabled={isSubmitting}
                className="inline-flex items-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                ) : (
                  <Video className="mr-2 size-4" />
                )}
                {createMode === "instant" ? "Create meeting" : "Schedule meeting"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
}
