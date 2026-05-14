import { memo, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCheck,
  ChevronLeft,
  Eye,
  Forward,
  Hash,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Pin,
  PinOff,
  Trash2,
  Users2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatAvatar } from "@/chat/components/chat-avatar";
import { getUserId, getUserAvatar, getUserName, parseMentions } from "@/channels/utils/channel-utils";
import { EmojiPicker } from "./emoji-picker";

const MESSAGE_RENDER_BATCH_SIZE = 120;
const QUICK_REACTIONS = ["👍", "❤️", "😂"];

/**
 * Component to render message text with formatted mentions
 */
const FormattedMessageText = memo(function FormattedMessageText({ text }) {
  const parts = useMemo(() => parseMentions(text), [text]);

  return (
    <>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <strong key={`mention-${index}`} className="font-bold">
              {part.content}
            </strong>
          );
        }
        return <span key={`text-${index}`}>{part.content}</span>;
      })}
    </>
  );
});

const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  showAvatar,
  senderName,
  senderAvatar,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onMarkMessageRead,
  onShowDeliveryStatus,
  onLoadThreadMessages,
  onForwardMessage,
}) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEdit = () => {
    onEditMessage?.(message.id);
  };

  const handleForward = () => {
    const targetChannelId = window.prompt("Forward to channel id");
    if (!targetChannelId?.trim()) return;
    onForwardMessage?.(message.id, targetChannelId.trim());
  };

  const handleEmojiSelect = (emoji) => {
    onAddReaction?.(message.id, emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`group relative flex w-full items-start gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe && (
        <div className="h-9 w-9 shrink-0 mt-6">
          {showAvatar ? <ChatAvatar name={senderName} src={senderAvatar} size="size-9" /> : null}
        </div>
      )}

      <div className={`flex max-w-[72%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        <span className={`mb-1 text-xs font-semibold text-gray-500 ${isMe ? "mr-1" : "ml-1"}`}>
          {senderName}
        </span>
        <div className={`flex items-start gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
          <div
            className={`rounded-[22px] px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm transition hover:shadow ${isMe
              ? "rounded-br-md bg-brand-primary text-white"
              : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
              }`}
          >
            {message.pinned ? <Pin className="mr-1 inline size-3.5" /> : null}
            <FormattedMessageText text={message.text} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="mt-1 rounded-full border border-gray-200 bg-white p-1.5 text-gray-400 opacity-0 shadow-sm transition hover:text-brand-primary group-hover:opacity-100"
                aria-label="Message actions"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isMe ? "end" : "start"} className="w-44 rounded-2xl bg-white">
              {isMe ? (
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="mr-2 size-4" /> Edit
                </DropdownMenuItem>
              ) : null}
              {message.pinned ? (
                <DropdownMenuItem onClick={() => onUnpinMessage?.(message.id)}>
                  <PinOff className="mr-2 size-4" /> Unpin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onPinMessage?.(message.id)}>
                  <Pin className="mr-2 size-4" /> Pin
                </DropdownMenuItem>
              )}
              {!isMe ? (
                <DropdownMenuItem onClick={() => onMarkMessageRead?.(message.id)}>
                  <CheckCheck className="mr-2 size-4" /> Mark read
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => onLoadThreadMessages?.(message.id)}>
                <MessageSquare className="mr-2 size-4" /> Thread
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShowDeliveryStatus?.(message.id)}>
                <Eye className="mr-2 size-4" /> Delivery status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleForward}>
                <Forward className="mr-2 size-4" /> Forward
              </DropdownMenuItem>
              {isMe ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => onDeleteMessage?.(message.id)}>
                    <Trash2 className="mr-2 size-4" /> Delete
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={`mt-1 flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
          <span className={`text-[11px] ${message.failed ? "text-red-500" : "text-gray-400"}`}>
            {message.failed ? "Failed" : message.time}
          </span>
          {isMe ? (
            message.isPending ? (
              <span className="size-1.5 rounded-full bg-gray-300" />
            ) : message.failed ? null : (
              <CheckCheck className="size-3.5 text-brand-primary" />
            )
          ) : null}
        </div>

        {message.reactions?.length ? (
          <div className={`mt-2 flex flex-wrap gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
            {message.reactions.map((reaction) => (
              <button
                key={`${message.id}-${reaction.emoji}`}
                type="button"
                onClick={() => onRemoveReaction?.(message.id, reaction.emoji)}
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
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={`${message.id}-${emoji}-add`}
              type="button"
              onClick={() => onAddReaction?.(message.id, emoji)}
              className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
            >
              {emoji}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(true)}
            className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
            title="More reactions"
          >
            +
          </button>
        </div>

        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </div>
    </div>
  );
});

export const ChannelMessagePanel = memo(function ChannelMessagePanel({
  selectedChannel,
  isLoading = false,
  onOpenSidebar,
  onBackMobile,
  headerActions,
  headerMeta,
  tabs = [],
  activeTab,
  onTabChange,
  messages = [],
  messageAvatarName,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onMarkMessageRead,
  onShowDeliveryStatus,
  onLoadThreadMessages,
  onForwardMessage,
  currentUser,
  members = [],
  isFetchingMembers = false,
  bottomRef,
  composer,
  emptySelectionTitle = "Select a channel",
  emptySelectionDescription = "Pick a channel from the left to start messaging with your team.",
  emptyMessagesTitle = "No messages yet",
  emptyMessagesDescription = "Start the conversation below.",
  shellClassName = "bg-white",
  bodyClassName = "bg-gradient-to-b from-white to-gray-50/60 px-4 py-6 sm:px-6",
}) {
  const navigate = useNavigate();
  const [visibleMessageCount, setVisibleMessageCount] = useState(MESSAGE_RENDER_BATCH_SIZE);
  const hasOlderMessages = messages.length > visibleMessageCount;
  const visibleMessages = useMemo(
    () => (hasOlderMessages ? messages.slice(-visibleMessageCount) : messages),
    [hasOlderMessages, messages, visibleMessageCount]
  );
  const renderedMessages = useMemo(
    () =>
      visibleMessages.map((message, index) => {
        const isMe = message.from === "me";
        const previousMessage = visibleMessages[index - 1];

        const currentSenderId = getUserId(message.raw) || (isMe ? "me" : "them");
        const previousSenderId = previousMessage ? (getUserId(previousMessage.raw) || (previousMessage.from === "me" ? "me" : "them")) : null;

        const showAvatar = currentSenderId !== previousSenderId;

        return {
          message,
          isMe,
          showAvatar,
          senderName: isMe ? (currentUser?.name || "Me") : getUserName(message.raw),
          senderAvatar: isMe ? (currentUser?.avatar_url || currentUser?.image) : getUserAvatar(message.raw),
        };
      }),
    [visibleMessages, currentUser]
  );

  const pinnedMessage = useMemo(
    () => messages.find((msg) => msg.pinned),
    [messages]
  );
  const showOlderMessages = () => {
    setVisibleMessageCount((count) => Math.min(messages.length, count + MESSAGE_RENDER_BATCH_SIZE));
  };

  return (
    <section className={`flex h-full min-h-0 min-w-0 flex-1 flex-col ${shellClassName}`}>
      {selectedChannel ? (
        <>
          <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                {onBackMobile ? (
                  <button
                    type="button"
                    onClick={onBackMobile}
                    className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                ) : null}

                {onOpenSidebar && !onBackMobile ? (
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenSidebar}>
                    <div className="flex size-5 flex-col justify-center gap-1">
                      <div className="h-0.5 w-full bg-brand-ink" />
                      <div className="h-0.5 w-full bg-brand-ink" />
                      <div className="h-0.5 w-full bg-brand-ink" />
                    </div>
                  </Button>
                ) : null}

                <ChatAvatar name={selectedChannel.name} size="size-11" />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-gray-950">#{selectedChannel.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                    {typeof headerMeta === "function" ? headerMeta(selectedChannel) : headerMeta}
                  </p>
                </div>
              </div>

              {headerActions ? <div className="flex items-center gap-2">{headerActions}</div> : null}
            </div>
          </header>

          {tabs.length ? (
            <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
              <div className="flex items-center gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => onTabChange?.(tab.value)}
                    className={`border-b-2 pb-2 text-sm font-medium capitalize transition ${activeTab === tab.value
                      ? "border-brand-primary text-brand-primary"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {pinnedMessage ? (
            <div className="shrink-0 border-b border-gray-200 bg-blue-50 px-4 py-3 sm:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Pin className="size-4 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {getUserName(pinnedMessage.raw)}
                      </span>
                      <span className="text-xs text-gray-500">{pinnedMessage.time}</span>
                    </div>
                    <p className="truncate text-sm text-gray-700">{pinnedMessage.text}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUnpinMessage?.(pinnedMessage.id)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-600 transition hover:bg-white hover:text-gray-900"
                  title="Unpin message"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        {!selectedChannel ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand-primary">
              {isLoading ? <Hash className="size-6 animate-pulse" /> : <MessageSquare className="size-6" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-950">
              {isLoading ? "Loading channels..." : emptySelectionTitle}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">{emptySelectionDescription}</p>
          </div>
        ) : activeTab === "team" ? (
          <ScrollArea className="h-full">
            <div className="mx-auto w-full max-w-5xl px-6 py-8">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-950">Team Information</h3>
                <p className="mt-1 text-sm text-gray-500">Details about the team this channel belongs to.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand-primary">
                    <Users2 className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{selectedChannel.teamName}</h4>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Team</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Channel Description</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedChannel.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">About this Team</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      This channel is part of the <strong>{selectedChannel.teamName}</strong>. 
                      Team members collaborate here to share updates, files, and information related to their specific projects and goals.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Members</p>
                      <p className="text-xl font-bold text-gray-900">
                        {Math.max(selectedChannel.memberCount || 0, members.length)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Visibility</p>
                      <p className="text-xl font-bold text-gray-900">{selectedChannel.visibilityLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : activeTab === "members" ? (
          <ScrollArea className="h-full">
            <div className="mx-auto w-full max-w-5xl px-6 py-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-950">Channel Members</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {members.length} {members.length === 1 ? "person" : "people"} in this channel
                  </p>
                </div>
              </div>

              {isFetchingMembers ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="size-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                  <p className="mt-4 text-sm font-medium">Loading members...</p>
                </div>
              ) : members.length ? (
                <div className="flex flex-col gap-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-brand-primary/20 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <ChatAvatar
                          name={member.full_name || member.name || "User"}
                          src={member.avatar_url || member.image}
                          size="size-11"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-950">
                            {member.full_name || member.name || "Unknown Member"}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              {member.role || "Member"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 rounded-xl bg-brand-soft text-brand-primary transition-all hover:bg-brand-primary hover:text-white"
                          onClick={() => navigate(`/user/dashboard/chat?peerId=${member.user_id || member.id}`)}
                          title="Send Message"
                        >
                          <MessageCircle className="size-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-10 rounded-xl bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white"
                          onClick={() => navigate(`/user/dashboard/meet?peerId=${member.user_id || member.id}`)}
                          title="Start Call"
                        >
                          <Phone className="size-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-gray-50 text-gray-400">
                    <Users2 className="size-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-950">No members found</h4>
                  <p className="mt-2 max-w-xs text-sm text-gray-500">
                    We couldn't find any members for this channel.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full">
            <div className={`mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end ${bodyClassName}`}>
              {messages.length ? (
                <div className="space-y-4">
                  {hasOlderMessages ? (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={showOlderMessages}
                        className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
                      >
                        Show older messages
                      </button>
                    </div>
                  ) : null}

                  {renderedMessages.map(({ message, isMe, showAvatar, senderName, senderAvatar }) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isMe={isMe}
                      showAvatar={showAvatar}
                      senderName={senderName}
                      senderAvatar={senderAvatar}
                      onAddReaction={onAddReaction}
                      onRemoveReaction={onRemoveReaction}
                      onEditMessage={onEditMessage}
                      onDeleteMessage={onDeleteMessage}
                      onPinMessage={onPinMessage}
                      onUnpinMessage={onUnpinMessage}
                      onMarkMessageRead={onMarkMessageRead}
                      onShowDeliveryStatus={onShowDeliveryStatus}
                      onLoadThreadMessages={onLoadThreadMessages}
                      onForwardMessage={onForwardMessage}
                    />
                  ))}
                  <div ref={bottomRef} />
                </div>
              ) : (
                <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand-primary">
                    <Hash className="size-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-950">{emptyMessagesTitle}</h3>
                  <p className="mt-2 max-w-sm text-sm text-gray-500">{emptyMessagesDescription}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {selectedChannel && activeTab === "chat" ? composer : null}
    </section>
  );
});
