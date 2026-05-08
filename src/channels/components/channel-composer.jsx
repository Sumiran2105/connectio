import { memo, useLayoutEffect, useRef, useState, useEffect, useMemo } from "react";
import { LoaderCircle, Paperclip, Plus as PlusIcon, Send, Smile, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentionSuggestions } from "./mention-suggestions";

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
  const isEditing = Boolean(editingMessageId);
  const hasMessageText = Boolean(messageInput.trim());
  
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
    const event = {
      target: {
        value: newMessage,
      },
    };
    onChange?.(event);

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

    const event = {
      target: {
        value: newMessage,
      },
    };
    onChange?.(event);

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
        <div className="flex items-end gap-3 rounded-[28px] border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm transition focus-within:border-brand-primary/30 focus-within:ring-2 focus-within:ring-brand-primary/15">
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded-xl p-2 text-gray-600 transition hover:bg-white hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
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
