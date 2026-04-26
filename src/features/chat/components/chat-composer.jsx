import { LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile } from "lucide-react";

export function ChatComposer({
  isSending,
  messageInput,
  onChange,
  onKeyDown,
  onSend,
}) {
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
          rows={1}
          value={messageInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message"
          className="max-h-[120px] flex-1 resize-none border-none bg-transparent py-1 text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none [scrollbar-width:thin]"
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
          disabled={!messageInput.trim() || isSending}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white transition hover:bg-brand-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? <LoaderCircle className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </div>
    </div>
  );
}
