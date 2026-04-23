import { useState } from "react";
import { SquarePen } from "lucide-react";

import { ChannelComposer } from "@/features/channels/components/channel-composer";
import { ChannelMessagePanel } from "@/features/channels/components/channel-message-panel";
import { SharedChannelSidebar } from "@/features/channels/components/channel-sidebar";
import { useChannelMessages } from "@/features/channels/hooks/use-channel-messages";
import { useAuthStore } from "@/store/auth-store";
import { UserLayout } from "../components/user-layout";
import { useUserChannels } from "./use-user-channels";

export function ChannelsPage() {
  const session = useAuthStore((state) => state.session);
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const { channelState, sidebarState } = useUserChannels({
    accessToken: session?.accessToken,
  });
  const { filteredChannels, activeChannel, isLoading, isError } = channelState;
  const { search, setSearch, isMobilePanelOpen, setIsMobilePanelOpen, openChannel } = sidebarState;
  const {
    messages: currentMessages,
    bottomRef,
    isLoading: isMessagesLoading,
    isSending,
    sendMessage: sendChannelMessage,
    addReaction,
    removeReaction,
  } = useChannelMessages({
    channelId: activeChannel?.id,
    accessToken: session?.accessToken,
    currentUserId: session?.userId,
  });

  function handleSendMessage() {
    const text = messageInput.trim();
    if (!text || !activeChannel) return;
    sendChannelMessage(text);
    setMessageInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <UserLayout
      showFloatingActions={false}
      contentClassName="!p-0 h-full overflow-hidden"
      contentInnerClassName="!max-w-none !w-full !m-0 h-full"
    >
      <div className="flex h-full w-full overflow-hidden bg-white">
        <div
          className={`shrink-0 sm:w-[22rem] ${isMobilePanelOpen ? "hidden" : "flex w-full"}`}
        >
          <SharedChannelSidebar
            title="Channels"
            subtitle="Your joined channels"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search channels"
            channels={filteredChannels}
            selectedChannelId={activeChannel?.id}
            onSelectChannel={openChannel}
            loading={isLoading}
            error={isError ? "Unable to load your channels right now." : ""}
            emptyMessage="No channels matched this search."
            getChannelMeta={(channel) => channel.visibilityLabel}
            isPrivateChannel={(channel) => channel.isPrivate}
            className="relative translate-x-0 border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white sm:flex sm:w-[22rem]"
            renderHeaderAction={() => (
              <button
                type="button"
                className="rounded-2xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
                aria-label="Channels workspace"
                title="Channels workspace"
              >
                <SquarePen className="size-5" />
              </button>
            )}
          />
        </div>

        <section
          className={`min-w-0 flex-1 flex-col bg-white ${isMobilePanelOpen ? "flex" : "hidden sm:flex"
            }`}
        >
          <ChannelMessagePanel
            selectedChannel={activeChannel}
            headerMeta={(channel) => channel?.visibilityLabel || "Channel"}
            tabs={[
              { value: "chat", label: "Chat" },
              { value: "members", label: "Members" },
              { value: "team", label: "Team" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            messages={currentMessages}
            isLoading={isMessagesLoading}
            bottomRef={bottomRef}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
            onBackMobile={() => setIsMobilePanelOpen(false)}
            composer={
              <ChannelComposer
                isSending={isSending}
                messageInput={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={handleKeyDown}
                onSend={handleSendMessage}
                disabled={!activeChannel}
                placeholder={activeChannel ? `Message #${activeChannel.name}` : "Select a channel"}
              />
            }
          />
        </section>
      </div>
    </UserLayout>
  );
}
