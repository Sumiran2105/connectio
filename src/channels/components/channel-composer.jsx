import { memo, useLayoutEffect, useRef, useState, useEffect, useMemo } from "react";
import { FileUp, Image as ImageIcon, LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentionSuggestions } from "./mention-suggestions";
import { EmojiPicker } from "./emoji-picker";

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
  channelMembers = [],
  isFetchingMembers = false,
  onMentionInsert,
}) {
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const isEditing = Boolean(editingMessageId);
  const hasMessageText = Boolean(messageInput.trim());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  // Mention state
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    textarea.style.overflowY = textarea.scrollHeight > COMPOSER_MAX_HEIGHT ? "auto" : "hidden";
  }, [messageInput]);

  const updateMessageValue = (value) => {
    onChange?.({ target: { value } });
  };

  const insertText = (text) => {
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
  };

  const handleEmojiSelect = (emoji) => {
    insertText(emoji);
    setShowEmojiPicker(false);
  };

  const handleAttachmentSelect = (event, label) => {
    const file = event.target.files?.[0];
    if (!file) return;

    insertText(`${messageInput.trim() ? " " : ""}[${label}: ${file.name}]`);
    setShowMoreOptions(false);
    event.target.value = "";
  };

  // Detect @ mentions and update suggestions
  useEffect(() => {
    if (!textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    setCursorPosition(cursorPos);

    const textBeforeCursor = messageInput.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) {
      setShowMentionSuggestions(false);
      setMentionSearchQuery("");
      return;
    }

    // Check if @ is at the start or preceded by whitespace
    const isValidMentionStart =
      lastAtIndex === 0 || /\s/.test(textBeforeCursor[lastAtIndex - 1]);

    if (!isValidMentionStart) {
      setShowMentionSuggestions(false);
      setMentionSearchQuery("");
      return;
    }

    // Extract search query after @
    const query = textBeforeCursor.substring(lastAtIndex + 1);

    // Check if there's a space or newline after the query (which would end the mention)
    if (/[\s\n]/.test(query)) {
      setShowMentionSuggestions(false);
      setMentionSearchQuery("");
      return;
    }

    setMentionSearchQuery(query);
    setShowMentionSuggestions(true);
  }, [messageInput]);

  const handleMemberSelect = (member) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = messageInput.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) return;

    // Replace @ and search query with mention
    const beforeMention = messageInput.substring(0, lastAtIndex);
    const afterMention = messageInput.substring(cursorPos);
    const mentionText = `@${member.name}`;
    const newMessage = `${beforeMention}${mentionText} ${afterMention}`;

    // Update the message through onChange callback
    updateMessageValue(newMessage);

    // Call the mention insert callback if provided
    onMentionInsert?.(member, newMessage);

    setShowMentionSuggestions(false);
    setMentionSearchQuery("");

    // Set cursor position after the mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + mentionText.length + 1;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleEveryoneMention = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = messageInput.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex === -1) return;

    const beforeMention = messageInput.substring(0, lastAtIndex);
    const afterMention = messageInput.substring(cursorPos);
    const mentionText = "@everyone";
    const newMessage = `${beforeMention}${mentionText} ${afterMention}`;

    updateMessageValue(newMessage);

    setShowMentionSuggestions(false);
    setMentionSearchQuery("");

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = lastAtIndex + mentionText.length + 1;
        textareaRef.current.selectionStart = newCursorPos;
        textareaRef.current.selectionEnd = newCursorPos;
        textareaRef.current.focus();
      }
    }, 0);
  };

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
      <div className="relative px-6 py-4">
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
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            title="Attach file"
          >
            <Paperclip className="size-5" />
          </button>
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={messageInput}
              onChange={onChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className="max-h-[220px] min-h-8 w-full resize-none border-none bg-transparent py-1 text-sm leading-relaxed text-gray-900 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed [scrollbar-width:thin]"
            />
            
            {/* Mention suggestions dropdown */}
            {showMentionSuggestions && (
              <div className="absolute bottom-full left-0 mb-2 z-50">
                <MentionSuggestions
                  members={channelMembers}
                  searchQuery={mentionSearchQuery}
                  isLoading={isFetchingMembers}
                  onSelectMember={handleMemberSelect}
                  onSelectEveryone={handleEveryoneMention}
                  onAddMember={() => {
                    // TODO: Handle adding new member to channel
                    setShowMentionSuggestions(false);
                  }}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowEmojiPicker(true)}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            title="Add emoji"
          >
            <Smile className="size-5" />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowMoreOptions((current) => !current)}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
            title="More options"
          >
            <PlusIcon className="size-5" />
          </button>
          {showMoreOptions ? (
            <div className="absolute bottom-full right-16 z-40 mb-3 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2 shadow-xl">
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
                  insertText("@");
                  setShowMoreOptions(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-soft hover:text-brand-primary"
              >
                <UserRoundPlus className="size-4" />
                Mention member
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
