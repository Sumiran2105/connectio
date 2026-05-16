import { FileUp, Image as ImageIcon, LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import { EmojiPicker } from "@/channels/components/emoji-picker";

const COMPOSER_MAX_HEIGHT = 220;

export function ChatComposer({
  isSending,
  messageInput,
  onChange,
  onKeyDown,
  onSend,
}) {
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const hasMessageText = Boolean(messageInput.trim());

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
  }, [messageInput]);

  function updateMessageValue(value) {
    onChange?.({ target: { value } });
  }

  function insertText(text) {
    const textarea = textareaRef.current;

    if (!textarea) {
      updateMessageValue(`${messageInput}${text}`);
      return;
    }

    const start = textarea.selectionStart ?? messageInput.length;
    const end = textarea.selectionEnd ?? messageInput.length;
    const nextValue = `${messageInput.slice(0, start)}${text}${messageInput.slice(end)}`;

    updateMessageValue(nextValue);

    window.setTimeout(() => {
      textarea.focus();
      const nextCursorPosition = start + text.length;
      textarea.selectionStart = nextCursorPosition;
      textarea.selectionEnd = nextCursorPosition;
    }, 0);
  }

  function handleEmojiSelect(emoji) {
    insertText(emoji);
    setShowEmojiPicker(false);
  }

  function handleAttachmentSelect(event, label) {
    const file = event.target.files?.[0];
    if (!file) return;

    insertText(`${messageInput.trim() ? " " : ""}[${label}: ${file.name}]`);
    setShowMoreOptions(false);
    event.target.value = "";
  }

  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
      {showEmojiPicker ? (
        <EmojiPicker onEmojiSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
      ) : null}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleAttachmentSelect(event, "Image")}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(event) => handleAttachmentSelect(event, "File")}
      />
      <div className="relative flex items-end gap-3 rounded-[28px] border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition focus-within:border-brand-primary/30 focus-within:ring-2 focus-within:ring-brand-primary/15">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
          title="Attach file"
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
          onClick={() => setShowEmojiPicker(true)}
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
          title="Add emoji"
        >
          <Smile className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => setShowMoreOptions((current) => !current)}
          className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary"
          title="More options"
        >
          <PlusIcon className="size-5" />
        </button>
        {showMoreOptions ? (
          <div className="absolute bottom-full right-16 z-40 mb-3 w-52 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-soft hover:text-brand-primary"
            >
              <ImageIcon className="size-4" />
              Upload image
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-soft hover:text-brand-primary"
            >
              <FileUp className="size-4" />
              Upload file
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmojiPicker(true);
                setShowMoreOptions(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-soft hover:text-brand-primary"
            >
              <Smile className="size-4" />
              Add emoji
            </button>
          </div>
        ) : null}
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
