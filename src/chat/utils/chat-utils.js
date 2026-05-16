import {
  formatPlatformDateTime,
  formatPlatformTime,
  getPlatformTimestamp,
} from "@/lib/date-time";

const chatStorageKeyPrefix = "conectio-user-chat-state-v5";

export function normalizeSearchResults(data) {
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

export function normalizeDmChannels(data) {
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

export function normalizeCollection(data) {
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

export function normalizeReadStatus(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.reads)) {
    return data.reads;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export function getMessageTimestamp(message) {
  const rawValue =
    message?.created_at ||
    message?.sent_at ||
    message?.created_on ||
    message?.updated_at ||
    message?.createdAt ||
    message?.sentAt ||
    message?.timestamp ||
    null;

  return getPlatformTimestamp(rawValue);
}

export function sortMessagesChronologically(messages = []) {
  return [...messages].sort((a, b) => {
    const first = a?.timestamp ?? 0;
    const second = b?.timestamp ?? 0;

    if (first !== second) {
      return first - second;
    }

    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
}

export function isDeletedMessage(message) {
  return Boolean(message?.isDeleted || message?.is_deleted || message?.deleted_at);
}

export function mergeMessages(existing = [], incoming = []) {
  const byId = new Map();

  existing.forEach((message) => {
    if (!message?.id) {
      return;
    }

    byId.set(String(message.id), message);
  });

  incoming.forEach((message) => {
    if (!message?.id) {
      return;
    }

    const messageId = String(message.id);

    if (isDeletedMessage(message)) {
      byId.delete(messageId);
      return;
    }

    byId.set(messageId, message);
  });

  return sortMessagesChronologically(Array.from(byId.values()));
}

export function formatMessageTime(value) {
  if (!value) {
    return formatPlatformTime();
  }

  return formatPlatformTime(value);
}

export function formatMessageDateTime(value) {
  return formatPlatformDateTime(value || Date.now());
}

export function normalizeServerMessage(message, currentUserId, peerUserId = null) {
  const senderIdentifiers = [
    message.user_id ||
    message.sender_id ||
    message.sender?.id ||
    message.sender?.user_id ||
    message.user?.id ||
    message.user?.user_id ||
    message.author_id ||
    message.created_by_id ||
    message.created_by,
    message.email,
    message.user_email,
    message.sender_email,
    message.sender?.email,
    message.user?.email,
    message.created_by_email,
  ].filter(Boolean);
  const currentUserIdentifiers = Array.isArray(currentUserId)
    ? currentUserId.filter(Boolean).map(String)
    : [currentUserId].filter(Boolean).map(String);
  const peerIdentifiers = Array.isArray(peerUserId)
    ? peerUserId.filter(Boolean).map(String)
    : [peerUserId].filter(Boolean).map(String);
  const explicitFromCurrentUser =
    message.is_own || message.is_mine || message.from_me || message.is_sender;
  const matchesCurrentUser = senderIdentifiers.some((id) =>
    currentUserIdentifiers.includes(String(id))
  );
  const matchesPeer = senderIdentifiers.some((id) => peerIdentifiers.includes(String(id)));
  const isFromCurrentUser =
    explicitFromCurrentUser ||
    (currentUserIdentifiers.length && senderIdentifiers.length
      ? matchesCurrentUser
      : peerIdentifiers.length && senderIdentifiers.length
        ? !matchesPeer
        : false);

  const isRead = Boolean(message.is_read || message.read_at || message.seen_at);
  const isDelivered = Boolean(
    isRead ||
      message.is_delivered ||
      message.delivered ||
      message.delivered_at ||
      message.delivery_status === "delivered" ||
      message.delivery_status === "read"
  );

  return {
    id: message.id || message.message_id || `${Date.now()}-${Math.random()}`,
    from: isFromCurrentUser ? "me" : "them",
    text: message.content || message.message || message.text || "",
    time: formatMessageDateTime(
      message.created_at ||
        message.sent_at ||
        message.created_on ||
        message.updated_at ||
        message.createdAt ||
        message.sentAt ||
        message.timestamp
    ),
    timestamp: getMessageTimestamp(message),
    delivered: isDelivered,
    read: isRead,
    pinned: Boolean(message.is_pinned),
    isDeleted: isDeletedMessage(message),
    reactions: normalizeCollection(message.reactions),
    raw: message,
  };
}

export function getJwtPayload(token) {
  if (!token || typeof window === "undefined") {
    return {};
  }

  try {
    const [, payload] = String(token).split(".");
    if (!payload) return {};

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return {};
  }
}

export function getSessionUserIdentifiers(session) {
  const tokenPayload = getJwtPayload(session?.accessToken);

  return Array.from(
    new Set(
      [
        session?.userId,
        session?.user_id,
        session?.id,
        session?.email,
        tokenPayload?.sub,
        tokenPayload?.user_id,
        tokenPayload?.id,
        tokenPayload?.email,
      ]
        .filter(Boolean)
        .map(String)
    )
  );
}

export function getChatStorageKey(session) {
  const identity = session?.userId || session?.email;

  if (!identity) {
    return null;
  }

  return `${chatStorageKeyPrefix}-${identity}`;
}

export function loadStoredChatState(storageKey) {
  if (typeof window === "undefined" || !storageKey) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function hydrateStoredMessage(message) {
  if (!message || typeof message !== "object") {
    return message;
  }

  const timestamp =
    message.timestamp ||
    message.raw?.created_at ||
    message.raw?.sent_at ||
    message.raw?.created_on ||
    message.raw?.updated_at ||
    message.raw?.createdAt ||
    message.raw?.sentAt;

  if (!timestamp) {
    return message;
  }

  return {
    ...message,
    time: formatMessageDateTime(timestamp),
    timestamp: getPlatformTimestamp(timestamp) || message.timestamp,
  };
}

function hydrateStoredMessages(messages = []) {
  return Array.isArray(messages) ? messages.map(hydrateStoredMessage) : [];
}

export function mergeContacts(storedContacts = []) {
  const byId = new Map();

  storedContacts.forEach((contact) => {
    byId.set(String(contact.id), {
      ...contact,
      messages: hydrateStoredMessages(contact.messages),
    });
  });

  return Array.from(byId.values());
}

export function getInitialContacts(storageKey) {
  const stored = loadStoredChatState(storageKey);
  return mergeContacts(stored?.contacts || []);
}

export function getInitialConversations(contacts, storageKey) {
  const stored = loadStoredChatState(storageKey);

  return {
    ...(stored?.conversations || {}),
    ...Object.fromEntries(
      contacts.map((contact) => [
        contact.id,
        hydrateStoredMessages(stored?.conversations?.[contact.id] || contact.messages || []),
      ])
    ),
  };
}

export function getInitialChatState(storageKey) {
  const contacts = getInitialContacts(storageKey);

  return {
    contacts,
    activeContact: contacts[0] || null,
    conversations: getInitialConversations(contacts, storageKey),
  };
}
