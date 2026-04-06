import {
  Activity,
  ArrowUpRight,
  BadgeIndianRupee,
  Building2,
  Plus,
  Shield,
  UserRoundCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "../components/super-admin-layout";

const summaryCards = [
  {
    label: "Companies onboarded",
    value: "24",
    note: "7 awaiting activation",
    icon: Building2,
  },
  {
    label: "Company admins invited",
    value: "41",
    note: "5 pending invite acceptance",
    icon: UserRoundCog,
  },
  {
    label: "Active subscriptions",
    value: "18",
    note: "3 enterprise renewals this week",
    icon: BadgeIndianRupee,
  },
  {
    label: "System health",
    value: "98.6%",
    note: "No critical alerts in the last 24h",
    icon: Activity,
  },
];

const quickActions = [
  {
    title: "Add company",
    description: "Create a new tenant company and register its workspace domain.",
    onClick: (navigate) => navigate("/super-admin/dashboard/companies/create"),
  },
  {
    title: "Add company admin",
    description: "Invite the primary company admin and start the activation flow.",
    onClick: (navigate) => navigate("/super-admin/dashboard/admins/create"),
  },
  {
    title: "Review pending users",
    description: "Track approval queues and escalations across company workspaces.",
  },
  {
    title: "Open monitoring",
    description: "Check CPU, memory, alerts, and weekly health reports.",
  },
];

const queueItems = [
  {
    title: "Company activation pending",
    detail: "Acme Digital is waiting on domain verification and MFA completion.",
    tag: "Needs follow-up",
  },
  {
    title: "Admin invitation sent",
    detail: "Nova Partners received an invite but has not activated its admin account.",
    tag: "Awaiting acceptance",
  },
  {
    title: "Subscription watch",
    detail: "Two premium plans are nearing renewal and one enterprise plan needs review.",
    tag: "Billing review",
  },
];

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <SuperAdminLayout>
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
            <Shield className="size-3.5 text-brand-primary" />
            Platform Overview
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
              Manage companies, admin access, and platform operations.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brand-secondary sm:text-base">
              This starter dashboard maps directly to the flows in the
              product document so we can grow into real backend modules
              without redoing the navigation shell.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className="h-11 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
            onClick={() => navigate("/super-admin/dashboard/companies/create")}
          >
            <Plus className="size-4" />
            Add company
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl border-brand-tertiary/20 bg-white px-5 text-brand-tertiary hover:bg-brand-tertiary/5"
            onClick={() => navigate("/super-admin/dashboard/admins/create")}
          >
            <UserRoundCog className="size-4" />
            Add company admin
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_14px_40px_rgba(68,83,74,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-brand-secondary">{card.label}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-ink">
                    {card.value}
                  </p>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
                  <Icon className="size-5 text-brand-primary" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-secondary">{card.note}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <section className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                Quick actions
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-brand-ink">
                Core super admin workflows
              </h3>
            </div>
            <ArrowUpRight className="size-5 text-brand-secondary" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.title}
                type="button"
                onClick={() => action.onClick?.(navigate)}
                className="rounded-[24px] border border-brand-line bg-brand-neutral p-5 text-left transition hover:border-brand-secondary/35 hover:bg-brand-soft"
              >
                <p className="text-base font-semibold text-brand-ink">{action.title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-brand-line bg-brand-tertiary p-6 text-white shadow-[0_16px_50px_rgba(145,68,64,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/[0.72]">
            Workflow queue
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Items that need super admin attention
          </h3>

          <div className="mt-6 space-y-4">
            {queueItems.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] border border-white/[0.12] bg-white/10 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/[0.78]">
                      {item.detail}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/[0.15] bg-white/[0.12] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/[0.82]">
                    {item.tag}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}
