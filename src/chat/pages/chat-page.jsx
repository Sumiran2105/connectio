import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import { AdminLayout } from "@/features/admin-dashboard/components/admin-layout";
import { UserLayout } from "@/features/user-dashboard/components/user-layout";
import { ChatConversationPane } from "../components/chat-conversation-pane";
import { ChatSidebar } from "../components/chat-sidebar";
import { MessageDetailsDialog } from "../components/message-details-dialog";
import { useChatWorkspace } from "../hooks/use-chat-workspace";

export function ChatPage({ layout = "user" }) {
  const location = useLocation();
  const routeTargetUser = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const selectedUserId = location.state?.selectedUserId || params.get("userId");
    const selectedUserUserId = location.state?.selectedUserUserId || params.get("userId");
    const selectedUserEmail = location.state?.selectedUserEmail || params.get("email");
    const selectedUserName = location.state?.selectedUserName || params.get("name");

    if (!selectedUserId && !selectedUserUserId && !selectedUserEmail) return null;

    return {
      id: selectedUserUserId || selectedUserId || selectedUserEmail,
      user_id: selectedUserUserId || selectedUserId,
      name: selectedUserName || "Unknown user",
      full_name: selectedUserName || "Unknown user",
      email: selectedUserEmail || "",
    };
  }, [location.search, location.state]);
  const chat = useChatWorkspace(routeTargetUser);
  const handledSelectionKeyRef = useRef(null);
  const Layout = layout === "admin" ? AdminLayout : UserLayout;
  const layoutProps = {
    showFloatingActions: false,
    contentClassName: "!p-0 h-full !overflow-hidden",
    contentInnerClassName: "!max-w-none !w-full !m-0 h-full min-h-0",
  };

  useEffect(() => {
    if (!routeTargetUser) return;
    const selectionKey = [routeTargetUser.id, routeTargetUser.user_id, routeTargetUser.email]
      .filter(Boolean)
      .join(":");
    if (handledSelectionKeyRef.current === selectionKey) return;
    handledSelectionKeyRef.current = selectionKey;

    chat.openTargetUser(routeTargetUser);

    window.history.replaceState({}, document.title, window.location.pathname);
  }, [location.key, routeTargetUser]);

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
