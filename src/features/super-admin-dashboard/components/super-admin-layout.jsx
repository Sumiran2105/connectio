import {
  BellRing,
  Building2,
  ChevronRight,
  CreditCard,
  FileBarChart2,
  LayoutGrid,
  LogOut,
  Plus,
  Search,
  Settings2,
  UserRoundCog,
} from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export function SuperAdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);

  const sidebarGroups = [
    {
      title: "Platform",
      items: [
        { label: "Overview", icon: LayoutGrid, path: "/super-admin/dashboard" },
        { label: "Add Company", icon: Plus, path: "/super-admin/dashboard/companies/create" },
        { label: "Add Company Admin", icon: UserRoundCog, path: "/super-admin/dashboard/admins/create" },
        { label: "All Companies", icon: Building2, path: "/super-admin/dashboard/companies" },
        { label: "Company Admins", icon: UserRoundCog, path: "/super-admin/dashboard/admins" },
        // { label: "Approvals", icon: Users, path: "/super-admin/dashboard/approvals" },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "Analytics", icon: FileBarChart2, path: "/super-admin/dashboard/analytics" },
        { label: "Billing", icon: CreditCard, path: "/super-admin/dashboard/billing" },
        // { label: "Monitoring", icon: MonitorCog, path: "/super-admin/dashboard/monitoring" },
        // { label: "Security", icon: Shield, path: "/super-admin/dashboard/security" },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Notifications", icon: BellRing, path: "/super-admin/dashboard/notifications" },
        { label: "Settings", icon: Settings2, path: "/super-admin/dashboard/settings" },
        // { label: "Support", icon: LifeBuoy, path: "/super-admin/dashboard/support" },
      ],
    },
  ];

  const identity = useMemo(() => {
    const email = session?.email || "superadmin@levitica.com";
    const [namePart] = email.split("@");
    const displayName = namePart
      .split(/[.\-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      email,
      displayName: displayName || "Super Admin",
      role: session?.role || "SUPER_ADMIN",
    };
  }, [session]);

  const currentNavigation = useMemo(() => {
    const flattenedItems = sidebarGroups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.title,
      }))
    );

    const matchedItem =
      flattenedItems.find((item) => item.path === location.pathname) ||
      flattenedItems.find((item) => location.pathname.startsWith(`${item.path}/`));

    return {
      section: matchedItem?.groupTitle || "Management",
      label: matchedItem?.label || "Overview",
    };
  }, [location.pathname]);

  function handleSignOut() {
    clearSession();
    navigate("/super-admin/auth", { replace: true });
  }

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_38%,_#f6f6ff_100%)] text-brand-ink">
      <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-[#1f4f3e] bg-[#0f5b41] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[292px] lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col overflow-hidden px-5 py-6">
            {/* <div
              className="cursor-pointer rounded-[24px] border border-white/10 bg-[#124f3d] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:bg-[#155641]"
              onClick={() => navigate("/super-admin/dashboard")}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">
                Conectio Control
              </p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                Super admin workspace
              </h1>
              <p className="mt-2 text-sm leading-6 text-white/[0.72]">
                Platform-level view for company creation, admin invitations, and
                governance.
              </p>
            </div> */}

            <div className="mt-6 rounded-[24px] border border-white/10 bg-[#124f3d] p-4">
              <p className="text-sm font-semibold text-white">{identity.displayName}</p>
              <p className="mt-1 text-sm text-white/[0.72]">{identity.email}</p>
              <span className="mt-3 inline-flex rounded-full border border-white/10 bg-[#1a684d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.82]">
                {identity.role.replaceAll("_", " ")}
              </span>
            </div>

            <nav className="mt-8 flex-1 overflow-y-auto pr-1">
              <div className="space-y-8 pb-4">
                {sidebarGroups.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <p className="px-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/50">
                      {group.title}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm transition ${isActive
                              ? "bg-white text-brand-ink shadow-sm"
                              : "text-white/[0.78] hover:bg-white/8 hover:text-white"
                              }`}
                          >
                            <span className="flex items-center gap-3">
                              <Icon className="size-4" />
                              {item.label}
                            </span>
                            <ChevronRight className="size-4 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <Button
              type="button"
              variant="outline"
              className="mt-6 h-11 rounded-2xl border-white/10 bg-[#124f3d] text-white hover:bg-[#155641] hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto lg:h-screen">
          <div className="sticky top-0 z-30 border-b border-brand-line bg-white px-5 py-4 shadow-[0_6px_24px_rgba(68,83,74,0.05)] sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-secondary">
                  {currentNavigation.section} /{" "}
                  <span className="text-brand-primary">{currentNavigation.label}</span>
                </p>
                <p className="text-sm text-brand-secondary">
                  Super admin control and navigation for the current workspace module.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-[240px]">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
                  <Input
                    placeholder="Search modules, companies, admins"
                    className="h-11 rounded-2xl border-brand-line bg-brand-neutral pl-11 text-sm text-brand-ink"
                  />
                </div>

                <button
                  type="button"
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-line bg-brand-neutral text-brand-secondary transition hover:bg-brand-soft hover:text-brand-ink"
                >
                  <BellRing className="size-4.5" />
                  <span className="absolute right-3 top-3 size-2 rounded-full bg-red-500" />
                </button>

                <div className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-neutral px-3 py-2">
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                      Super Admin
                    </p>
                    <p className="text-sm font-semibold text-brand-ink">
                      {identity.displayName}
                    </p>
                  </div>
                  <Avatar size="lg" className="bg-brand-primary/10">
                    <AvatarFallback className="bg-brand-primary text-white">
                      {identity.displayName
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
