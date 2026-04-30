import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import { ChatConversationPane } from "../components/chat-conversation-pane";
import { ChatSidebar } from "../components/chat-sidebar";
import { MessageDetailsDialog } from "../components/message-details-dialog";
import { useChatWorkspace } from "../hooks/use-chat-workspace";

export function ChatPage({ layout = "user" }) {
  const chat = useChatWorkspace();
  const Layout = layout === "admin" ? AdminLayout : UserLayout;
  const layoutProps = {
    showFloatingActions: false,
    contentClassName: "!p-0 h-full !overflow-hidden",
    contentInnerClassName: "!max-w-none !w-full !m-0 h-full min-h-0",
  };

  return (
    <Layout {...layoutProps}>
      <div className="flex h-full min-h-0 w-full overflow-hidden">
        <div className="flex h-full min-h-0 w-full overflow-hidden bg-white">
          <ChatSidebar
            activeContact={chat.activeContact}
            conversations={chat.conversations}
            deferredNewChatQuery={chat.deferredNewChatQuery}
            isMobileChatOpen={chat.isMobileChatOpen}
            isNewChatMode={chat.isNewChatMode}
            onCancelSearch={chat.cancelSearch}
            onNewChatClick={chat.handleNewChatClick}
            onOpenConversation={chat.openConversation}
            onSearchChange={chat.setSearchQuery}
            onSelectSearchUser={chat.handleSelectSearchUser}
            searchInputRef={chat.searchInputRef}
            searchQuery={chat.searchQuery}
            searchUsersQuery={chat.searchUsersQuery}
            sidebarResults={chat.sidebarResults}
            unreadCountsByContactId={chat.pendingCountsByContactId}
          />

          <ChatConversationPane
            activeContact={chat.activeContact}
            activePresenceLabel={chat.activePresenceLabel}
            activeTab={chat.activeTab}
            bottomRef={chat.bottomRef}
            currentMessages={chat.currentMessages}
            isLoading={chat.isLoadingMessages}
            isMobileChatOpen={chat.isMobileChatOpen}
            messageInput={chat.messageInput}
            onAddReaction={chat.addReaction}
            onBack={() => chat.setIsMobileChatOpen(false)}
            onInputChange={chat.handleInputChange}
            onKeyDown={chat.handleKeyDown}
            onMessageClick={chat.handleMessageClick}
            onRemoveReaction={chat.removeReaction}
            onSendMessage={chat.sendMessage}
            onTabChange={chat.setActiveTab}
            reactionsByMessageId={chat.reactionsByMessageId}
            sendMessageMutation={chat.sendMessageMutation}
          />
        </div>
      </div>

      <MessageDetailsDialog
        addReaction={chat.addReaction}
        onOpenChange={() => chat.setSelectedMessage(null)}
        removeReaction={chat.removeReaction}
        selectedMessage={chat.selectedMessage}
        selectedMessageReactionsQuery={chat.selectedMessageReactionsQuery}
        selectedMessageReadStatusQuery={chat.selectedMessageReadStatusQuery}
      />
    </Layout>
  );
}
