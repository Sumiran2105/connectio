import { useMemo, useState } from "react";
import { PhoneCall, SquarePen, Users } from "lucide-react";
import { ChannelComposer } from "@/channels/components/channel-composer";
import { ChannelMessagePanel } from "@/channels/components/channel-message-panel";
import { SharedChannelSidebar } from "@/channels/components/channel-sidebar";
import { useChannelMessages } from "@/channels/hooks/use-channel-messages";
import { useChannelMembers } from "@/channels/hooks/use-channel-members";
import { useAuthStore } from "@/store/auth-store";
import { UserLayout } from "../components/user-layout";
import { useUserChannels } from "@/channels/hooks/use-user-channels";
import { getSessionUserIdentifiers } from "@/chat/utils/chat-utils";
import { useMeetingLauncher } from "@/features/meetings/hooks/use-meeting-launcher";

export function ChannelsPage() {
  const session = useAuthStore((state) => state.session);
  const meetings = useMeetingLauncher("user");
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const currentUserIdentifiers = useMemo(() => getSessionUserIdentifiers(session), [session]);
  const { channelState, sidebarState } = useUserChannels({
    accessToken: session?.accessToken,
  });
  const { filteredChannels, activeChannel, isLoading, isError } = channelState;
  const { search, setSearch, isMobilePanelOpen, setIsMobilePanelOpen, openChannel } = sidebarState;

  // Fetch channel members for mentions
  const { members: channelMembers, isLoading: isFetchingMembers } = useChannelMembers(
    activeChannel?.id,
    {
      accessToken: session?.accessToken,
    }
  );

  const {
    messages: currentMessages,
    bottomRef,
    isLoading: isMessagesLoading,
    isSending,
    sendMessage: sendChannelMessage,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    pinMessage,
    unpinMessage,
    markMessageRead,
    showDeliveryStatus,
    loadThreadMessages,
    forwardMessage,
  } = useChannelMessages({
    channelId: activeChannel?.id,
    accessToken: session?.accessToken,
    currentUserId: currentUserIdentifiers,
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
          className={`h-full min-h-0 min-w-0 flex-1 flex-col bg-white ${isMobilePanelOpen ? "flex" : "hidden sm:flex"
            }`}
        >
          <ChannelMessagePanel
            selectedChannel={activeChannel}
            currentUser={{
              name: session?.full_name || session?.name,
              avatar_url: session?.profile_image || session?.image,
            }}
            headerAvatar={activeChannel?.avatar_url || activeChannel?.image}
            headerMeta={(channel) => channel?.visibilityLabel || "Channel"}
            headerActions={
              <>
                <button
                  type="button"
                  className="rounded-xl p-2 text-brand-secondary transition hover:bg-brand-primary/5 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setActiveTab("members")}
                  disabled={!activeChannel}
                  title="Channel members"
                >
                  <Users className="size-4" />
                </button>
                <button
                  type="button"
                  className="rounded-xl p-2 text-brand-secondary transition hover:bg-brand-primary/5 hover:text-brand-primary disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => meetings.startChannelCall(activeChannel, { mode: "video" })}
                  disabled={!activeChannel}
                  title="Start channel call"
                >
                  <PhoneCall className="size-4" />
                </button>
              </>
            }
            tabs={[
              { value: "chat", label: "Chat" },
              { value: "members", label: "Members" },
              { value: "team", label: "Team" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            messages={currentMessages}
            members={channelMembers}
            isFetchingMembers={isFetchingMembers}
            isLoading={isMessagesLoading}
            bottomRef={bottomRef}
            onAddReaction={addReaction}
            onRemoveReaction={removeReaction}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onPinMessage={pinMessage}
            onUnpinMessage={unpinMessage}
            onMarkMessageRead={markMessageRead}
            onShowDeliveryStatus={showDeliveryStatus}
            onLoadThreadMessages={loadThreadMessages}
            onForwardMessage={forwardMessage}
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
                channelMembers={channelMembers}
                isFetchingMembers={isFetchingMembers}
                onMentionInsert={(member, newMessage) => {
                  // Handle mention insertion (can be extended for logging, analytics, etc.)
                  console.log(`Mentioned ${member.name} in message:`, newMessage);
                }}
              />
            }
          />
        </section>
      </div>
    </UserLayout>
  );
}
