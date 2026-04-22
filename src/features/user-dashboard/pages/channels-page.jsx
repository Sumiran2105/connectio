import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCheck,
  ChevronLeft,
  Hash,
  Lock,
  MessageSquare,
  Search,
  SquarePen,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { CHANNELS_MY_CHANNELS } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { ChatAvatar } from "../components/chat-avatar";
import { UserLayout } from "../components/user-layout";
import { ChatComposer } from "../components/chat-composer";

function normalizeChannels(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.channels)) {
    return data.channels;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function buildChannelView(channel, index) {
  const name = channel?.name || channel?.channel_name || `channel-${index + 1}`;
  const description =
    channel?.description ||
    channel?.purpose ||
    channel?.topic ||
    "No channel description available yet.";
  const memberCount =
    channel?.members_count ||
    channel?.member_count ||
    channel?.members?.length ||
    0;
  const teamName =
    channel?.team_name || channel?.team?.name || channel?.workspace_name || "Workspace channel";
  const isPrivate = Boolean(channel?.private || channel?.is_private);

  return {
    id: channel?.id || channel?.channel_id || `${name}-${index}`,
    name,
    description,
    memberCount,
    isPrivate,
    teamName,
    visibilityLabel: isPrivate ? "Private" : "Public",
  };
}

function ChannelSidebarItem({ channel, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${isActive
        ? "border-brand-primary/20 bg-white shadow-sm"
        : "border-transparent bg-transparent hover:border-gray-200 hover:bg-white"
        }`}
    >
      <div className="flex items-start gap-3">
        <ChatAvatar name={channel.name} size="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-sm font-semibold text-gray-900">#{channel.name}</p>
              {channel.isPrivate ? <Lock className="size-3.5 shrink-0 text-gray-400" /> : null}
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {channel.visibilityLabel}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{channel.description}</p>
        </div>
      </div>
    </button>
  );
}
const MOCK_MESSAGES = {
  general: [
    { id: "m1", from: "them", text: "Welcome to the general channel!", time: "09:00 AM" },
    { id: "m2", from: "me", text: "Thanks! Happy to be here.", time: "09:05 AM" },
  ],
  "front-end": [
    { id: "m3", from: "them", text: "Did anyone review the new PR?", time: "10:30 AM" },
    { id: "m4", from: "them", text: "It's looking good, just a few tweaks needed.", time: "10:32 AM" },
  ],
};

export function ChannelsPage() {
  const session = useAuthStore((state) => state.session);
  const [search, setSearch] = useState("");
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(MOCK_MESSAGES);
  const bottomRef = useRef(null);

  const channelsQuery = useQuery({
    queryKey: ["my-channels", session?.accessToken],
    queryFn: async () => {
      const response = await apiClient.get(CHANNELS_MY_CHANNELS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return normalizeChannels(response.data).map(buildChannelView);
    },
    enabled: Boolean(session?.accessToken),
    staleTime: 30 * 1000,
  });

  const channels = channelsQuery.data || [];

  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return channels;
    }

    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query) ||
        channel.teamName.toLowerCase().includes(query)
    );
  }, [channels, search]);

  const activeChannel =
    filteredChannels.find((channel) => channel.id === activeChannelId) ||
    channels.find((channel) => channel.id === activeChannelId) ||
    filteredChannels[0] ||
    channels[0] ||
    null;

  const currentMessages = activeChannel ? conversations[activeChannel.id] || conversations[activeChannel.name.toLowerCase()] || [] : [];

  useEffect(() => {
    if (!activeChannelId && channels[0]) {
      setActiveChannelId(channels[0].id);
    }
  }, [activeChannelId, channels]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  function sendMessage() {
    const text = messageInput.trim();
    if (!text || !activeChannel) return;

    const channelKey = activeChannel.id;
    const newMsg = {
      id: `m-${Date.now()}`,
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConversations((prev) => ({
      ...prev,
      [channelKey]: [...(prev[channelKey] || []), newMsg],
    }));

    setMessageInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleAddReaction(messageId, emoji) {
    console.log("Add reaction:", messageId, emoji);
  }

  function handleRemoveReaction(messageId, emoji) {
    console.log("Remove reaction:", messageId, emoji);
  }

  function openChannel(channel) {
    setActiveChannelId(channel.id);
    setIsMobilePanelOpen(true);
  }

  return (
    <UserLayout
      showFloatingActions={false}
      contentClassName="!p-0 h-full overflow-hidden"
      contentInnerClassName="!max-w-none !w-full !m-0 h-full"
    >
      <div className="flex h-full w-full overflow-hidden bg-white">
        <aside
          className={`shrink-0 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white sm:flex sm:w-[22rem] ${isMobilePanelOpen ? "hidden" : "flex w-full"
            }`}
        >
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-gray-950">Channels</h2>
                <p className="mt-1 text-sm text-gray-500">Your joined channels</p>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
                aria-label="Channels workspace"
                title="Channels workspace"
              >
                <SquarePen className="size-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search channels"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="px-6 py-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  Your channels
                </h3>
                <span className="text-xs font-medium text-gray-400">{channels.length}</span>
              </div>

              <div className="space-y-2">
                {channelsQuery.isLoading ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    Loading your channels...
                  </div>
                ) : null}

                {channelsQuery.isError ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-600">
                    Unable to load your channels right now.
                  </div>
                ) : null}

                {!channelsQuery.isLoading && !channelsQuery.isError && !filteredChannels.length ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    No channels matched this search.
                  </div>
                ) : null}

                {filteredChannels.map((channel) => (
                  <ChannelSidebarItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannel?.id === channel.id}
                    onClick={() => openChannel(channel)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col bg-white ${isMobilePanelOpen ? "flex" : "hidden sm:flex"
            }`}
        >
          {activeChannel ? (
            <>
              <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setIsMobilePanelOpen(false)}
                      className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <ChatAvatar name={activeChannel.name} size="size-11" />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-950">
                        #{activeChannel.name}
                      </h3>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                        {activeChannel.visibilityLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center gap-6">
                  {["chat", "members", "team"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`border-b-2 pb-2 text-sm font-medium capitalize transition ${activeTab === tab
                        ? "border-brand-primary text-brand-primary"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white to-gray-50/60 px-4 py-6 sm:px-6 [scrollbar-width:thin]">
            {!activeChannel ? (
              <div className="flex min-h-[420px] h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand-primary">
                  <MessageSquare className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-950">Select a channel</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Pick a channel from the left to start messaging with your team.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((message, index) => {
                  const isMe = message.from === "me";
                  const previousMessage = currentMessages[index - 1];
                  const showAvatar = !isMe && previousMessage?.from !== "them";

                  return (
                    <div
                      key={message.id}
                      className={`group flex w-full items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe ? (
                        <div className="h-8 w-8 shrink-0">
                          {showAvatar ? (
                            <ChatAvatar name={activeChannel.name} size="size-8" />
                          ) : null}
                        </div>
                      ) : null}

                      <div className={`flex max-w-[72%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-[22px] px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm transition hover:shadow ${isMe
                            ? "rounded-br-md bg-brand-primary text-white"
                            : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
                            }`}
                        >
                          {message.text}
                        </div>

                        <div className={`mt-1 flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                          <span className="text-[11px] text-gray-400">{message.time}</span>
                          {isMe ? <CheckCheck className="size-3.5 text-brand-primary" /> : null}
                        </div>

                        {message.reactions?.length ? (
                          <div className={`mt-2 flex flex-wrap gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                            {message.reactions.map((reaction) => (
                              <button
                                key={`${message.id}-${reaction.emoji}`}
                                type="button"
                                onClick={() => handleRemoveReaction(message.id, reaction.emoji)}
                                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 shadow-sm"
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div
                          className={`mt-2 flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${isMe ? "justify-end" : "justify-start"
                            }`}
                        >
                          {["👍", "❤️", "😂"].map((emoji) => (
                            <button
                              key={`${message.id}-${emoji}-add`}
                              type="button"
                              onClick={() => handleAddReaction(message.id, emoji)}
                              className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {activeChannel ? (
            <ChatComposer
              isSending={false}
              messageInput={messageInput}
              onChange={(val) => setMessageInput(val)}
              onKeyDown={handleKeyDown}
              onSend={sendMessage}
            />
          ) : null}
        </section>
      </div>
    </UserLayout>
  );
}
