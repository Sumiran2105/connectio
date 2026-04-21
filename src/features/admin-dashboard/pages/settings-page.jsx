import { useState } from "react";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MfaResetDialog } from "@/features/auth/components/mfa-reset-dialog";
import { useAuthStore } from "@/store/auth-store";
import { Bell, Lock, User, Building2, ShieldCheck, Mail, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const session = useAuthStore((state) => state.session);

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "company", label: "Company Workspace", icon: Building2 },
    { id: "security", label: "Security & MFA", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Settings Sidebar Menus */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
          <h2 className="px-4 text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/50 mb-4">Settings Menu</h2>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                    : "text-brand-ink/70 hover:bg-brand-soft hover:text-brand-ink"
                )}
              >
                <Icon className="size-4.5" />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 max-w-3xl">
          <div className="rounded-[32px] border border-brand-line bg-white shadow-sm overflow-hidden">

            {/* Headers */}
            <div className="border-b border-brand-line px-8 py-6 bg-brand-soft/20">
              <h2 className="text-2xl font-bold text-brand-ink">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-brand-secondary mt-1">
                Manage your {activeTab} preferences and configurations.
              </p>
            </div>

            <div className="p-8">
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-6 pb-6 border-b border-brand-line/50">
                    <div className="size-20 rounded-full border-2 border-brand-primary/20 bg-brand-soft flex items-center justify-center overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" alt="Profile avatar" className="size-full object-cover" />
                    </div>
                    <div>
                      <Button className="rounded-xl bg-brand-primary text-white hover:bg-brand-primary/90">Upload new photo</Button>
                      <Button variant="ghost" className="rounded-xl ml-2 text-brand-secondary hover:text-red-500">Remove</Button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <Label className="text-brand-ink font-semibold">First Name</Label>
                      <Input defaultValue="Sarah" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-brand-ink font-semibold">Last Name</Label>
                      <Input defaultValue="Jenkins" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                      <Label className="text-brand-ink font-semibold">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-brand-secondary/50" />
                        <Input defaultValue="sarah.j@company.com" disabled className="h-12 rounded-xl pl-11 bg-brand-neutral/50 opacity-70 border-brand-line/50" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20">Save Profile</Button>
                  </div>
                </div>
              )}

              {activeTab === "company" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <div className="space-y-2.5">
                      <Label className="text-brand-ink font-semibold">Workspace Name</Label>
                      <Input defaultValue="Acme Corp Global" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-brand-ink font-semibold">Workspace Domain / Slug</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-secondary font-medium pl-2">connectio.com/w/</span>
                        <Input defaultValue="acmecorp" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white flex-1" />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label className="text-brand-ink font-semibold">Timezone</Label>
                      <select className="flex h-12 w-full rounded-xl border border-brand-line/50 bg-brand-neutral/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>America/Los_Angeles (PST)</option>
                        <option>America/New_York (EST)</option>
                        <option>Europe/London (GMT)</option>
                        <option>Asia/Kolkata (IST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20">Update Workspace</Button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex gap-4">
                    <div className="mt-1">
                      <ShieldCheck className="size-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-ink">Two-Factor Authentication is Active</h4>
                      <p className="text-sm text-brand-secondary mt-1 leading-relaxed">Your account is protected with an authenticator app. We recommend keeping this enabled to secure company data.</p>
                      <div className="mt-4">
                        <MfaResetDialog
                          session={session}
                          triggerLabel="Configure MFA"
                          triggerVariant="outline"
                          triggerClassName="border-brand-line rounded-xl text-brand-ink h-9"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-2 border-t border-brand-line/50 mt-8">
                    <h3 className="font-bold text-brand-ink text-lg">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">Current Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">New Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-brand-ink font-semibold">Confirm New Password</Label>
                        <Input type="password" placeholder="••••••••" className="h-12 rounded-xl bg-brand-neutral/50 border-brand-line/50 focus:bg-white" />
                      </div>
                    </div>
                    <Button className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90">Update Password</Button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {[
                    { title: "Email Notifications", desc: "Receive summary emails of workspace activity.", defaultOn: true, icon: Mail },
                    { title: "Push Notifications", desc: "Receive alerts on your dashboard and mobile.", defaultOn: true, icon: Smartphone },
                    { title: "New User Approvals", desc: "Get alerted when new users request to join the workspace.", defaultOn: false, icon: User },
                    { title: "Security Alerts", desc: "Important notices about MFA changes or unusual sign-ins.", defaultOn: true, icon: Lock },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl border border-brand-line/50 bg-white hover:border-brand-line transition-colors shadow-sm">
                      <div className="flex gap-4 items-center">
                        <div className="size-10 rounded-xl bg-brand-soft flex items-center justify-center">
                          <setting.icon className="size-5 text-brand-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-brand-ink">{setting.title}</h4>
                          <p className="text-xs text-brand-secondary mt-0.5">{setting.desc}</p>
                        </div>
                      </div>
                      <Switch defaultChecked={setting.defaultOn} />
                    </div>
                  ))}
                  <div className="flex justify-end pt-4">
                    <Button className="rounded-2xl h-11 px-8 bg-brand-primary text-white hover:bg-brand-primary/90 shadow-lg shadow-brand-primary/20">Save Preferences</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
