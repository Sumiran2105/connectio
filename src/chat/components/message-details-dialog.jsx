import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatMessageTime } from "../utils/chat-utils";

export function MessageDetailsDialog({
  addReaction,
  onOpenChange,
  removeReaction,
  selectedMessage,
  selectedMessageReactionsQuery,
  selectedMessageReadStatusQuery,
}) {
  return (
    <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && onOpenChange()}>
      <DialogContent className="rounded-[28px] border-brand-line bg-white">
        <DialogHeader>
          <DialogTitle className="text-brand-ink">Message details</DialogTitle>
          <DialogDescription>
            Loaded from the single message endpoint for the active channel.
          </DialogDescription>
        </DialogHeader>

        {selectedMessage ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-brand-line bg-brand-neutral p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                Content
              </p>
              <p className="mt-2 text-sm text-brand-ink">
                {selectedMessage.normalized.text || "No content"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Message ID
                </p>
                <p className="mt-2 break-all text-sm text-brand-ink">
                  {selectedMessage.normalized.id}
                </p>
              </div>
              <div className="rounded-2xl border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Time
                </p>
                <p className="mt-2 text-sm text-brand-ink">{selectedMessage.normalized.time}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Reactions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedMessageReactionsQuery.data || []).length ? (
                    (selectedMessageReactionsQuery.data || []).map((reaction) => (
                      <button
                        key={`${selectedMessage.normalized.id}-${reaction.emoji}`}
                        type="button"
                        onClick={() => removeReaction(selectedMessage.normalized.id, reaction.emoji)}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-line bg-brand-neutral px-3 py-1 text-sm text-brand-ink"
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No reactions yet.</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["👍", "❤️", "😂", "🎉"].map((emoji) => (
                    <button
                      key={`${selectedMessage.normalized.id}-${emoji}-dialog`}
                      type="button"
                      onClick={() => addReaction(selectedMessage.normalized.id, emoji)}
                      className="rounded-full border border-dashed border-brand-line px-3 py-1 text-sm text-brand-secondary transition hover:border-brand-primary hover:text-brand-primary"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-brand-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                  Read Status
                </p>
                <div className="mt-3 space-y-2">
                  {selectedMessageReadStatusQuery.isLoading ? (
                    <p className="text-sm text-gray-500">Loading read receipts...</p>
                  ) : (selectedMessageReadStatusQuery.data || []).length ? (
                    (selectedMessageReadStatusQuery.data || []).map((read) => (
                      <div
                        key={read.id || read.user_id || read.read_at}
                        className="rounded-xl border border-brand-line bg-brand-neutral px-3 py-2"
                      >
                        <p className="text-sm font-medium text-brand-ink">
                          {read.user_name || read.full_name || read.user_email || read.user_id || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatMessageTime(read.read_at || read.created_at || read.updated_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No read receipts yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
