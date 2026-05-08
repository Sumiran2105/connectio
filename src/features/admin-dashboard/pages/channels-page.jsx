import { useMemo, useState } from "react";
import { useChannelMessages } from "@/channels/hooks/use-channel-messages";
import { useAuthStore } from "@/store/auth-store";
import { AdminLayout } from "../components/admin-layout";
import { ChannelChat } from "@/channels/admin/components/channel-chat";
import { ChannelSidebar } from "@/channels/admin/components/channel-sidebar";
import {
  AddMemberDialog,
  ChannelSettingsDialog,
  DeleteChannelDialog,
  MembersDialog,
} from "@/channels/admin/components/channel-dialogs";
import { useAdminChannels } from "@/channels/hooks/use-admin-channels";
import { getChannelId } from "@/channels/utils/channel-utils";
import { getSessionUserIdentifiers } from "@/chat/utils/chat-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ChannelsPage() {
  const session = useAuthStore((state) => state.session);
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replacePinDialogOpen, setReplacePinDialogOpen] = useState(false);
  const [pendingPinMessageId, setPendingPinMessageId] = useState(null);
  const token = session?.accessToken;
  const currentUserIdentifiers = useMemo(() => getSessionUserIdentifiers(session), [session]);
  const {
    channelState,
    sidebarState,
    memberDialog,
    membersDialog,
    deleteDialog,
    settingsDialog,
    actions,
  } = useAdminChannels({ session });
  const { channels, selectedChannel, isLoading } = channelState;
  const { isSidebarOpen, setIsSidebarOpen, createDialog } = sidebarState;
  const {
    messages,
    bottomRef,
    isLoading: isMessagesLoading,
    isSending,
    sendMessage,
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
    channelId: getChannelId(selectedChannel),
    accessToken: token,
    currentUserId: currentUserIdentifiers,
    enabled: Boolean(getChannelId(selectedChannel)),
  });

  const handleEditChannelMessage = (messageId) => {
    const message = messages.find((msg) => String(msg.id) === String(messageId));
    if (message) {
      setMessageInput(message.text);
      setEditingMessageId(messageId);
    }
  };

  const handleCancelEditMessage = () => {
    setMessageInput("");
    setEditingMessageId(null);
  };

  const handleSendChannelMessage = () => {
    const text = messageInput.trim();
    if (!text || !selectedChannel) return;
    
    if (editingMessageId) {
      editMessage(editingMessageId, text);
      setEditingMessageId(null);
    } else {
      sendMessage(text);
    }
    setMessageInput("");
  };

  const handleChannelMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendChannelMessage();
    }
  };

  const handlePinMessage = (messageId) => {
    // Check if there's already a pinned message
    const pinnedMessage = messages.find((msg) => msg.pinned);
    
    if (pinnedMessage && String(pinnedMessage.id) !== String(messageId)) {
      // Show confirmation dialog
      setPendingPinMessageId(messageId);
      setReplacePinDialogOpen(true);
    } else {
      // No pinned message or clicking on the same message, just pin it
      pinMessage(messageId);
    }
  };

  const handleConfirmReplacePinned = async () => {
    if (!pendingPinMessageId) return;
    
    // First unpin the currently pinned message
    const pinnedMessage = messages.find((msg) => msg.pinned);
    if (pinnedMessage) {
      await unpinMessage(pinnedMessage.id);
    }
    
    // Then pin the new message
    pinMessage(pendingPinMessageId);
    
    setReplacePinDialogOpen(false);
    setPendingPinMessageId(null);
  };

  return (
    <AdminLayout showFloatingActions={false}>
      <div className="fixed bottom-0 left-0 right-0 top-20 z-[20] flex flex-row overflow-hidden border-t border-brand-line bg-white md:border-t-0 lg:left-[292px]">
        {isSidebarOpen ? (
          <div
            className="absolute inset-0 z-10 bg-brand-ink/10 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <ChannelSidebar
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={(channel) => {
            actions.setSelectedChannel(channel);
            setIsSidebarOpen(false);
          }}
          isOpen={isSidebarOpen}
          createDialog={createDialog}
        />

        <ChannelChat
          selectedChannel={selectedChannel}
          isLoading={isLoading || isMessagesLoading}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenMembers={actions.openMembersPanel}
          onDeleteChannel={() => deleteDialog.onOpenChange(true)}
          onOpenSettings={actions.openSettings}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          messages={messages}
          bottomRef={bottomRef}
          messageInput={messageInput}
          editingMessageId={editingMessageId}
          onMessageInputChange={(event) => setMessageInput(event.target.value)}
          onMessageInputKeyDown={handleChannelMessageKeyDown}
          onSendMessage={handleSendChannelMessage}
          onCancelEdit={handleCancelEditMessage}
          isSending={isSending}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
          onEditMessage={handleEditChannelMessage}
          onDeleteMessage={deleteMessage}
          onPinMessage={handlePinMessage}
          onUnpinMessage={unpinMessage}
          onMarkMessageRead={markMessageRead}
          onShowDeliveryStatus={showDeliveryStatus}
          onLoadThreadMessages={loadThreadMessages}
          onForwardMessage={forwardMessage}
          session={session}
        />

        <AddMemberDialog
          open={memberDialog.open}
          onOpenChange={memberDialog.onOpenChange}
          selectedChannel={selectedChannel}
          addMemberSource={memberDialog.addMemberSource}
          memberSearchQuery={memberDialog.memberSearchQuery}
          setMemberSearchQuery={memberDialog.setMemberSearchQuery}
          memberRole={memberDialog.memberRole}
          setMemberRole={memberDialog.setMemberRole}
          addMemberError={memberDialog.addMemberError}
          teamMembers={memberDialog.teamMembers}
          isFetchingTeamMembers={memberDialog.isFetchingTeamMembers}
          selectedMemberIds={memberDialog.selectedMemberIds}
          toggleMemberSelection={memberDialog.toggleMemberSelection}
          isAddingMember={memberDialog.isAddingMember}
          handleAddMembers={memberDialog.handleAddMembers}
        />

        <MembersDialog
          open={membersDialog.open}
          onOpenChange={membersDialog.onOpenChange}
          selectedChannel={selectedChannel}
          isFetchingChannelMembers={membersDialog.isFetchingChannelMembers}
          channelMembers={membersDialog.channelMembers}
          onAddMember={() => {
            membersDialog.onOpenChange(false);
            actions.openAddMemberDialog("team");
          }}
          onAddOtherTeamMember={() => {
            membersDialog.onOpenChange(false);
            actions.openAddMemberDialog("other");
          }}
        />

        <DeleteChannelDialog
          open={deleteDialog.open}
          onOpenChange={deleteDialog.onOpenChange}
          selectedChannel={selectedChannel}
          isDeletingChannel={deleteDialog.isDeletingChannel}
          onDelete={deleteDialog.onDelete}
        />

        <ChannelSettingsDialog
          open={settingsDialog.open}
          onOpenChange={settingsDialog.onOpenChange}
          selectedChannel={selectedChannel}
          settingsForm={settingsDialog.settingsForm}
          setSettingsForm={settingsDialog.setSettingsForm}
          isSavingSettings={settingsDialog.isSavingSettings}
          isArchivingChannel={settingsDialog.isArchivingChannel}
          onSave={settingsDialog.onSave}
          onArchive={settingsDialog.onArchive}
          onUnarchive={settingsDialog.onUnarchive}
        />

        <Dialog open={replacePinDialogOpen} onOpenChange={setReplacePinDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-brand-neutral">
            <DialogHeader>
              <DialogTitle>Replace the current pinned message?</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplacePinDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmReplacePinned}>Replace</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
