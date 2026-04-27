import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  CHANNEL_MESSAGE,
  CHANNEL_MESSAGES,
  CHAT_WEBSOCKET,
  MESSAGE_REACTION,
  MESSAGE_REACTIONS,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import {
  mergeMessages,
  normalizeCollection,
  normalizeServerMessage,
  sortMessagesChronologically,
} from "@/chat/utils/chat-utils";

function normalizeChannelMessages(data, currentUserId) {
  return sortMessagesChronologically(
    normalizeCollection(data).map((message) => normalizeServerMessage(message, currentUserId))
  );
}

function applyReaction(messages, messageId, emoji, delta) {
  return messages.map((message) => {
    if (String(message.id) !== String(messageId)) {
      return message;
    }

    const currentReactions = Array.isArray(message.reactions) ? message.reactions : [];
    const existingReaction = currentReactions.find((reaction) => reaction.emoji === emoji);

    if (!existingReaction && delta < 0) {
      return message;
    }

    if (!existingReaction) {
      return {
        ...message,
        reactions: [...currentReactions, { emoji, count: 1 }],
      };
    }

    const nextReactions = currentReactions
      .map((reaction) =>
        reaction.emoji === emoji
          ? { ...reaction, count: Math.max(0, Number(reaction.count || 0) + delta) }
          : reaction
      )
      .filter((reaction) => reaction.count > 0);

    return {
      ...message,
      reactions: nextReactions,
    };
  });
}

export function useChannelMessages({ channelId, accessToken, currentUserId, enabled = true }) {
  const queryClient = useQueryClient();
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const hydratedChannelIdRef = useRef(null);
  const fetchedMessageIdsRef = useRef(new Set());
  const [messages, setMessages] = useState([]);

  const canLoad = useMemo(
    () => Boolean(enabled && channelId && accessToken),
    [accessToken, channelId, enabled]
  );
  const queryKey = useMemo(
    () => ["shared-channel-messages", channelId, currentUserId],
    [channelId, currentUserId]
  );

  const messagesQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get(CHANNEL_MESSAGES(channelId), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return normalizeChannelMessages(response.data, currentUserId);
    },
    enabled: canLoad,
    staleTime: 10 * 1000,
  });

  useEffect(() => {
    if (!canLoad) {
      hydratedChannelIdRef.current = null;
      fetchedMessageIdsRef.current = new Set();
      setMessages([]);
      return;
    }

    if (!messagesQuery.data) {
      return;
    }

    if (hydratedChannelIdRef.current !== channelId) {
      hydratedChannelIdRef.current = channelId;
      fetchedMessageIdsRef.current = new Set(messagesQuery.data.map((message) => String(message.id)));
      setMessages(messagesQuery.data);
      return;
    }

    setMessages((current) => mergeMessages(current, messagesQuery.data));
  }, [canLoad, channelId, messagesQuery.data]);

  const syncQueryCache = useCallback(
    (updater) => {
      queryClient.setQueryData(queryKey, (current = []) => {
        const nextValue = typeof updater === "function" ? updater(current) : updater;
        return sortMessagesChronologically(nextValue);
      });
    },
    [queryClient, queryKey]
  );

  const sendMessageMutation = useMutation({
    mutationFn: async (text) => {
      const response = await apiClient.post(
        CHANNEL_MESSAGES(channelId),
        {
          content: text,
          content_type: "text",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data?.message || response.data;
    },
    onSuccess: (message) => {
      const normalizedMessage = normalizeServerMessage(message, currentUserId);
      fetchedMessageIdsRef.current.add(String(normalizedMessage.id));
      setMessages((current) => mergeMessages(current, [normalizedMessage]));
      syncQueryCache((current) => mergeMessages(current, [normalizedMessage]));
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.detail || error.response?.data?.message || "Unable to send the message right now."
      );
    },
  });

  const addReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      await apiClient.post(
        MESSAGE_REACTIONS(messageId),
        { emoji },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return { messageId, emoji };
    },
    onSuccess: ({ messageId, emoji }) => {
      setMessages((current) => applyReaction(current, messageId, emoji, 1));
      syncQueryCache((current) => applyReaction(current, messageId, emoji, 1));
    },
    onError: () => {
      toast.error("Unable to add reaction right now.");
    },
  });

  const removeReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }) => {
      await apiClient.delete(MESSAGE_REACTION(messageId, emoji), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return { messageId, emoji };
    },
    onSuccess: ({ messageId, emoji }) => {
      setMessages((current) => applyReaction(current, messageId, emoji, -1));
      syncQueryCache((current) => applyReaction(current, messageId, emoji, -1));
    },
    onError: () => {
      toast.error("Unable to remove reaction right now.");
    },
  });

  useEffect(() => {
    if (!canLoad) {
      return undefined;
    }

    const socketUrl = CHAT_WEBSOCKET(channelId);

    if (!socketUrl) {
      return undefined;
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onmessage = async (event) => {
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (!payload) {
          return;
        }

        if (payload.message_id && payload.channel_id === channelId) {
          const messageId = String(payload.message_id);

          if (fetchedMessageIdsRef.current.has(messageId)) {
            return;
          }

          const response = await apiClient.get(CHANNEL_MESSAGE(channelId, payload.message_id), {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          const fetchedMessage = response.data?.message || response.data;
          const normalizedMessage = normalizeServerMessage(fetchedMessage, currentUserId);
          fetchedMessageIdsRef.current.add(messageId);
          setMessages((current) => mergeMessages(current, [normalizedMessage]));
          syncQueryCache((current) => mergeMessages(current, [normalizedMessage]));
          return;
        }

        const normalizedMessage = normalizeServerMessage(payload?.message || payload, currentUserId);
        fetchedMessageIdsRef.current.add(String(normalizedMessage.id));
        setMessages((current) => mergeMessages(current, [normalizedMessage]));
        syncQueryCache((current) => mergeMessages(current, [normalizedMessage]));
      } catch {
        return;
      }
    };

    socket.onerror = () => undefined;

    return () => {
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [accessToken, canLoad, channelId, currentUserId, syncQueryCache]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: messages.length > 12 ? "auto" : "smooth",
      block: "end",
    });
  }, [messages]);

  return {
    messages,
    bottomRef,
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending,
    sendMessage: useCallback((text) => sendMessageMutation.mutate(text), [sendMessageMutation]),
    addReaction: useCallback(
      (messageId, emoji) => addReactionMutation.mutate({ messageId, emoji }),
      [addReactionMutation]
    ),
    removeReaction: useCallback(
      (messageId, emoji) => removeReactionMutation.mutate({ messageId, emoji }),
      [removeReactionMutation]
    ),
  };
}
