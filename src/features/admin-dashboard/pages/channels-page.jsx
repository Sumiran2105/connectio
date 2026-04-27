import { useState } from "react";
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

export function ChannelsPage() {
  const session = useAuthStore((state) => state.session);
  const [activeTab, setActiveTab] = useState("chat");
  const [messageInput, setMessageInput] = useState("");
  const token = session?.accessToken;
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
  } = useChannelMessages({
    channelId: getChannelId(selectedChannel),
    accessToken: token,
    currentUserId: session?.userId,
    enabled: Boolean(getChannelId(selectedChannel)),
  });

  const handleSendChannelMessage = () => {
    const text = messageInput.trim();
    if (!text || !selectedChannel) return;
    sendMessage(text);
    setMessageInput("");
  };

  const handleChannelMessageKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendChannelMessage();
    }
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
          onMessageInputChange={(event) => setMessageInput(event.target.value)}
          onMessageInputKeyDown={handleChannelMessageKeyDown}
          onSendMessage={handleSendChannelMessage}
          isSending={isSending}
          onAddReaction={addReaction}
          onRemoveReaction={removeReaction}
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
          onSave={settingsDialog.onSave}
        />
      </div>
    </AdminLayout>
  );
}
