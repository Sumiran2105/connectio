import { useDeferredValue, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  CheckCheck,
  SquarePen,
  Plus as PlusIcon,
  ChevronLeft,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/client";
import { CHANNEL_MESSAGE, CHANNEL_MESSAGES, DM_SEND_MESSAGE, DM_USERS_SEARCH } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { UserLayout } from "../components/user-layout";

const chatStorageKey = "conectio-user-chat-state-v2";

const initialContacts = [];

function Avatar({ name, online, size = "size-10" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-pink-500", "bg-amber-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`relative shrink-0 ${size} rounded-full ${color} flex items-center justify-center font-bold text-white text-sm shadow-sm`}>
      {initials}
      {online && (
        <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}

function normalizeSearchResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.messages)) {
    return data.messages;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getMessageTimestamp(message) {
  const rawValue =
    message?.created_at ||
    message?.updated_at ||
    message?.createdAt ||
    message?.timestamp ||
    null;

  if (!rawValue) {
    return 0;
  }

  const value = new Date(rawValue).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function sortMessagesChronologically(messages = []) {
  return [...messages].sort((a, b) => {
    const first = a?.timestamp ?? 0;
    const second = b?.timestamp ?? 0;

    if (first !== second) {
      return first - second;
    }

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
}

function formatMessageTime(value) {
  if (!value) {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function normalizeServerMessage(message, currentUserId) {
  const senderId = message.user_id || message.sender_id || message.created_by;
  const isFromCurrentUser =
    currentUserId && senderId && String(senderId) === String(currentUserId);

  return {
    id: message.id || message.message_id || `${Date.now()}-${Math.random()}`,
    from: isFromCurrentUser ? "me" : "them",
    text: message.content || message.message || message.text || "",
    time: formatMessageTime(message.created_at || message.updated_at),
    timestamp: getMessageTimestamp(message),
    read: Boolean(message.is_read || message.read_at || message.delivered_at),
  };
}

function loadStoredChatState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(chatStorageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function mergeContacts(storedContacts = []) {
  const byId = new Map();

  storedContacts.forEach((contact) => {
    byId.set(String(contact.id), contact);
  });

  return Array.from(byId.values());
}

function getInitialContacts() {
  const stored = loadStoredChatState();
  return mergeContacts(stored?.contacts || []);
}

function getInitialConversations(contacts) {
  const stored = loadStoredChatState();
  return {
    ...(stored?.conversations || {}),
    ...Object.fromEntries(
      contacts.map((contact) => [
        contact.id,
        stored?.conversations?.[contact.id] || contact.messages || [],
      ])
    ),
  };
}

export function ChatPage() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();
  const [contacts, setContacts] = useState(() => getInitialContacts());
  const [activeContact, setActiveContact] = useState(() => getInitialContacts()[0] || null);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(() => getInitialConversations(getInitialContacts()));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const bottomRef = useRef(null);
  const searchInputRef = useRef(null);
  const deferredNewChatQuery = useDeferredValue(searchQuery.trim());

  const currentMessages = activeContact ? conversations[activeContact.id] || [] : [];

  const channelMessagesQuery = useQuery({
    queryKey: ["channel-messages", activeContact?.channelId, activeContact?.id],
    queryFn: async () => {
      const response = await apiClient.get(CHANNEL_MESSAGES(activeContact.channelId), {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return sortMessagesChronologically(
        normalizeCollection(response.data).map((message) =>
          normalizeServerMessage(message, session?.userId)
        )
      );
    },
    enabled: Boolean(session?.accessToken && activeContact?.channelId),
    staleTime: 10 * 1000,
  });

  const getMessageMutation = useMutation({
    mutationFn: async ({ channelId, messageId, targetUserId }) => {
      const response = await apiClient.get(CHANNEL_MESSAGE(channelId, messageId), {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const message = response.data?.message || response.data;

      return {
        raw: message,
        normalized: normalizeServerMessage(message, session?.userId || targetUserId),
      };
    },
    onSuccess: (data) => {
      setSelectedMessage(data);
    },
    onError: () => {
      toast.error("Unable to load message details right now.");
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ targetUserId, text }) => {
      const response = await apiClient.post(
        DM_SEND_MESSAGE(targetUserId),
        {
          content: text,
          content_type: "text",
        },
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      const sentAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const channelId = data?.channel_id || data?.channel?.id || data?.message?.channel_id || variables.channelId || null;
      const newMsg = data?.message
        ? normalizeServerMessage(data.message, session?.userId || variables.targetUserId)
        : {
            id: data?.id || data?.message_id || Date.now(),
            from: "me",
            text: data?.content || variables.text,
            time: formatMessageTime(data?.created_at) || sentAt,
            timestamp: getMessageTimestamp({
              created_at: data?.created_at || new Date().toISOString(),
            }),
            read: false,
          };

      setConversations((prev) => ({
        ...prev,
        [variables.targetUserId]: sortMessagesChronologically([
          ...(prev[variables.targetUserId] || []),
          newMsg,
        ]),
      }));

      setContacts((prev) => {
        return prev.map((contact) =>
          contact.id === variables.targetUserId
            ? {
                ...contact,
                channelId: channelId || contact.channelId,
                role: `You: ${variables.text}`,
                messages: sortMessagesChronologically([...(contact.messages || []), newMsg]),
              }
            : contact
        );
      });

      setActiveContact((current) =>
        current.id === variables.targetUserId
          ? {
              ...current,
              channelId: channelId || current.channelId,
              role: `You: ${variables.text}`,
              messages: sortMessagesChronologically([...(current.messages || []), newMsg]),
            }
          : current
      );

      setMessageInput("");

      if (channelId) {
        queryClient.invalidateQueries({
          queryKey: ["channel-messages", channelId, variables.targetUserId],
        });
      }
    },
    onError: () => {
      toast.error("Unable to send the message right now.");
    },
  });

  const searchUsersQuery = useQuery({
    queryKey: ["dm-users-search", deferredNewChatQuery],
    queryFn: async () => {
      const response = await apiClient.get(DM_USERS_SEARCH, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        params: {
          query: deferredNewChatQuery,
        },
      });

      return normalizeSearchResults(response.data);
    },
    enabled: Boolean(session?.accessToken) && deferredNewChatQuery.length > 1 && isNewChatMode,
    staleTime: 30 * 1000,
  });

  useEffect(() => {
    if (isNewChatMode) {
      searchInputRef.current?.focus();
    }
  }, [isNewChatMode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      chatStorageKey,
      JSON.stringify({
        contacts,
        conversations,
      })
    );
  }, [contacts, conversations]);

  useEffect(() => {
    if (!activeContact || !channelMessagesQuery.data?.length) {
      return;
    }

    setConversations((current) => ({
      ...current,
      [activeContact.id]: sortMessagesChronologically(channelMessagesQuery.data),
    }));

    setContacts((current) =>
      current.map((contact) =>
        contact.id === activeContact.id
          ? {
              ...contact,
              messages: sortMessagesChronologically(channelMessagesQuery.data),
              role:
                sortMessagesChronologically(channelMessagesQuery.data)[
                  sortMessagesChronologically(channelMessagesQuery.data).length - 1
                ]?.text || contact.role,
            }
          : contact
      )
    );
  }, [activeContact, channelMessagesQuery.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  function sendMessage() {
    const text = messageInput.trim();
    if (!text || !activeContact || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      targetUserId: activeContact.id,
      channelId: activeContact.channelId,
      text,
    });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openConversation(contact) {
    setActiveContact(contact);
    setIsMobileChatOpen(true);
    setIsNewChatMode(false);
    setSearchQuery("");
  }

  function handleSelectSearchUser(user) {
    const normalizedContact = {
      id: user.id || user.user_id || user.email,
      name: user.full_name || user.name || user.display_name || user.email || "Unknown user",
      role: user.email || user.user_role || "New conversation",
      online: Boolean(user.online || user.is_online || user.is_active),
      channelId: user.channel_id || user.dm_channel_id || user.direct_channel_id || null,
      unread: 0,
      messages: conversations[user.id || user.user_id || user.email] || [],
    };

    setContacts((current) => {
      const exists = current.find((item) => item.id === normalizedContact.id);
      if (exists) {
        return current;
      }

      return [normalizedContact, ...current];
    });

    setConversations((current) => ({
      ...current,
      [normalizedContact.id]: current[normalizedContact.id] || [],
    }));

    openConversation(normalizedContact);
  }

  function handleNewChatClick() {
    setIsNewChatMode(true);
    setSearchQuery("");
  }

  function handleMessageClick(message) {
    if (!activeContact?.channelId || !message?.id) {
      return;
    }

    getMessageMutation.mutate({
      channelId: activeContact.channelId,
      messageId: message.id,
      targetUserId: activeContact.id,
    });
  }

  const sidebarResults = isNewChatMode ? searchUsersQuery.data || [] : filteredContacts;

  return (
    <UserLayout>
      <div className="fixed top-20 bottom-0 left-0 lg:left-[72px] right-0 bg-white z-[20] flex flex-col overflow-hidden">
        <div className="flex w-full h-full gap-0 overflow-hidden bg-white">
          <aside className={`shrink-0 border-r border-gray-200 flex-col bg-gray-50 ${isMobileChatOpen ? "hidden sm:flex" : "flex w-full sm:w-80"}`}>
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    aria-label="New chat"
                    title="New chat"
                    onClick={handleNewChatClick}
                  >
                    <SquarePen className="size-5 text-gray-700" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={isNewChatMode ? "Search by user name or email" : "Search..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
              <div className="px-6 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    {isNewChatMode ? "Search results" : "Recent"}
                  </h3>
                  {isNewChatMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsNewChatMode(false);
                        setSearchQuery("");
                      }}
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      Cancel
                    </button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {isNewChatMode && deferredNewChatQuery.length <= 1 ? (
                    <div className="rounded-lg bg-white px-4 py-4 text-sm text-gray-500">
                      Type at least 2 characters to search for a person.
                    </div>
                  ) : null}

                  {isNewChatMode && deferredNewChatQuery.length > 1 && searchUsersQuery.isLoading ? (
                    <div className="flex items-center gap-3 rounded-lg bg-white px-4 py-4 text-sm text-gray-500">
                      <LoaderCircle className="size-4 animate-spin" />
                      Searching users
                    </div>
                  ) : null}

                  {isNewChatMode && deferredNewChatQuery.length > 1 && searchUsersQuery.isError ? (
                    <div className="rounded-lg bg-white px-4 py-4 text-sm text-rose-600">
                      Unable to search users right now.
                    </div>
                  ) : null}

                  {sidebarResults.map(contact => {
                    const contactId = contact.id || contact.user_id || contact.email;
                    const contactName = isNewChatMode
                      ? contact.full_name || contact.name || contact.display_name || "Unknown user"
                      : contact.name;
                    const contactSubtitle = isNewChatMode
                      ? contact.email || "No email available"
                      : contact.role;
                    const contactOnline = isNewChatMode
                      ? Boolean(contact.online || contact.is_online || contact.is_active)
                      : contact.online;
                    const isActive = activeContact?.id === contactId;
                    const contactMessages = conversations[contactId] || contact.messages || [];

                    return (
                      <button
                        key={contactId}
                        onClick={() =>
                          isNewChatMode ? handleSelectSearchUser(contact) : openConversation(contact)
                        }
                        className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-lg transition-all ${isActive
                          ? "bg-white shadow-sm"
                          : "hover:bg-white/50"
                          }`}
                      >
                        <Avatar name={contactName} online={contactOnline} size="size-10" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className={`text-sm font-bold truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                            {contactName}
                          </p>
                          <p className="text-xs text-gray-600 truncate">{contactSubtitle}</p>
                        </div>
                        {!isNewChatMode ? (
                          <p className="text-xs text-gray-500 shrink-0">
                            {contactMessages[contactMessages.length - 1]?.time}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}

                  {isNewChatMode &&
                  deferredNewChatQuery.length > 1 &&
                  !searchUsersQuery.isLoading &&
                  !searchUsersQuery.isError &&
                  !sidebarResults.length ? (
                    <div className="rounded-lg bg-white px-4 py-4 text-sm text-gray-500">
                      No users found for this search.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="p-6">
                <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <PlusIcon className="size-4" />
                  Invite to Connectio
                </button>
              </div>
            </div>
          </aside>

          <div className={`flex-1 flex-col min-w-0 bg-white ${isMobileChatOpen ? "flex" : "hidden sm:flex"}`}>
            {activeContact ? (
              <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white shrink-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="sm:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg text-gray-600"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <Avatar name={activeContact.name} online={activeContact.online} size="size-11" />
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{activeContact.name}</h3>
                    <p className="text-xs text-gray-600">{currentMessages.length} messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                    <Video className="size-5" />
                  </button>
                  <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                    <Phone className="size-5" />
                  </button>
                  <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                    <Search className="size-5" />
                  </button>
                  <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                    <MoreVertical className="size-5" />
                  </button>
                </div>
              </header>
            ) : null}

            {activeContact ? (
              <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-200 bg-gray-50">
                {["Chat", "Files", "Photos"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                      ? "text-brand-primary border-brand-primary"
                      : "text-gray-600 border-transparent hover:text-gray-900"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white [scrollbar-width:thin]">
              {!activeContact ? (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                    <SquarePen className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Start a conversation</h3>
                  <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Click the new chat icon, search for a user, and send your first message.
                  </p>
                </div>
              ) : null}

              {channelMessagesQuery.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                  <LoaderCircle className="size-4 animate-spin" />
                  Loading messages
                </div>
              ) : null}

              {currentMessages.map((msg, idx) => {
                const isMe = msg.from === "me";
                const prevMsg = currentMessages[idx - 1];
                const showAvatar = !isMe && prevMsg?.from !== "them";

                return (
                  <div key={msg.id} className={`flex w-full items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe ? (
                      <div className="h-8 w-8 shrink-0">
                        {showAvatar ? <Avatar name={activeContact.name} online={false} size="size-8" /> : null}
                      </div>
                    ) : null}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {msg.isFile ? (
                        <button
                          type="button"
                          onClick={() => handleMessageClick(msg)}
                          className={`min-w-[200px] rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-sm transition hover:shadow-md ${isMe
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white border-gray-300 text-gray-900"
                          }`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                              <Paperclip className="size-5" />
                            </div>
                            <span>{msg.text}</span>
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMessageClick(msg)}
                          className={`max-w-md rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm transition hover:shadow-md ${isMe
                            ? "bg-brand-primary text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 rounded-bl-none"
                            }`}
                        >
                          {msg.text}
                        </button>
                      )}
                      {isMe && msg.time && (
                        <div className="flex items-center gap-1 mt-1 flex-row-reverse">
                          <span className="text-[11px] text-gray-500">{msg.time}</span>
                          <CheckCheck className="size-3.5 text-brand-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {activeContact ? (
            <div className="shrink-0 pl-6 pr-24 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3 bg-gray-100 border border-gray-300 rounded-full px-4 py-3 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
                <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                  <Paperclip className="size-5" />
                </button>
                <textarea
                  rows={1}
                  value={messageInput}
                  onChange={e => {
                    setMessageInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message"
                  className="flex-1 bg-transparent border-none resize-none text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none leading-relaxed py-1 max-h-[100px] [scrollbar-width:thin]"
                />
                <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                  <Smile className="size-5" />
                </button>
                <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                  <PlusIcon className="size-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  className="shrink-0 size-9 flex items-center justify-center rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {sendMessageMutation.isPending ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <Send className="size-5" />
                  )}
                </button>
              </div>
            </div>
            ) : null}
          </div>
        </div>
      </div>
      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="rounded-[28px] border-brand-line bg-white">
          <DialogHeader>
            <DialogTitle className="text-brand-ink">Message details</DialogTitle>
            <DialogDescription>
              Loaded from the single message endpoint for the active channel.
            </DialogDescription>
          </DialogHeader>

          {selectedMessage ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-brand-line bg-brand-neutral p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Content
                </p>
                <p className="mt-2 text-sm text-brand-ink">{selectedMessage.normalized.text || "No content"}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-brand-line bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                    Message ID
                  </p>
                  <p className="mt-2 break-all text-sm text-brand-ink">{selectedMessage.normalized.id}</p>
                </div>
                <div className="rounded-2xl border border-brand-line bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                    Time
                  </p>
                  <p className="mt-2 text-sm text-brand-ink">{selectedMessage.normalized.time}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
