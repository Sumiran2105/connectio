import { Settings, Trash2, Users } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ChannelComposer } from "@/channels/components/channel-composer";
import { ChannelMessagePanel } from "@/channels/components/channel-message-panel";
import { useChannelMembers } from "@/channels/hooks/use-channel-members";

export function ChannelChat({
  selectedChannel,
  isLoading,
  onOpenSidebar,
  onOpenMembers,
  onDeleteChannel,
  onOpenSettings,
  activeTab,
  onTabChange,
  messages,
  bottomRef,
  messageInput,
  editingMessageId,
  onMessageInputChange,
  onMessageInputKeyDown,
  onSendMessage,
  onCancelEdit,
  isSending,
  onAddReaction,
  onRemoveReaction,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onMarkMessageRead,
  onShowDeliveryStatus,
  onLoadThreadMessages,
  onForwardMessage,
  session,
}) {
  // Fetch channel members for mentions
  const { members: channelMembers, isLoading: isFetchingMembers } = useChannelMembers(
    selectedChannel?.id,
    {
      accessToken: session?.accessToken,
    }
  );
  return (
    <ChannelMessagePanel
      selectedChannel={selectedChannel}
      isLoading={isLoading}
      onOpenSidebar={onOpenSidebar}
      headerMeta={(channel) => channel?.description || "Channel conversation"}
      headerActions={
        <>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
            onClick={onOpenMembers}
            disabled={!selectedChannel}
            title="Channel members"
          >
            <Users className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-brand-secondary hover:bg-red-50 hover:text-red-500"
            onClick={onDeleteChannel}
            disabled={!selectedChannel}
            title="Delete channel"
          >
            <Trash2 className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
            onClick={onOpenSettings}
            disabled={!selectedChannel}
            title="Channel settings"
          >
            <Settings className="size-4" />
          </Button>
        </>
      }
      tabs={[
        { value: "chat", label: "Chat" },
        { value: "files", label: "Files" },
        { value: "members", label: "Members" },
      ]}
      activeTab={activeTab}
      onTabChange={onTabChange}
      messages={messages}
      bottomRef={bottomRef}
      onAddReaction={onAddReaction}
      onRemoveReaction={onRemoveReaction}
      onEditMessage={onEditMessage}
      onDeleteMessage={onDeleteMessage}
      onPinMessage={onPinMessage}
      onUnpinMessage={onUnpinMessage}
      onMarkMessageRead={onMarkMessageRead}
      onShowDeliveryStatus={onShowDeliveryStatus}
      onLoadThreadMessages={onLoadThreadMessages}
      onForwardMessage={onForwardMessage}
      composer={
        <ChannelComposer
          isSending={isSending}
          messageInput={messageInput}
          editingMessageId={editingMessageId}
          onChange={onMessageInputChange}
          onKeyDown={onMessageInputKeyDown}
          onSend={onSendMessage}
          onCancelEdit={onCancelEdit}
          disabled={!selectedChannel}
          placeholder={selectedChannel ? `Message #${selectedChannel.name}` : "Select a channel"}
          channelMembers={channelMembers}
          isFetchingMembers={isFetchingMembers}
          onMentionInsert={(member, newMessage) => {
            // Handle mention insertion (can be extended for logging, analytics, etc.)
            console.log(`Mentioned ${member.name} in message:`, newMessage);
          }}
        />
      }
      emptySelectionTitle="No channels found"
      emptySelectionDescription={
        isLoading
          ? "Loading your workspace channels."
          : "Create the first channel for this workspace."
      }
      emptyMessagesTitle="No channel messages yet"
      emptyMessagesDescription="Send the first update to start this channel conversation."
    />
  );
}
