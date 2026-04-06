import { Bell, ChevronRight, Info, Mail, Search, Send, Trash2, X, Globe, MessageSquare, Type, Layout } from "lucide-react";
import { useState } from "react";
import { SuperAdminLayout } from "../components/super-admin-layout";
import { Button } from "@/components/ui/button";

export function SendNotificationsPage() {
  const [recipientType, setRecipientType] = useState("all"); // 'all' or 'specific'
  const [selectedCompany, setSelectedCompany] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log({
      recipientType,
      subject,
      message,
    });
    alert("Notification sent successfully!");
  };

  const handleClear = () => {
    setRecipientType("all");
    setSelectedCompany("");
    setSubject("");
    setMessage("");
  };

  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-5xl space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
            Send Notifications
          </h1>
          <p className="text-sm text-brand-secondary">
            Reach out to Company administrators instantly via email.
          </p>
        </div>

        {/* Info Banner - Re-styled to match brand colors better */}
        <div className="flex items-start gap-4 rounded-[24px] border border-brand-primary/10 bg-brand-primary/5 p-5 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <Info className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-brand-ink">Notification target</p>
            <p className="text-sm leading-relaxed text-brand-secondary/80">
              Select Company names to send the mail notification. You can target all Companies or specific ones.
            </p>
          </div>
        </div>

        {/* RECIPIENTS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary/60">
              Select Recipients
            </span>
            <div className="h-px flex-1 bg-brand-line/40" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-4xl">
            {/* All company Card */}
            <div
              onClick={() => {
                setRecipientType("all");
                setSelectedCompany("");
              }}
              className={`group cursor-pointer relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 ${recipientType === "all"
                ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20 shadow-md shadow-brand-primary/5"
                : "border-brand-line bg-white hover:border-brand-primary/30 hover:bg-brand-neutral/40"
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${recipientType === "all"
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "bg-brand-neutral text-brand-secondary group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                    }`}
                >
                  <Globe className="size-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-brand-ink">All Companies</h3>
                  <p className="text-xs text-brand-secondary/70">
                    Send to all Company administrators
                  </p>
                </div>
                {recipientType === "all" && (
                  <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-brand-primary text-white animate-in zoom-in duration-300">
                    <div className="size-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Specific Company Card */}
            <div
              onClick={() => setRecipientType("specific")}
              className={`group cursor-pointer relative overflow-hidden rounded-[24px] border p-5 transition-all duration-300 ${recipientType === "specific"
                ? "border-brand-primary bg-brand-primary/5 ring-1 ring-brand-primary/20 shadow-md shadow-brand-primary/5"
                : "border-brand-line bg-white hover:border-brand-primary/30 hover:bg-brand-neutral/40"
                }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ${recipientType === "specific"
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                    : "bg-brand-neutral text-brand-secondary group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
                    }`}
                >
                  <Layout className="size-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-brand-ink">Enter Company Names</h3>
                  <p className="text-xs text-brand-secondary/70">
                    Click to open Company dropdown
                  </p>
                </div>
                {recipientType === "specific" && (
                  <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-brand-primary text-white animate-in zoom-in duration-300">
                    <div className="size-1.5 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conditional Dropdown for Specific Company */}
          {recipientType === "specific" && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-primary">
                  Company Name
                </span>
              </div>
              <div className="relative group">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-brand-line bg-white px-5 text-sm font-medium text-brand-ink outline-none transition-all focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/5 cursor-pointer"
                >
                  <option value="" disabled>Select company name</option>
                  <option value="acme">Acme Corporation</option>
                  <option value="globex">Globex Corporation</option>
                  <option value="soylent">Soylent Corp</option>
                  <option value="initech">Initech</option>
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-secondary group-hover:text-brand-primary transition-colors">
                  <ChevronRight className="size-4 rotate-90" />
                </div>
              </div>
            </div>
          )}

          <p className="flex items-center gap-2.5 text-[11px] font-semibold text-brand-primary/80 px-1">
            <span className="flex size-3.5 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
              <span className="size-1 rounded-full bg-brand-primary" />
            </span>
            {recipientType === "all" 
              ? "Notification will be sent to ALL company administrators" 
              : "Notification will be sent to the selected company administrators"}
          </p>
        </div>

        {/* SUBJECT SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary/60">
              Subject
            </span>
            <div className="h-px flex-1 bg-brand-line/40" />
          </div>
          <div className="rounded-[32px] border border-brand-line bg-white p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-primary/10 focus-within:border-brand-primary transition-all">
            <div className="flex items-center gap-4 px-4 py-2">
              <Type className="size-5 text-brand-primary/40" />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter notification subject"
                className="h-10 w-full bg-transparent text-sm font-medium text-brand-ink outline-none placeholder:text-brand-secondary/40"
              />
            </div>
          </div>
          <p className="text-[11px] font-medium text-brand-tertiary px-2">
            Clear and concise subject line
          </p>
        </div>

        {/* MESSAGE SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary/60">
              Message
            </span>
            <div className="h-px flex-1 bg-brand-line/40" />
          </div>
          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-sm focus-within:ring-2 focus-within:ring-brand-primary/10 focus-within:border-brand-primary transition-all">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              className="min-h-[220px] w-full resize-none bg-transparent text-sm leading-relaxed text-brand-ink outline-none placeholder:text-brand-secondary/40"
            />
            <div className="mt-4 flex items-center justify-end border-t border-brand-neutral pt-4 text-[11px] font-medium text-brand-secondary/40">
              {message.length} characters
            </div>
          </div>
          <p className="text-[11px] font-medium text-brand-primary/70 px-2">
            Provide detailed information
          </p>
        </div>

        {/* ACTIONS SECTION */}
        <div className="space-y-5 rounded-[40px] border border-brand-line bg-white p-8 md:p-10 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-secondary/60">
              Actions
            </span>
            <div className="h-px flex-1 bg-brand-line/40" />
          </div>

          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-sm font-bold text-brand-ink">Review and send notification</h4>
              <p className="text-xs text-brand-secondary/70 leading-relaxed max-w-sm">
                Ensure all details are correct before sending. This message will be delivered instantly to the selected recipients.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={handleClear}
                className="h-14 flex-1 md:flex-none px-8 rounded-2xl border-brand-line text-brand-secondary hover:bg-brand-soft font-bold transition-all"
              >
                <Trash2 className="mr-2 size-4" />
                Clear
              </Button>
              <Button
                onClick={handleSend}
                disabled={!subject || !message}
                className="h-14 flex-1 md:flex-none px-10 rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:shadow-xl hover:shadow-brand-primary/30 transition-all font-bold disabled:opacity-50 disabled:shadow-none"
              >
                <Send className="mr-2 size-4" />
                Send Notification
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-neutral/60">
            <p className="text-[11px] font-medium text-brand-secondary/60 flex items-center justify-center md:justify-start gap-2">
              <span className="size-1 rounded-full bg-brand-secondary/40" />
              Notification will be sent immediately via email
            </p>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
