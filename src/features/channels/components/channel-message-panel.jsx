import { memo, useMemo } from "react";
import { CheckCheck, ChevronLeft, Hash, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatAvatar } from "@/features/chat/components/chat-avatar";

const MessageBubble = memo(function MessageBubble({
  message,
  isMe,
  showAvatar,
  avatarName,
  onAddReaction,
  onRemoveReaction,
}) {
  return (
    <div className={`group flex w-full items-end gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
      {!isMe ? (
        <div className="h-8 w-8 shrink-0">
          {showAvatar ? <ChatAvatar name={avatarName} size="size-8" /> : null}
        </div>
      ) : null}

      <div className={`flex max-w-[72%] flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-[22px] px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm transition hover:shadow ${
            isMe
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
          className={`mt-2 flex flex-wrap gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${
            isMe ? "justify-end" : "justify-start"
          }`}
        >
          {["👍", "❤️", "😂"].map((emoji) => (
            <button
              key={`${message.id}-${emoji}-add`}
              type="button"
              onClick={() => onAddReaction?.(message.id, emoji)}
              className="inline-flex items-center justify-center rounded-full border border-dashed border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 shadow-sm transition hover:border-brand-primary hover:text-brand-primary"
            >
              {emoji}
            </button>
          ))}
        </div>
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
  bottomRef,
  composer,
  emptySelectionTitle = "Select a channel",
  emptySelectionDescription = "Pick a channel from the left to start messaging with your team.",
  emptyMessagesTitle = "No messages yet",
  emptyMessagesDescription = "Start the conversation below.",
  shellClassName = "bg-white",
  bodyClassName = "bg-gradient-to-b from-white to-gray-50/60 px-4 py-6 sm:px-6",
}) {
  const renderedMessages = useMemo(
    () =>
      messages.map((message, index) => {
        const isMe = message.from === "me";
        const previousMessage = messages[index - 1];
        const showAvatar = !isMe && previousMessage?.from !== "them";

        return {
          message,
          isMe,
          showAvatar,
        };
      }),
    [messages]
  );

  return (
    <section className={`min-w-0 flex-1 flex-col ${shellClassName} flex`}>
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
                    className={`border-b-2 pb-2 text-sm font-medium capitalize transition ${
                      activeTab === tab.value
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
        </>
      ) : null}

      <div className="min-h-0 flex-1">
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
        ) : (
          <ScrollArea className="h-full">
            <div className={`mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end ${bodyClassName}`}>
              {messages.length ? (
                <div className="space-y-4">
                  {renderedMessages.map(({ message, isMe, showAvatar }) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isMe={isMe}
                      showAvatar={showAvatar}
                      avatarName={messageAvatarName || selectedChannel.name}
                      onAddReaction={onAddReaction}
                      onRemoveReaction={onRemoveReaction}
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

      {selectedChannel ? composer : null}
    </section>
  );
});
