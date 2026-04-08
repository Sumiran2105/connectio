import { useState, useRef, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  Plus,
  CheckCheck,
  Circle,
  Settings,
  Plus as PlusIcon,
} from "lucide-react";
import { UserLayout } from "../components/user-layout";

const contacts = [
  { 
    id: 1, 
    name: "madhav", 
    role: "You: Microsoft Teams-Inspired User Interface ...", 
    online: true, 
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "You:  User Interface ...", time: "17:46", read: true },
      { id: 2, from: "me", text: "About 1.jsx", time: "27 March 18:31", read: true, isFile: true },
      { id: 3, from: "me", text: "Contact.jsx", time: "27 March 18:31", read: true, isFile: true },
      { id: 4, from: "me", text: "hi", time: "30 March 15:14", read: true },
      { id: 5, from: "me", text: "doubt ", time: "30 March 18:16", read: true },
      { id: 6, from: "me", text: "yes", time: "01 April 17:30", read: true },
      { id: 7, from: "them", text: " 1 min", time: "30 March 18:16", read: true },
    ],
  },
  { 
    id: 2, 
    name: "john and doe", 
    role: "You: ok bro", 
    online: true, 
    unread: 0,
    messages: [
      { id: 1, from: "me", text: "You: ok bro", time: "16:55", read: true },
    ],
  },
  { 
    id: 3, 
    name: "madhav", 
    role: "git status --porcelain git status > status.txt Get...", 
    online: true, 
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "git status --porcelain git status > status.txt Get...", time: "16:44", read: true },
    ],
  },
  { 
    id: 4, 
    name: "Connectio- Levitica Teams frontend", 
    role: "Sai: https://connectio-fawn.vercel.app/", 
    online: false, 
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Sai: https://connectio-fawn.vercel.app/", time: "15:39", read: true },
    ],
  },
  { 
    id: 5, 
    name: "HMS React Web Application - Team", 
    role: "Abhinaya: Thank you i received", 
    online: false, 
    unread: 0,
    messages: [
      { id: 1, from: "them", text: "Abhinaya: Thank you i received", time: "12:39", read: true },
    ],
  },
];

function Avatar({ name, online, size = "size-10" }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-pink-500","bg-amber-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`relative shrink-0 ${size} rounded-full ${color} flex items-center justify-center font-bold text-white text-sm shadow-sm`}>
      {initials}
      {online && (
        <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  );
}

export function ChatPage() {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [messageInput, setMessageInput] = useState("");
  const [conversations, setConversations] = useState(
    Object.fromEntries(contacts.map(c => [c.id, c.messages]))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const bottomRef = useRef(null);

  const currentMessages = conversations[activeContact.id] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  function sendMessage() {
    const text = messageInput.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      from: "me",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    };

    setConversations(prev => ({
      ...prev,
      [activeContact.id]: [...(prev[activeContact.id] || []), newMsg],
    }));
    setMessageInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <UserLayout>

      //space for header and sidebar
      <div className="flex w-full h-[calc(100vh-90px)] -mx-5 -my-6 sm:-mx-8 lg:-mx-12 gap-0 overflow-hidden bg-white">

        {/* ─── Left Sidebar - Chat List ─── */}
        <aside className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50 hidden sm:flex">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">Chat</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white rounded-lg transition-colors">
                  <Settings className="size-5 text-gray-700" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-full py-2.5 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Recent Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3">Recent</h3>
              <div className="space-y-2">
                {filteredContacts.map(contact => {
                  const isActive = activeContact.id === contact.id;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => setActiveContact(contact)}
                      className={`w-full flex items-start gap-3 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-white shadow-sm"
                          : "hover:bg-white/50"
                      }`}
                    >
                      <Avatar name={contact.name} online={contact.online} size="size-10" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`text-sm font-bold truncate ${isActive ? "text-gray-900" : "text-gray-700"}`}>
                          {contact.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{contact.role}</p>
                      </div>
                      <p className="text-xs text-gray-500 shrink-0">{contact.messages[contact.messages.length - 1]?.time}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Invite Button */}
            <div className="p-6">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <PlusIcon className="size-4" />
                Invite to Teams
              </button>
            </div>
          </div>
        </aside>

        {/* ─── Main Chat Area ─── */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Chat Header */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
            <div className="flex items-center gap-4">
              <Avatar name={activeContact.name} online={activeContact.online} size="size-11" />
              <div>
                <h3 className="text-base font-bold text-gray-900">{activeContact.name}</h3>
                <p className="text-xs text-gray-600">{activeContact.messages.length} messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                <Video className="size-5" />
              </button>
              <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                <Phone className="size-5" />
              </button>
              <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                <Search className="size-5" />
              </button>
              <button className="p-2 hover:bg-brand-primary/10 rounded-lg transition-colors text-gray-700 hover:text-brand-primary">
                <MoreVertical className="size-5" />
              </button>
            </div>
          </header>

          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-200 bg-gray-50">
            {["Chat", "Files", "Photos"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? "text-brand-primary border-brand-primary"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white [scrollbar-width:thin]">
            {currentMessages.map((msg, idx) => {
              const isMe = msg.from === "me";
              const prevMsg = currentMessages[idx - 1];
              const showAvatar = !isMe && prevMsg?.from !== "them";
              
              return (
                <div key={msg.id} className={`flex items-end gap-3 ${isMe ? "flex-row-reverse justify-end" : "flex-row justify-start"}`}>
                  {/* Avatar */}
                  <div className="w-8 h-8 shrink-0">
                    {!isMe && showAvatar && <Avatar name={activeContact.name} online={false} size="size-8" />}
                  </div>

                  {/* Message */}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {msg.isFile ? (
                      <div className={`px-4 py-3 rounded-xl text-sm font-medium shadow-sm border min-w-[200px] ${
                        isMe
                          ? "bg-brand-primary text-white border-brand-primary"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Paperclip className="size-5" />
                          </div>
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-md ${
                          isMe
                          ? "bg-brand-primary text-white rounded-br-none"
                            : "bg-gray-100 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                    {isMe && msg.time && (
                      <div className="flex items-center gap-1 mt-1 flex-row-reverse">
                        <span className="text-[11px] text-gray-500">{msg.time}</span>
                        <CheckCheck className="size-3.5 text-brand-primary" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Message Input */}
          <div className="shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-3 bg-gray-100 border border-gray-300 rounded-full px-4 py-3 focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
              <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                <Paperclip className="size-5" />
              </button>
              <textarea
                rows={1}
                value={messageInput}
                onChange={e => {
                  setMessageInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-none resize-none text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none leading-relaxed py-1 max-h-[100px] [scrollbar-width:thin]"
              />
              <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                <Smile className="size-5" />
              </button>
              <button className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-brand-primary hover:bg-white transition-colors">
                <PlusIcon className="size-5" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!messageInput.trim()}
                className="shrink-0 size-9 flex items-center justify-center rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Send className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
