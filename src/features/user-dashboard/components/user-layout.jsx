import {
  Bell,
  Bot,
  Calendar,
  ChevronRight,
  ClipboardList,
  FileText,
  Gem,
  Hash,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Users,
  Users2,
  Video,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FloatingActionMenu } from "@/components/floating-action-menu";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";

export function UserLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems = [
    { label: "Home", icon: Home, path: "/user/dashboard" },
    { label: "Chat", icon: MessageCircle, path: "/user/dashboard/chat" },
    { label: "Meet", icon: Video, path: "/user/dashboard/meet" },
    { label: "Channels", icon: Hash, path: "/user/dashboard/channels" },
    { label: "Teams", icon: Users2, path: "/user/dashboard/teams" },
    { label: "Files", icon: FileText, path: "/user/dashboard/files" },
    { label: "Calendar", icon: Calendar, path: "/user/dashboard/calendar" },
    { label: "AI", icon: Bot, path: "/user/dashboard/ai" },
  ];

  const identity = useMemo(() => {
    const email = session?.email || "user@demo.com";
    const [namePart] = email.split("@");
    const displayName = namePart
      .split(/[.\-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      email,
      displayName: displayName || "User",
      role: session?.role || "USER",
    };
  }, [session]);

  const activeItem =
    sidebarItems.find((item) => item.path === location.pathname) ||
    sidebarItems.find((item) => location.pathname.startsWith(`${item.path}/`)) ||
    sidebarItems[0];

  const quickActions = [
    {
      icon: MessageCircle,
      label: "Chat",
      color: "bg-emerald-500/15 text-emerald-600",
      path: "/user/dashboard/chat",
    },
    {
      icon: Video,
      label: "Meet",
      color: "bg-blue-500/15 text-blue-600",
      path: "/user/dashboard/meet",
    },
    {
      icon: Bot,
      label: "AI",
      color: "bg-violet-500/15 text-violet-600",
      path: "/user/dashboard/ai",
    },
  ];

  function handleSignOut() {
    clearSession();
    navigate("/login?mode=workspace", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_38%,_#f6f6ff_100%)] text-brand-ink">
      <div className="flex items-center justify-between border-b border-brand-line/10 bg-white p-4 shadow-sm lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
            <Users2 className="size-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-brand-ink">Connectio</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="rounded-lg border border-brand-line/20 bg-brand-soft p-2 text-brand-ink outline-none transition-transform active:scale-95"
          type="button"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={`${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r bg-[#f0f4f5] text-brand-ink transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-auto lg:w-[72px] lg:h-screen lg:translate-x-0`}
        >
          <div className="flex h-full flex-col items-center py-4 [scrollbar-width:thin]">
            {/* Teams-like Top Icon */}
            <div
              className="mb-4 flex size-12 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:bg-black/5"
              onClick={() => navigate("/user/dashboard")}
            >
              <div className="relative flex size-10 items-center justify-center rounded-lg bg-indigo-600 shadow-lg">
                <Users2 className="size-6 text-white" />
                <div className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-sm bg-white p-0.5 animate-pulse">
                  <span className="text-[8px] font-bold text-indigo-600">T</span>
                </div>
              </div>
            </div>

            {/* Navigation Rail */}
            <nav className="flex w-full flex-1 flex-col items-center space-y-1 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/10 hover:[&::-webkit-scrollbar-thumb]:bg-black/20">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === "/user/dashboard"
                  ? location.pathname === item.path
                  : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 px-4 py-3 transition-all duration-200 lg:flex-col lg:gap-1.5 lg:px-0 lg:py-2 ${isActive
                      ? "bg-indigo-50 text-indigo-600 lg:bg-transparent"
                      : "text-brand-ink/70 hover:bg-black/5 hover:text-brand-ink lg:hover:bg-transparent"
                      }`}
                  >
                    {/* Active Indicator Rail */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600" />
                    )}

                    <Icon className={`size-6 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                    <span className={`text-sm font-medium leading-none transition-all duration-200 lg:text-[10px] ${isActive ? "opacity-100" : "opacity-80"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom Premium-like Icon */}
            <div className="mt-auto border-t border-brand-line/20 pt-4 pb-2">
              <button
                type="button"
                className="group flex flex-col items-center gap-1.5 transition-all duration-200 hover:text-brand-ink"
                onClick={() => navigate("/user/dashboard/settings")}
              >
                <Gem className="size-6 text-brand-ink/60 group-hover:text-amber-500 transition-colors" />
              </button>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen ? (
          <div
            className="fixed inset-0 z-40 bg-brand-ink/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        ) : null}

        <section className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-brand-line/15 bg-white px-6 shadow-[0_6px_24px_rgba(68,83,74,0.05)] lg:px-10">
            <div className="hidden items-center gap-2 overflow-hidden whitespace-nowrap md:flex">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-ink/40">
                User
              </span>
              <ChevronRight className="size-3 text-brand-ink/20" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-primary">
                {activeItem.label}
              </span>
            </div>

            <div className="group relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-ink/30 transition-colors group-focus-within:text-brand-primary" />
              <input
                type="text"
                placeholder="Search chats, meetings, files..."
                className="w-full rounded-2xl border border-brand-line/30 bg-[#ebf1f2]/60 py-2.5 pl-11 pr-4 text-sm placeholder:text-brand-ink/30 focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
              <button className="relative rounded-xl border border-brand-line/20 bg-white p-2 shadow-sm transition-colors hover:bg-brand-soft" type="button">
                <Bell className="size-5 text-brand-ink/70" />
                <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-white bg-red-500" />
              </button>

              <div className="hidden h-8 w-px bg-brand-line/30 sm:block" />

              <div className="group flex cursor-pointer items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold leading-none text-brand-ink transition-colors group-hover:text-brand-primary">
                    {identity.displayName}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-brand-ink/40">
                    User Access
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-brand-soft font-semibold text-brand-primary shadow-md">
                  {identity.displayName.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
            <div className="mx-auto max-w-[1200px]">{children}</div>
          </div>
        </section>

        <FloatingActionMenu items={quickActions} />
      </div>
    </main>
  );
}
