import {
  Bell,
  Calendar,
  ChevronRight,
  ClipboardCheck,
  Hash,
  LayoutDashboard,
  LogOut,
  Settings,
  UserPlus,
  Users,
  Users2,
  Menu,
  X,
  Search,
  BarChart3,
  History,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { AssistiveTouch } from "./assistive-touch";

export function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarGroups = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
      ],
    },
    {
      title: "Management",
      items: [
        { label: "Users", icon: Users, path: "/admin/dashboard/users" },
        { label: "Approvals", icon: ClipboardCheck, path: "/admin/dashboard/approvals" },
        { label: "Invite User", icon: UserPlus, path: "/admin/dashboard/invite" },
      ],
    },
    {
      title: "Collaboration",
      items: [
        { label: "Channels", icon: Hash, path: "/admin/dashboard/channels" },
        { label: "Teams", icon: Users2, path: "/admin/dashboard/teams" },
        { label: "Meetings", icon: Calendar, path: "/admin/dashboard/meetings" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", icon: Settings, path: "/admin/dashboard/settings" },
      ],
    },
  ];

  const identity = useMemo(() => {
    const email = session?.email || "admin@company.com";
    const [namePart] = email.split("@");
    const displayName = namePart
      .split(/[.\-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      email,
      displayName: displayName || "Admin",
      role: session?.role || "ADMIN",
    };
  }, [session]);

  function handleSignOut() {
    clearSession();
    navigate("/admin/auth", { replace: true });
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_38%,_#f6f6ff_100%)] text-brand-ink">
      {/* Mobile Header */}
      <div className="flex items-center justify-between border-b border-brand-line bg-brand-primary p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-white/20 p-1.5 backdrop-blur-sm">
            <LayoutDashboard className="size-full text-white" />
          </div>
          <span className="font-semibold text-white">Admin Panel</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="rounded-lg border border-white/20 bg-white/10 p-2 text-white outline-none active:scale-95"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside
          className={`${isMobileMenuOpen ? "flex" : "hidden"
            } fixed inset-0 z-50 flex-col bg-brand-primary text-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-[292px] lg:border-r lg:border-brand-line`}
        >
          {/* Mobile Close Button */}
          <div className="flex items-center justify-end p-4 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="rounded-full border border-white/20 bg-white/10 p-2 text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex h-full flex-col px-5 py-6 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            {/* Workspace Header */}
            <div
              className="group cursor-pointer rounded-[28px] border border-white/[0.12] bg-white/[0.08] p-5 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-brand-primary/20"
              onClick={() => {
                navigate("/admin/dashboard");
                setIsMobileMenuOpen(false);
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                Workspace Admin
              </p>
              <h1 className="mt-3 text-xl font-bold tracking-tight text-white lg:text-2xl">
                Connectio Hub
              </h1>
              <p className="mt-2 text-xs leading-5 text-white/[0.6] line-clamp-2">
                Manage users, channels, and team operations across the organization.
              </p>
            </div>

            {/* Profile Section */}
            <div className="mt-8 flex items-center gap-3 rounded-[24px] border border-white/[0.12] bg-white/[0.08] p-4 transition-colors hover:bg-white/10">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-secondary/40 to-brand-soft/20 font-bold text-white shadow-sm ring-1 ring-white/20">
                {identity.displayName.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-bold text-white">{identity.displayName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90 ring-1 ring-white/10">
                    {identity.role.replaceAll("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-10 flex-1 space-y-9 pb-10">
              {sidebarGroups.map((group) => (
                <div key={group.title} className="space-y-4">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">
                    {group.title}
                  </p>
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${isActive
                            ? "bg-brand-neutral text-brand-primary shadow-[0_4px_20px_rgba(0,0,0,0.1)] ring-1 ring-white/20"
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                          <span className="flex items-center gap-3.5">
                            <Icon className={`size-[18px] transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                            {item.label}
                          </span>
                          <ChevronRight className={`size-4 transition-all duration-300 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-60 group-hover:translate-x-0"}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-2xl border-white/10 bg-white/5 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 active:scale-[0.98]"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-brand-ink/60 backdrop-blur-sm lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Content Area */}
        <section className="relative flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="h-20 bg-white/40 backdrop-blur-md border-b border-brand-line/10 px-6 lg:px-10 flex items-center justify-between gap-4 sticky top-0 z-30">
            {/* Breadcrumbs */}
            <div className="hidden md:flex items-center gap-2 overflow-hidden whitespace-nowrap">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-ink/40 leading-none">Admin</span>

              {(() => {
                const activeGroup = sidebarGroups.find(group =>
                  group.items.some(item => location.pathname === item.path)
                );
                const activeItem = activeGroup?.items.find(item => location.pathname === item.path);

                if (!activeGroup || !activeItem) return null;

                return (
                  <>
                    <ChevronRight className="size-3 text-brand-ink/20" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-ink/40 leading-none">
                      {activeGroup.title}
                    </span>
                    <ChevronRight className="size-3 text-brand-ink/20" />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-primary leading-none">
                      {activeItem.label}
                    </span>
                  </>
                );
              })()}
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-ink/30 group-focus-within:text-brand-primary transition-colors" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full bg-[#EBF1F2]/60 border-none rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all placeholder:text-brand-ink/30"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 lg:gap-6">
              {/* Notification Toggle */}
              <button className="relative p-2 rounded-xl bg-white shadow-sm border border-brand-line/20 hover:bg-brand-soft transition-colors">
                <Bell className="size-5 text-brand-ink/70" />
                <span className="absolute top-2 right-2 size-2 bg-red-500 border-2 border-white rounded-full" />
              </button>

              {/* Vertical Divider */}
              <div className="h-8 w-px bg-brand-line/30 hidden sm:block" />

              {/* User Profile */}
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-brand-ink leading-none group-hover:text-brand-primary transition-colors">{identity.displayName}</p>
                  <p className="text-[10px] text-brand-ink/40 font-bold mt-1 uppercase tracking-tight">Super Admin</p>
                </div>
                <div className="size-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-brand-soft transition-transform group-hover:scale-105">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
                    alt="Profile"
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-5 py-6 sm:px-8 lg:px-12 lg:py-10 overflow-y-auto">
            <div className="mx-auto max-w-[1200px]">
              {children}
            </div>
          </div>
        </section>
        <AssistiveTouch />
      </div>
    </main>
  );
}
