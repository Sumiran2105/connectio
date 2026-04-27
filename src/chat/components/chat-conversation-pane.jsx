import {
  CheckCheck,
  ChevronLeft,
  MoreVertical,
  Phone,
  Search,
  Video,
} from "lucide-react";
import { ChatAvatar } from "./chat-avatar";
import { ChatComposer } from "./chat-composer";
const tabs = ["chat", "files", "photos"];

export function ChatConversationPane({
  activeContact,
  activePresenceLabel,
  activeTab,
  bottomRef,
  currentMessages,
  isLoading,
  isMobileChatOpen,
  messageInput,
  onAddReaction,
  onBack,
  onInputChange,
  onKeyDown,
  onMessageClick,
  onRemoveReaction,
  onSendMessage,
  onTabChange,
  reactionsByMessageId,
  sendMessageMutation,
}) {
  return (
    <div className={`h-full min-h-0 min-w-0 flex-1 flex-col bg-white ${isMobileChatOpen ? "flex" : "hidden sm:flex"}`}>
      {activeContact ? (
        <>
          <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <ChatAvatar name={activeContact.name} online={activeContact.online} size="size-11" />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-gray-950">{activeContact.name}</h3>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                    {activePresenceLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {[Video, Phone, Search, MoreVertical].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    className="rounded-xl p-2 text-gray-700 transition hover:bg-brand-soft hover:text-brand-primary"
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
          </header>

          <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex items-center gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => onTabChange(tab)}
                  className={`border-b-2 pb-2 text-sm font-medium capitalize transition ${
                    activeTab === tab
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

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gradient-to-b from-white to-gray-50/60 px-4 py-6 sm:px-6 [scrollbar-width:thin]">
        {!activeContact ? (
          <div className="flex min-h-[420px] h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand-primary">
              <Video className="size-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-950">Start a conversation</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Choose a teammate from the left or start a new chat to begin messaging.
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="py-6 text-center text-sm text-gray-500">Loading messages…</div>
        ) : null}

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
                      <ChatAvatar name={activeContact.name} online={false} size="size-8" />
                    ) : null}
                  </div>
                ) : null}

                <div className={`flex max-w-[72%] flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <button
                    type="button"
                    onClick={() => onMessageClick(message)}
                    className={`rounded-[22px] px-4 py-2.5 text-left text-sm leading-relaxed shadow-sm transition hover:shadow ${
                      isMe
                        ? "rounded-br-md bg-brand-primary text-white"
                        : "rounded-bl-md border border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    {message.text}
                  </button>

                  <div className={`mt-1 flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <span className="text-[11px] text-gray-400">{message.time}</span>
                    {isMe ? <CheckCheck className="size-3.5 text-brand-primary" /> : null}
                  </div>

                  {(reactionsByMessageId[message.id] || []).length ? (
                    <div className={`mt-2 flex flex-wrap gap-1.5 ${isMe ? "justify-end" : "justify-start"}`}>
                      {(reactionsByMessageId[message.id] || []).map((reaction) => (
                        <button
                          key={`${message.id}-${reaction.emoji}`}
                          type="button"
                          onClick={() => onRemoveReaction(message.id, reaction.emoji)}
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
                        onClick={() => onAddReaction(message.id, emoji)}
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
      </div>

      {activeContact ? (
        <ChatComposer
          isSending={sendMessageMutation.isPending}
          messageInput={messageInput}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onSend={onSendMessage}
        />
      ) : null}
    </div>
  );
}
