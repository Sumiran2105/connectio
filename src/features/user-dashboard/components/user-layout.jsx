import {
  Bell,
  Bot,
  Calendar,
  ChevronRight,
  FileText,
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
      <div className="flex items-center justify-between border-b border-brand-line bg-brand-primary p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/15">
            <Home className="size-4 text-white" />
          </div>
          <span className="font-semibold text-white">User Workspace</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="rounded-lg border border-white/20 bg-white/10 p-2 text-white"
          type="button"
        >
          {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside
          className={`${isMobileMenuOpen ? "flex" : "hidden"} fixed inset-0 z-50 flex-col bg-brand-primary text-white lg:sticky lg:top-0 lg:z-auto lg:flex lg:h-screen lg:w-[292px] lg:border-r lg:border-brand-line`}
        >
          <div className="flex h-full flex-col overflow-y-auto px-5 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
            <div
              className="cursor-pointer rounded-[24px] border border-white/10 bg-[#124f3d] p-5 transition hover:bg-[#155641]"
              onClick={() => {
                navigate("/user/dashboard");
                setIsMobileMenuOpen(false);
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                User Space
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                Collaboration workspace
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">
                Chat, meetings, files, channels, teams, calendar, and AI tools in one place.
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#124f3d] p-4">
              <p className="text-sm font-semibold text-white">{identity.displayName}</p>
              <p className="mt-1 text-sm text-white/[0.72]">{identity.email}</p>
              <span className="mt-3 inline-flex rounded-full border border-white/10 bg-[#1a684d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.82]">
                {identity.role.replaceAll("_", " ")}
              </span>
            </div>

            <nav className="mt-8 flex-1 space-y-1.5">
              {sidebarItems.map((item) => {
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
                    className={`group flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-white text-brand-primary shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3.5">
                      <Icon className={`size-[18px] ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                      {item.label}
                    </span>
                    <ChevronRight className={`size-4 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/10 pt-6">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 size-4" />
                Sign out
              </Button>
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
