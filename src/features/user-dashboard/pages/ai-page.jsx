import { useState, useRef, useEffect } from "react";
import {
  Send,

  Sparkles,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Zap,
  FileText,
  MessageSquare,
  BarChart3,
  Code2,
  Lightbulb,
  Bot,
  User,
  ChevronDown,
} from "lucide-react";
import { UserLayout } from "../components/user-layout";
import { formatPlatformDateTime } from "@/lib/date-time";

const SUGGESTIONS = [
  { icon: FileText, label: "Summarize my meeting notes", prompt: "Summarize the key action items from my recent meeting notes." },
  { icon: MessageSquare, label: "Draft a team update message", prompt: "Help me draft a concise team update message for this week's progress." },
  { icon: BarChart3, label: "Analyze project performance", prompt: "Give me insights on how to analyze and improve project performance metrics." },
  { icon: Code2, label: "Review code best practices", prompt: "What are the best practices for writing clean and maintainable React components?" },
  { icon: Lightbulb, label: "Brainstorm ideas for onboarding", prompt: "Brainstorm creative ideas for improving new employee onboarding experience." },
  { icon: Zap, label: "Write a follow-up email", prompt: "Help me write a professional follow-up email after a client meeting." },
];

const createInitialMessages = () => [
  {
    id: 1,
    from: "ai",
    text: "Hello! I'm your AI assistant. I can help you summarize meetings, draft messages, analyze data, brainstorm ideas, and much more.\n\nWhat would you like to work on today?",
    time: formatPlatformDateTime(),
  },
];

const AI_RESPONSES = [
  "Great question! Here's a comprehensive breakdown based on your request. I've analyzed the context and prepared the most relevant response to help you move forward efficiently.",
  "I've processed your input carefully. Here's what I recommend based on best practices and the context you've provided. Let me know if you'd like me to refine this further.",
  "Absolutely! I can help with that. Based on the information provided, here's a structured response that should address your needs. Feel free to ask for any adjustments.",
  "Here's a detailed response to your request. I've considered multiple angles to give you the most useful output. You can copy or build on this as needed.",
];

export function AiPage() {
  const [messages, setMessages] = useState(() => createInitialMessages());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const nextMessageIdRef = useRef(2);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text) {
    const prompt = (text || input).trim();
    if (!prompt) return;

    const userMessageId = nextMessageIdRef.current;
    nextMessageIdRef.current += 1;
    const userMsg = {
      id: userMessageId,
      from: "me",
      text: prompt,
      time: formatPlatformDateTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setTimeout(() => {
      const reply = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMessageId = nextMessageIdRef.current;
      nextMessageIdRef.current += 1;
      const aiMsg = {
        id: aiMessageId,
        from: "ai",
        text: reply,
        time: formatPlatformDateTime(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1400);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function copyText(id, text) {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function clearChat() {
    nextMessageIdRef.current = 2;
    setMessages(createInitialMessages());
  }

  const isEmpty = messages.length <= 1;

  return (
    <UserLayout>
      <div className="fixed top-20 bottom-0 left-0 lg:left-[72px] right-0 z-[20] flex flex-col bg-white overflow-hidden border-t lg:border-t-0 border-brand-line">

        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-brand-line bg-gradient-to-r from-brand-primary/5 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-brand-primary flex items-center justify-center shadow-md shadow-brand-primary/30">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand-ink">Levitica AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <p className="text-xs text-brand-secondary font-medium">Ready to assist</p>
              </div>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-secondary bg-brand-neutral hover:bg-brand-soft hover:text-brand-primary transition-colors"
          >
            <RefreshCw className="size-3.5" /> New chat
          </button>
        </header>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.08)_transparent]">

          {/* Suggestion chips — only when chat is empty */}
          {isEmpty && (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="text-center space-y-2">
                <div className="size-16 rounded-3xl bg-gradient-to-br from-brand-primary to-[#34a87c] flex items-center justify-center mx-auto shadow-xl shadow-brand-primary/30">
                  <Sparkles className="size-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-brand-ink mt-4">How can I help you today?</h3>
                <p className="text-sm text-brand-secondary max-w-sm">
                  Pick a suggestion below or type your own question to get started.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.prompt)}
                      className="flex items-start gap-3 p-4 rounded-2xl border border-brand-line bg-brand-neutral/30 hover:bg-white hover:border-brand-primary/30 hover:shadow-md transition-all duration-200 text-left group"
                    >
                      <div className="size-8 rounded-xl bg-brand-soft flex items-center justify-center shrink-0 group-hover:bg-brand-primary group-hover:text-white transition-colors">
                        <Icon className="size-4 text-brand-primary group-hover:text-white" />
                      </div>
                      <p className="text-sm font-semibold text-brand-ink leading-snug">{s.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => {
            const isAI = msg.from === "ai";
            return (
              <div key={msg.id} className={`flex gap-3 ${isAI ? "flex-row" : "flex-row-reverse"}`}>
                {/* Avatar */}
                <div className={`size-8 rounded-full shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${isAI
                    ? "bg-brand-primary text-white"
                    : "bg-brand-soft text-brand-primary"
                  }`}>
                  {isAI ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>

                <div className={`max-w-[72%] flex flex-col ${isAI ? "items-start" : "items-end"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isAI
                      ? "bg-brand-neutral/60 border border-brand-line text-brand-ink rounded-tl-md"
                      : "bg-brand-primary text-white rounded-tr-md shadow-md shadow-brand-primary/20"
                    }`}>
                    {msg.text}
                  </div>

                  {/* Actions for AI messages */}
                  <div className={`flex items-center gap-1 mt-1.5 ${isAI ? "flex-row" : "flex-row-reverse"}`}>
                    <span className="text-[10px] text-brand-secondary">{msg.time}</span>
                    {isAI && (
                      <div className="flex items-center gap-0.5 ml-2">
                        <button
                          onClick={() => copyText(msg.id, msg.text)}
                          title="Copy"
                          className="p-1 rounded-lg hover:bg-brand-neutral text-brand-secondary hover:text-brand-primary transition-colors"
                        >
                          {copiedId === msg.id
                            ? <span className="text-[10px] font-bold text-brand-primary">Copied!</span>
                            : <Copy className="size-3" />}
                        </button>
                        <button className="p-1 rounded-lg hover:bg-brand-neutral text-brand-secondary hover:text-emerald-500 transition-colors">
                          <ThumbsUp className="size-3" />
                        </button>
                        <button className="p-1 rounded-lg hover:bg-brand-neutral text-brand-secondary hover:text-red-400 transition-colors">
                          <ThumbsDown className="size-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-brand-primary flex items-center justify-center shadow-sm shrink-0">
                <Bot className="size-4 text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-brand-neutral/60 border border-brand-line">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-brand-primary/50 animate-bounce [animation-delay:0ms]" />
                  <span className="size-2 rounded-full bg-brand-primary/50 animate-bounce [animation-delay:150ms]" />
                  <span className="size-2 rounded-full bg-brand-primary/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ── */}
        <div className="shrink-0 pl-6 pr-24 py-4 border-t border-brand-line bg-white">
          <div className="flex items-end gap-3 bg-brand-neutral/40 border border-brand-line rounded-[20px] p-3 focus-within:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary/10 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Levitica AI anything..."
              className="flex-1 bg-transparent border-none resize-none text-sm text-brand-ink placeholder:text-brand-secondary/60 focus:outline-none leading-relaxed py-1 max-h-[120px] [scrollbar-width:thin]"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="shrink-0 size-10 flex items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/25 hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="size-4" />
            </button>
          </div>
          <p className="text-center text-[10px] text-brand-secondary/40 mt-2">
            Levitica AI may produce inaccurate information. Always verify important decisions.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
