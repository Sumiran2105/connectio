import {
  BellRing,
  Building2,
  ChevronRight,
  CreditCard,
  FileBarChart2,
  LayoutGrid,
  LogOut,
  Plus,
  Settings2,
  UserRoundCog,
} from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
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

  function handleSignOut() {
    clearSession();
    navigate("/super-admin/auth", { replace: true });
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_38%,_#f6f6ff_100%)] text-brand-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="w-full border-b border-brand-line bg-brand-primary text-white lg:min-h-screen lg:w-[292px] lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col px-5 py-6">
            <div
              className="cursor-pointer rounded-[28px] border border-white/[0.12] bg-white/[0.08] p-5 transition hover:bg-white/10"
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
            </div>

            <div className="mt-6 rounded-[24px] border border-white/[0.12] bg-white/[0.08] p-4">
              <p className="text-sm font-semibold text-white">{identity.displayName}</p>
              <p className="mt-1 text-sm text-white/[0.72]">{identity.email}</p>
              <span className="mt-3 inline-flex rounded-full border border-white/[0.15] bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.82]">
                {identity.role.replaceAll("_", " ")}
              </span>
            </div>

            <nav className="mt-8 flex-1 space-y-8">
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
                            ? "bg-brand-neutral text-brand-ink shadow-sm"
                            : "text-white/[0.78] hover:bg-white/10 hover:text-white"
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
            </nav>

            <Button
              type="button"
              variant="outline"
              className="mt-6 h-11 rounded-2xl border-white/[0.15] bg-white/[0.08] text-white hover:bg-white/[0.12] hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <section className="flex-1 px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </section>
      </div>
    </main>
  );
}
