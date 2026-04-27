import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import { ChatConversationPane } from "../components/chat-conversation-pane";
import { ChatSidebar } from "../components/chat-sidebar";
import { MessageDetailsDialog } from "../components/message-details-dialog";
import { useChatWorkspace } from "../hooks/use-chat-workspace";

export function ChatPage({ layout = "user" }) {
  const chat = useChatWorkspace();
  const location = useLocation();
  const Layout = layout === "admin" ? AdminLayout : UserLayout;
  const layoutProps = {
    showFloatingActions: false,
    contentClassName: "overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6",
    contentInnerClassName: "max-w-none h-full min-h-0",
  };

  // Handle opening conversation with a pre-selected user
  useEffect(() => {
    const selectedUserId = location.state?.selectedUserId;
    
    // Skip if no selected user or contacts not loaded yet
    if (!selectedUserId) {
      return;
    }

    // Try to find the user in existing contacts
    const selectedUser = chat.contacts?.find((contact) => {
      const contactId = contact.id || contact.user_id;
      return String(contactId) === String(selectedUserId);
    });

    if (selectedUser) {
      // User found in contacts, open their conversation
      chat.openConversation(selectedUser);
    } else {
      // User not in contacts yet, create a temporary contact
      const tempContact = {
        id: selectedUserId,
        user_id: selectedUserId,
        name: location.state?.selectedUserName || "Unknown user",
        role: location.state?.selectedUserEmail || "New conversation",
        online: false,
        channelId: null,
        unread: 0,
        messages: [],
      };
      chat.openConversation(tempContact);
    }

    // Clear the state to prevent re-opening on navigation back
    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.key]);

  return (
    <Layout {...layoutProps}>
      <div className="flex h-full min-h-0 w-full overflow-hidden">
        <div className="flex h-full min-h-0 w-full overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70">
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
