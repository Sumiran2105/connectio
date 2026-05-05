import { memo, useLayoutEffect, useRef } from "react";
import { LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPOSER_MAX_HEIGHT = 220;

export const ChannelComposer = memo(function ChannelComposer({
  isSending,
  messageInput,
  editingMessageId,
  onChange,
  onKeyDown,
  onSend,
  onCancelEdit,
  placeholder = "Type a message",
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const isEditing = Boolean(editingMessageId);
  const hasMessageText = Boolean(messageInput.trim());

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
  }, [messageInput]);

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white">
      {isEditing && (
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <span className="font-medium">Editing message</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
            className="h-auto p-1 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
          >
            Cancel
          </Button>
        </div>
      )}
      <div className="px-6 py-4">
        <div className="flex items-end gap-3 rounded-[28px] border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition focus-within:border-brand-primary/30 focus-within:ring-2 focus-within:ring-brand-primary/15">
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Paperclip className="size-5" />
          </button>
          <textarea
            ref={textareaRef}
            rows={1}
            value={messageInput}
            onChange={onChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="max-h-[220px] min-h-8 flex-1 resize-none border-none bg-transparent py-1 text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed [scrollbar-width:thin]"
          />
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Smile className="size-5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <PlusIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !hasMessageText}
            className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending && hasMessageText ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
});
