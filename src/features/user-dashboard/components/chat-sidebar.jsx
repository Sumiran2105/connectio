import { LoaderCircle, Plus as PlusIcon, Search, SquarePen } from "lucide-react";
import { ChatAvatar } from "./chat-avatar";

export function ChatSidebar({
  activeContact,
  conversations,
  deferredNewChatQuery,
  isMobileChatOpen,
  isNewChatMode,
  onCancelSearch,
  onNewChatClick,
  onOpenConversation,
  onSearchChange,
  onSelectSearchUser,
  searchInputRef,
  searchQuery,
  searchUsersQuery,
  sidebarResults,
  unreadCountsByContactId,
}) {
  return (
    <aside
      className={`shrink-0 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white ${
        isMobileChatOpen ? "hidden sm:flex" : "flex w-full sm:w-[22rem]"
      }`}
    >
      <div className="border-b border-gray-200 px-6 py-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-950">Chat</h2>
            <p className="mt-1 text-sm text-gray-500">
              {isNewChatMode ? "Search teammates and start a conversation." : "Recent conversations"}
            </p>
          </div>
          <button
            type="button"
            className="rounded-2xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
            aria-label="New chat"
            title="New chat"
            onClick={onNewChatClick}
          >
            <SquarePen className="size-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={isNewChatMode ? "Search by name or email" : "Search conversations"}
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
        <div className="px-6 py-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
              {isNewChatMode ? "Search results" : "Recent"}
            </h3>
            {isNewChatMode ? (
              <button
                type="button"
                onClick={onCancelSearch}
                className="text-xs font-semibold text-brand-primary hover:underline"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {isNewChatMode && deferredNewChatQuery.length <= 1 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                Type at least 2 characters to search for a person.
              </div>
            ) : null}

            {isNewChatMode && deferredNewChatQuery.length > 1 && searchUsersQuery.isLoading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                <LoaderCircle className="size-4 animate-spin" />
                Searching users
              </div>
            ) : null}

            {isNewChatMode && deferredNewChatQuery.length > 1 && searchUsersQuery.isError ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-600">
                Unable to search users right now.
              </div>
            ) : null}

            {sidebarResults.map((contact) => {
              const contactId = contact.id || contact.user_id || contact.email;
              const contactName = isNewChatMode
                ? contact.full_name || contact.name || contact.display_name || "Unknown user"
                : contact.name;
              const contactSubtitle = isNewChatMode
                ? contact.email || "No email available"
                : contact.role;
              const contactOnline = isNewChatMode
                ? Boolean(contact.online || contact.is_online || contact.is_active)
                : contact.online;
              const isActive = activeContact?.id === contactId;
              const contactMessages = conversations[contactId] || contact.messages || [];
              const previewTime = contactMessages[contactMessages.length - 1]?.time;
              const unreadCount = unreadCountsByContactId[contactId];

              return (
                <button
                  key={contactId}
                  type="button"
                  onClick={() =>
                    isNewChatMode ? onSelectSearchUser(contact) : onOpenConversation(contact)
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-brand-primary/20 bg-white shadow-sm"
                      : "border-transparent bg-transparent hover:border-gray-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ChatAvatar name={contactName} online={contactOnline} size="size-11" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-gray-900">{contactName}</p>
                        {!isNewChatMode && previewTime ? (
                          <span className="shrink-0 text-[11px] text-gray-400">{previewTime}</span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-gray-500">{contactSubtitle}</p>
                    </div>
                    {!isNewChatMode && unreadCount ? (
                      <span className="mt-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {unreadCount}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {isNewChatMode &&
            deferredNewChatQuery.length > 1 &&
            !searchUsersQuery.isLoading &&
            !searchUsersQuery.isError &&
            !sidebarResults.length ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                No users found for this search.
              </div>
            ) : null}
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand-primary/20 hover:bg-brand-soft"
          >
            <PlusIcon className="size-4" />
            Invite to Connectio
          </button>
        </div>
      </div>
    </aside>
  );
}
