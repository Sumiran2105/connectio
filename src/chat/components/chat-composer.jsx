import { LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

const COMPOSER_MAX_HEIGHT = 220;

export function ChatComposer({
  isSending,
  messageInput,
  onChange,
  onKeyDown,
  onSend,
}) {
  const textareaRef = useRef(null);
  const hasMessageText = Boolean(messageInput.trim());

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
  }, [messageInput]);

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex items-end gap-3 rounded-[28px] border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition focus-within:border-brand-primary/30 focus-within:ring-2 focus-within:ring-brand-primary/15">
        <button
          type="button"
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
        >
          <Paperclip className="size-5" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={messageInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message"
          className="max-h-[220px] min-h-8 flex-1 resize-none border-none bg-transparent py-1 text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none [scrollbar-width:thin]"
        />
        <button
          type="button"
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
        >
          <Smile className="size-5" />
        </button>
        <button
          type="button"
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
        >
          <PlusIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={!hasMessageText}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending && hasMessageText ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </div>
    </div>
  );
}
