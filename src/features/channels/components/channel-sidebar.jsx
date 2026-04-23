import { memo } from "react";
import { Hash, Lock, Search } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const SharedChannelSidebar = memo(function SharedChannelSidebar({
  title = "Channels",
  subtitle,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search channels...",
  channels = [],
  selectedChannelId,
  onSelectChannel,
  renderHeaderAction,
  renderBottomAction,
  loading,
  error,
  emptyMessage = "No channels found.",
  getChannelId = (channel) => channel?.id,
  getChannelName = (channel) => channel?.name || "Untitled channel",
  getChannelDescription = (channel) => channel?.description || "",
  getChannelMeta,
  isPrivateChannel = (channel) => Boolean(channel?.is_private),
  isOpen = true,
  className,
}) {
  return (
    <aside
      className={cn(
        "absolute inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-brand-line bg-brand-soft transition-transform duration-300 md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-tight text-brand-ink">{title}</h2>
            {subtitle ? <p className="mt-1 text-sm text-brand-secondary">{subtitle}</p> : null}
          </div>
          {renderHeaderAction ? renderHeaderAction() : null}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-secondary/40" />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-brand-line/30 bg-white/60 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 pb-6">
        <div className="space-y-2">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-brand-line bg-white/70 px-4 py-4 text-sm text-brand-secondary">
              Loading channels...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
              {error}
            </div>
          ) : null}

          {!loading && !error && channels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-brand-line bg-white/70 px-4 py-4 text-sm text-brand-secondary">
              {emptyMessage}
            </div>
          ) : null}

          {!loading &&
            !error &&
            channels.map((channel) => {
              const channelId = getChannelId(channel);
              const isSelected = selectedChannelId === channelId;
              const channelName = getChannelName(channel);
              const channelDescription = getChannelDescription(channel);
              const meta = getChannelMeta?.(channel);
              const isPrivate = isPrivateChannel(channel);

              return (
                <button
                  key={channelId || channelName}
                  type="button"
                  onClick={() => onSelectChannel?.(channel)}
                  className={cn(
                    "group flex w-full items-start justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                      : "bg-white/80 text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    {isPrivate ? (
                      <Lock
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isSelected
                            ? "text-white/70"
                            : "text-brand-secondary/40 group-hover:text-brand-primary/60"
                        )}
                      />
                    ) : (
                      <Hash
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          isSelected
                            ? "text-white/70"
                            : "text-brand-secondary/40 group-hover:text-brand-primary/60"
                        )}
                      />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{channelName}</div>
                      {channelDescription ? (
                        <p
                          className={cn(
                            "mt-0.5 line-clamp-1 text-xs",
                            isSelected ? "text-white/75" : "text-brand-secondary"
                          )}
                        >
                          {channelDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {meta ? (
                    <div
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                        isSelected ? "bg-white/15 text-white" : "bg-brand-soft text-brand-secondary"
                      )}
                    >
                      {meta}
                    </div>
                  ) : isSelected ? (
                    <div className="mt-1 size-1.5 shrink-0 rounded-full bg-white" />
                  ) : null}
                </button>
              );
            })}
        </div>
      </ScrollArea>

      {renderBottomAction ? <div className="mt-auto border-t border-brand-line/50 p-6">{renderBottomAction()}</div> : null}
    </aside>
  );
});
