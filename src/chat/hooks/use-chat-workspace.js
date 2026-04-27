import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  CHANNEL_MARK_READ,
  CHANNEL_MESSAGE,
  CHANNEL_MESSAGES,
  CHANNEL_UNREAD_COUNT,
  CHAT_WEBSOCKET,
  DM_CHANNELS,
  DM_SEND_MESSAGE,
  DM_USERS_SEARCH,
  MESSAGE_BULK_READ,
  MESSAGE_MARK_READ,
  MESSAGE_REACTION,
  MESSAGE_REACTIONS,
  MESSAGE_READ_STATUS,
  PRESENCE_USER,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { formatStatusLabel, normalizePresence } from "@/features/user-dashboard/components/presence-panel";
import {
  formatMessageTime,
  getChatStorageKey,
  getInitialChatState,
  getMessageTimestamp,
  mergeMessages,
  normalizeCollection,
  normalizeDmChannels,
  normalizeReadStatus,
  normalizeSearchResults,
  normalizeServerMessage,
  sortMessagesChronologically,
} from "../utils/chat-utils";

function normalizeContactId(contact) {
  if (!contact) return null;

  const id = contact.id || contact.user_id || contact.email;
  if (!id) return null;

  return {
    ...contact,
    id,
  };
}

export function useChatWorkspace() {
  const session = useAuthStore((state) => state.session);
  const queryClient = useQueryClient();
  const chatStorageKey = getChatStorageKey(session);
  const initialChatState = () => getInitialChatState(chatStorageKey);
  const [contacts, setContacts] = useState(() => initialChatState().contacts);
  const [activeContact, setActiveContact] = useState(() => initialChatState().activeContact);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(() => initialChatState().conversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isNewChatMode, setIsNewChatMode] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const bottomRef = useRef(null);
  const searchInputRef = useRef(null);
  const chatSocketRef = useRef(null);
  const lastBulkReadKeyRef = useRef(null);
  const deferredNewChatQuery = useDeferredValue(searchQuery.trim());

  const currentMessages = activeContact ? conversations[activeContact.id] || [] : [];

  const dmChannelsQuery = useQuery({
    queryKey: ["dm-channels", session?.accessToken, session?.userId],
    queryFn: async () => {
      const response = await apiClient.get(DM_CHANNELS, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return normalizeDmChannels(response.data);
    },
    enabled: Boolean(session?.accessToken),
    staleTime: 10 * 1000,
  });

  const channelMessagesQuery = useQuery({
    queryKey: ["channel-messages", activeContact?.channelId, activeContact?.id],
    queryFn: async () => {
      const response = await apiClient.get(CHANNEL_MESSAGES(activeContact.channelId), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return sortMessagesChronologically(
        normalizeCollection(response.data).map((message) =>
          normalizeServerMessage(message, session?.userId, activeContact?.id)
        )
      );
    },
    enabled: Boolean(session?.accessToken && activeContact?.channelId),
    staleTime: 10 * 1000,
  });

  const activePresenceQuery = useQuery({
    queryKey: ["presence-user", activeContact?.id],
    queryFn: async () => {
      const response = await apiClient.get(PRESENCE_USER(activeContact.id), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return normalizePresence(response.data);
    },
    enabled: Boolean(session?.accessToken && activeContact?.id),
    staleTime: 15 * 1000,
  });

  const unreadCountQueries = useQueries({
    queries: contacts
      .filter((contact) => contact.channelId)
      .map((contact) => ({
        queryKey: ["channel-unread-count", contact.channelId, contact.id],
        queryFn: async () => {
          const response = await apiClient.get(CHANNEL_UNREAD_COUNT(contact.channelId), {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });

          return response.data?.unread_messages ?? 0;
        },
        enabled: Boolean(session?.accessToken && contact.channelId),
        staleTime: 5 * 1000,
      })),
  });

  const unreadCountsByContactId = contacts.reduce((acc, contact, index) => {
    acc[contact.id] = unreadCountQueries[index]?.data ?? 0;
    return acc;
  }, {});

  const pendingCountsByContactId = contacts.reduce((acc, contact) => {
    if (activeContact?.id === contact.id) {
      acc[contact.id] = 0;
      return acc;
    }

    const conversation = conversations[contact.id] || contact.messages || [];
    const pendingCount = conversation.filter(
      (message) => message.from === "them" && !message.read
    ).length;

    acc[contact.id] = conversation.length > 0
      ? pendingCount
      : unreadCountsByContactId[contact.id] || 0;

    return acc;
  }, {});

  const messageReactionQueries = useQueries({
    queries: currentMessages
      .filter((message) => message.id)
      .map((message) => ({
        queryKey: ["message-reactions", message.id],
        queryFn: async () => {
          const response = await apiClient.get(MESSAGE_REACTIONS(message.id), {
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          });

          return normalizeCollection(response.data);
        },
        enabled: Boolean(session?.accessToken && message.id),
        staleTime: 10 * 1000,
      })),
  });

  const reactionsByMessageId = currentMessages.reduce((acc, message, index) => {
    acc[message.id] = messageReactionQueries[index]?.data || [];
    return acc;
  }, {});

  const getMessageMutation = useMutation({
    mutationFn: async ({ channelId, messageId, targetUserId }) => {
      const response = await apiClient.get(CHANNEL_MESSAGE(channelId, messageId), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const message = response.data?.message || response.data;

      return {
        raw: message,
        normalized: normalizeServerMessage(message, session?.userId, targetUserId),
      };
    },
    onSuccess: setSelectedMessage,
    onError: () => toast.error("Unable to load message details right now."),
  });

  const selectedMessageReadStatusQuery = useQuery({
    queryKey: ["message-read-status", selectedMessage?.normalized?.id],
    queryFn: async () => {
      const response = await apiClient.get(MESSAGE_READ_STATUS(selectedMessage.normalized.id), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return normalizeReadStatus(response.data);
    },
    enabled: Boolean(session?.accessToken && selectedMessage?.normalized?.id),
  });

  const selectedMessageReactionsQuery = useQuery({
    queryKey: ["message-reactions", selectedMessage?.normalized?.id, "dialog"],
    queryFn: async () => {
      const response = await apiClient.get(MESSAGE_REACTIONS(selectedMessage.normalized.id), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return normalizeCollection(response.data);
    },
    enabled: Boolean(session?.accessToken && selectedMessage?.normalized?.id),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ targetUserId, channelId, text }) => {
      const endpoint = channelId ? CHANNEL_MESSAGES(channelId) : DM_SEND_MESSAGE(targetUserId);
      const response = await apiClient.post(
        endpoint,
        { content: text, content_type: "text" },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );

      return response.data;
    },
    onSuccess: (data, variables) => {
      const sentAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const channelId =
        data?.channel_id ||
        data?.channel?.id ||
        data?.message?.channel_id ||
        variables.channelId ||
        null;
      const newMessage = data?.message
        ? normalizeServerMessage(data.message, session?.userId, variables.targetUserId)
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

      setConversations((current) => ({
        ...current,
        [variables.targetUserId]: mergeMessages(current[variables.targetUserId] || [], [newMessage]),
      }));

      setContacts((current) =>
        current.map((contact) =>
          contact.id === variables.targetUserId
            ? {
                ...contact,
                channelId: channelId || contact.channelId,
                role: `You: ${variables.text}`,
                messages: mergeMessages(contact.messages || [], [newMessage]),
              }
            : contact
        )
      );

      setActiveContact((current) =>
        current?.id === variables.targetUserId
          ? {
              ...current,
              channelId: channelId || current.channelId,
              role: `You: ${variables.text}`,
              messages: mergeMessages(current.messages || [], [newMessage]),
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
    onError: () => toast.error("Unable to send the message right now."),
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      const response = await apiClient.post(
        MESSAGE_REACTIONS(messageId),
        { emoji },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId, "dialog"] });
    },
    onError: () => toast.error("Unable to add reaction right now."),
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      const response = await apiClient.delete(MESSAGE_REACTION(messageId, emoji), {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId] });
      queryClient.invalidateQueries({ queryKey: ["message-reactions", variables.messageId, "dialog"] });
    },
    onError: () => toast.error("Unable to remove reaction right now."),
  });

  const markMessageReadMutation = useMutation({
    mutationFn: async (messageId) => {
      const response = await apiClient.post(MESSAGE_MARK_READ(messageId), null, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return response.data;
    },
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ["message-read-status", messageId] });

      if (activeContact?.channelId) {
        queryClient.invalidateQueries({
          queryKey: ["channel-unread-count", activeContact.channelId, activeContact.id],
        });
      }
    },
  });

  const bulkReadMutation = useMutation({
    mutationFn: async (messageIds) => {
      const response = await apiClient.post(MESSAGE_BULK_READ, messageIds, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });

      return response.data;
    },
    onSuccess: (_, messageIds) => {
      if (!activeContact) return;

      setConversations((current) => ({
        ...current,
        [activeContact.id]: (current[activeContact.id] || []).map((message) =>
          messageIds.includes(message.id) ? { ...message, read: true } : message
        ),
      }));

      setContacts((current) =>
        current.map((contact) =>
          contact.id === activeContact.id
            ? {
                ...contact,
                messages: (contact.messages || []).map((message) =>
                  messageIds.includes(message.id) ? { ...message, read: true } : message
                ),
              }
            : contact
        )
      );

      messageIds.forEach((messageId) => {
        queryClient.invalidateQueries({ queryKey: ["message-read-status", messageId] });
      });

      if (activeContact.channelId) {
        queryClient.invalidateQueries({
          queryKey: ["channel-unread-count", activeContact.channelId, activeContact.id],
        });
      }
    },
  });

  const markChannelReadMutation = useMutation({
    mutationFn: async ({ channelId, messageId }) => {
      const response = await apiClient.post(CHANNEL_MARK_READ(channelId), null, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { message_id: messageId },
      });

      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["channel-unread-count", variables.channelId, activeContact?.id],
      });
    },
  });

  const searchUsersQuery = useQuery({
    queryKey: ["dm-users-search", deferredNewChatQuery],
    queryFn: async () => {
      const response = await apiClient.get(DM_USERS_SEARCH, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
        params: { query: deferredNewChatQuery },
      });

      return normalizeSearchResults(response.data);
    },
    enabled: Boolean(session?.accessToken) && deferredNewChatQuery.length > 1 && isNewChatMode,
    staleTime: 30 * 1000,
  });

  const sidebarResults = useMemo(
    () =>
      isNewChatMode
        ? searchUsersQuery.data || []
        : contacts.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
    [contacts, isNewChatMode, searchQuery, searchUsersQuery.data]
  );

  const activePresenceLabel = activePresenceQuery.data?.customStatus
    ? `${activePresenceQuery.data.customStatus.emoji || ""} ${activePresenceQuery.data.customStatus.text || ""}`.trim()
    : formatStatusLabel(activePresenceQuery.data?.status || (activeContact?.online ? "online" : "offline"));

  useEffect(() => {
    if (isNewChatMode) {
      searchInputRef.current?.focus();
    }
  }, [isNewChatMode]);

  useEffect(() => {
    if (typeof window === "undefined" || !chatStorageKey) return;

    window.localStorage.setItem(chatStorageKey, JSON.stringify({ contacts, conversations }));
  }, [chatStorageKey, contacts, conversations]);

  useEffect(() => {
    const nextState = getInitialChatState(chatStorageKey);

    setContacts(nextState.contacts);
    setActiveContact(nextState.activeContact);
    setConversations(nextState.conversations);
  }, [chatStorageKey]);

  useEffect(() => {
    if (!dmChannelsQuery.data?.length) return;

    setContacts((current) => {
      const currentById = new Map(current.map((contact) => [String(contact.id), contact]));
      const backendContacts = dmChannelsQuery.data.map((channel) => {
        const existing = currentById.get(String(channel.user_id));
        const existingMessages = existing?.messages || conversations[channel.user_id] || [];

        return normalizeContactId({
          id: channel.user_id,
          name: channel.name || existing?.name || "Unknown user",
          role: existingMessages[existingMessages.length - 1]?.text || existing?.role || "Conversation",
          online: existing?.online || false,
          channelId: channel.channel_id,
          unread: 0,
          messages: existingMessages,
        });
      });
      const merged = new Map();

      backendContacts.forEach((contact) => {
        merged.set(String(contact.id), contact);
      });

      current.forEach((contact) => {
        const key = String(contact.id);
        const existing = merged.get(key);

        merged.set(
          key,
          existing
            ? {
                ...contact,
                ...existing,
                role: existing.role || contact.role,
                messages: mergeMessages(contact.messages || [], existing.messages || []),
              }
            : contact
        );
      });

      return Array.from(merged.values());
    });

    setConversations((current) => {
      const next = { ...current };

      dmChannelsQuery.data.forEach((channel) => {
        next[channel.user_id] = current[channel.user_id] || [];
      });

      return next;
    });

    setActiveContact((current) => {
      const refreshedContacts = dmChannelsQuery.data.map((channel) =>
        normalizeContactId({
          id: channel.user_id,
          name: channel.name || "Unknown user",
          channelId: channel.channel_id,
        })
      );

      if (current) {
        const refreshed = refreshedContacts.find((contact) => contact.id === current.id);
        return refreshed ? { ...current, ...refreshed } : current;
      }

      return refreshedContacts[0] || null;
    });
  }, [dmChannelsQuery.data]);

  useEffect(() => {
    if (!activeContact || !channelMessagesQuery.data?.length) return;

    setConversations((current) => ({
      ...current,
      [activeContact.id]: mergeMessages(current[activeContact.id] || [], channelMessagesQuery.data),
    }));

    setContacts((current) =>
      current.map((contact) => {
        if (contact.id !== activeContact.id) return contact;

        const messages = mergeMessages(contact.messages || [], channelMessagesQuery.data);

        return {
          ...contact,
          messages,
          role: messages[messages.length - 1]?.text || contact.role,
        };
      })
    );
  }, [activeContact, channelMessagesQuery.data]);

  useEffect(() => {
    if (!activeContact?.channelId || !currentMessages.length) {
      lastBulkReadKeyRef.current = null;
      return;
    }

    const unreadIncomingMessages = currentMessages.filter(
      (message) => message.from === "them" && !message.read && message.id
    );

    if (!unreadIncomingMessages.length) return;

    const messageIds = unreadIncomingMessages.map((message) => message.id);
    const readKey = `${activeContact.channelId}:${messageIds.join(",")}`;

    if (lastBulkReadKeyRef.current === readKey || bulkReadMutation.isPending) return;

    lastBulkReadKeyRef.current = readKey;
    bulkReadMutation.mutate(messageIds);

    const latestMessage = unreadIncomingMessages[unreadIncomingMessages.length - 1];

    if (latestMessage?.id) {
      markChannelReadMutation.mutate({
        channelId: activeContact.channelId,
        messageId: latestMessage.id,
      });
    }
  }, [
    activeContact?.channelId,
    currentMessages,
    bulkReadMutation,
    markChannelReadMutation,
  ]);

  useEffect(() => {
    if (!activeContact?.channelId || !session?.accessToken) return undefined;

    const socketUrl = CHAT_WEBSOCKET(activeContact.channelId);

    if (!socketUrl) return undefined;

    const socket = new WebSocket(socketUrl);
    let disposed = false;
    chatSocketRef.current = socket;

    socket.onopen = () => {
      if (disposed) {
        socket.close();
      }
    };

    socket.onmessage = async (event) => {
      try {
        const rawPayload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (!rawPayload) return;

        if (rawPayload.message_id && rawPayload.channel_id === activeContact.channelId) {
          const response = await apiClient.get(
            CHANNEL_MESSAGE(activeContact.channelId, rawPayload.message_id),
            { headers: { Authorization: `Bearer ${session.accessToken}` } }
          );
          applyIncomingMessage(response.data?.message || response.data);
          return;
        }

        applyIncomingMessage(rawPayload?.message || rawPayload);
      } catch {
        return;
      }
    };

    socket.onerror = () => undefined;

    return () => {
      disposed = true;

      if (chatSocketRef.current === socket) {
        chatSocketRef.current = null;
      }

      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [activeContact?.channelId, activeContact?.id, session?.accessToken, session?.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  function applyIncomingMessage(rawMessage) {
    const normalizedMessage = normalizeServerMessage(rawMessage, session.userId, activeContact.id);

    setConversations((current) => ({
      ...current,
      [activeContact.id]: mergeMessages(current[activeContact.id] || [], [normalizedMessage]),
    }));

    setContacts((current) =>
      current.map((contact) =>
        contact.id === activeContact.id
          ? {
              ...contact,
              messages: mergeMessages(contact.messages || [], [normalizedMessage]),
              role: normalizedMessage.text || contact.role,
            }
          : contact
      )
    );

    setActiveContact((current) =>
      current?.id === activeContact.id
        ? {
            ...current,
            messages: mergeMessages(current.messages || [], [normalizedMessage]),
            role: normalizedMessage.text || current.role,
          }
        : current
    );
  }

  function sendMessage() {
    const text = messageInput.trim();

    if (!text || !activeContact || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      targetUserId: activeContact.id,
      channelId: activeContact.channelId,
      text,
    });
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function handleInputChange(event) {
    setMessageInput(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  }

  function openConversation(contact) {
    const normalizedContact = normalizeContactId(contact);

    if (!normalizedContact) return;

    const nextMessages = (conversations[normalizedContact.id] || normalizedContact.messages || []).map((message) =>
      message.from === "them" ? { ...message, read: true } : message
    );

    setConversations((current) => ({ ...current, [normalizedContact.id]: nextMessages }));
    setContacts((current) =>
      current.map((item) =>
        item.id === normalizedContact.id ? { ...item, messages: nextMessages } : item
      )
    );

    if (normalizedContact.channelId) {
      queryClient.setQueryData(["channel-unread-count", normalizedContact.channelId, normalizedContact.id], 0);
    }

    setActiveContact(normalizedContact);
    setIsMobileChatOpen(true);
    setIsNewChatMode(false);
    setSearchQuery("");
  }

  function handleSelectSearchUser(user) {
    const contactId = user.id || user.user_id || user.email;
    const normalizedContact = normalizeContactId({
      id: contactId,
      name: user.full_name || user.name || user.display_name || user.email || "Unknown user",
      role: user.email || user.user_role || "New conversation",
      online: Boolean(user.online || user.is_online || user.is_active),
      channelId: user.channel_id || user.dm_channel_id || user.direct_channel_id || null,
      unread: 0,
      messages: conversations[contactId] || [],
    });

    if (!normalizedContact) return;

    setContacts((current) =>
      current.some((item) => item.id === normalizedContact.id)
        ? current
        : [normalizedContact, ...current]
    );

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
    if (!activeContact?.channelId || !message?.id) return;

    if (message.from === "them" && !message.read) {
      markMessageReadMutation.mutate(message.id);
    }

    getMessageMutation.mutate({
      channelId: activeContact.channelId,
      messageId: message.id,
      targetUserId: activeContact.id,
    });
  }

  return {
    activeContact,
    activePresenceLabel,
    activeTab,
    bottomRef,
    contacts,
    conversations,
    currentMessages,
    deferredNewChatQuery,
    isMobileChatOpen,
    isNewChatMode,
    messageInput,
    pendingCountsByContactId,
    reactionsByMessageId,
    searchInputRef,
    searchQuery,
    searchUsersQuery,
    selectedMessage,
    selectedMessageReactionsQuery,
    selectedMessageReadStatusQuery,
    sendMessageMutation,
    sidebarResults,
    addReaction: (messageId, emoji) => addReactionMutation.mutate({ messageId, emoji }),
    cancelSearch: () => {
      setIsNewChatMode(false);
      setSearchQuery("");
    },
    handleInputChange,
    handleKeyDown,
    handleMessageClick,
    handleNewChatClick,
    handleSelectSearchUser,
    openConversation,
    removeReaction: (messageId, emoji) => removeReactionMutation.mutate({ messageId, emoji }),
    sendMessage,
    setActiveTab,
    setIsMobileChatOpen,
    setSearchQuery,
    setSelectedMessage,
    isLoadingMessages: channelMessagesQuery.isLoading,
  };
}
