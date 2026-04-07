import {
  Activity,
  ArrowRight,
  BadgeIndianRupee,
  BellRing,
  Building2,
  CalendarClock,
  CircleAlert,
  CreditCard,
  Plus,
  Shield,
  UserRoundCog,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "../components/super-admin-layout";

const overviewCards = [
  {
    label: "Total Companies",
    value: "24",
    note: "4 added this week",
    icon: Building2,
  },
  {
    label: "Company Admins",
    value: "41",
    note: "5 pending activation",
    icon: UserRoundCog,
  },
  {
    label: "Billing Collected",
    value: "Rs. 1.38L",
    note: "This month across all plans",
    icon: BadgeIndianRupee,
  },
  {
    label: "Platform Health",
    value: "98.6%",
    note: "No critical alerts today",
    icon: Activity,
  },
];

const recentCompanies = [
  { name: "Levitica", domain: "leviticatechnologies.com", createdOn: "07 Apr 2026", status: "Active" },
  { name: "PNSR", domain: "pnsr.com", createdOn: "06 Apr 2026", status: "Pending" },
  { name: "Sonic Solutions", domain: "sonicsolutions.com", createdOn: "05 Apr 2026", status: "Active" },
  { name: "Sai Systems", domain: "saisystems.com", createdOn: "03 Apr 2026", status: "Draft" },
];

const recentAdmins = [
  { name: "Akhil Reddy", email: "akhil@leviticatechnologies.com", company: "Levitica", status: "Active" },
  { name: "Sumiran DSM", email: "sumiran.dsm@gmail.com", company: "Pexpo", status: "Pending" },
  { name: "Meera Shah", email: "meera@sonicsolutions.com", company: "Sonic Solutions", status: "Active" },
  { name: "Rahul Varma", email: "rahul@pnsr.com", company: "PNSR", status: "Pending" },
];

const attentionItems = [
  {
    title: "Company activations pending",
    detail: "5 companies are waiting for company-admin activation and domain confirmation.",
    tag: "High Priority",
    icon: CircleAlert,
  },
  {
    title: "Admin invitations awaiting response",
    detail: "3 invited admins have not yet completed the activation flow.",
    tag: "Follow-up",
    icon: Users,
  },
  {
    title: "Subscription renewals due",
    detail: "2 premium plans and 1 enterprise plan are nearing billing renewal.",
    tag: "Billing",
    icon: CreditCard,
  },
];

const todayActions = [
  {
    title: "Create a new company",
    description: "Provision a tenant and prepare its workspace domain for onboarding.",
    onClick: (navigate) => navigate("/super-admin/dashboard/companies/create"),
  },
  {
    title: "Invite company admin",
    description: "Send the activation invite to the primary admin of a company.",
    onClick: (navigate) => navigate("/super-admin/dashboard/admins/create"),
  },
  {
    title: "Review billing records",
    description: "Check plan details, payment IDs, and latest payment dates.",
    onClick: (navigate) => navigate("/super-admin/dashboard/billing"),
  },
  {
    title: "Open company admin list",
    description: "Inspect all onboarded company admins from one place.",
    onClick: (navigate) => navigate("/super-admin/dashboard/admins"),
  },
];

function statusClass(status) {
  if (status === "Active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-brand-line bg-brand-neutral text-brand-secondary";
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();

  return (
    <SuperAdminLayout>
      <div className="space-y-8 pb-10">
        <section className="rounded-[36px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)] md:p-8">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                <Shield className="size-3.5 text-brand-primary" />
                Super Admin Dashboard
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-brand-ink sm:text-4xl">
                  Oversee onboarding, admins, billing, and platform activity from one command center.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-brand-secondary sm:text-base">
                  This is the first screen after login for super admins. It gives a quick
                  operational view of the whole platform, with shortcuts into companies,
                  company admins, billing, and the flows that need attention today.
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
                className="h-11 rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/admins/create")}
              >
                <UserRoundCog className="size-4" />
                Add company admin
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="rounded-[28px] border border-brand-line bg-white p-5 shadow-[0_14px_40px_rgba(68,83,74,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-brand-secondary">{card.label}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-brand-ink">
                      {card.value}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-brand-secondary">{card.note}</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
                    <Icon className="size-5 text-brand-primary" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Quick Actions
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-brand-ink">
                  Start the most common super admin tasks
                </h2>
              </div>
              <ArrowRight className="size-5 text-brand-secondary" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {todayActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => action.onClick(navigate)}
                  className="rounded-[24px] border border-brand-line bg-brand-neutral p-5 text-left transition hover:border-brand-secondary/35 hover:bg-brand-soft"
                >
                  <p className="text-base font-semibold text-brand-ink">{action.title}</p>
                  <p className="mt-2 text-sm leading-6 text-brand-secondary">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-line bg-brand-tertiary p-6 text-white shadow-[0_16px_50px_rgba(145,68,64,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/72">
              Needs Attention
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Priority items for today
            </h2>

            <div className="mt-6 space-y-4">
              {attentionItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-white/12 bg-white/10 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex size-9 items-center justify-center rounded-2xl bg-white/12">
                        <Icon className="size-4.5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <span className="rounded-full border border-white/15 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/82">
                            {item.tag}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/78">{item.detail}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section> */}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-brand-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Recent Companies
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Newly onboarded companies
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-brand-line bg-white px-4 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/companies")}
              >
                View all
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-brand-neutral">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Created On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentCompanies.map((company) => (
                    <tr key={company.name} className="border-t border-brand-line hover:bg-brand-neutral/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-brand-ink">{company.name}</p>
                        <p className="mt-1 text-sm text-brand-secondary">{company.domain}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{company.createdOn}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(company.status)}`}>
                          {company.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-brand-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Company Admins
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Recent company admin activity
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-brand-line bg-white px-4 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/admins")}
              >
                View all
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-brand-neutral">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdmins.map((admin) => (
                    <tr key={admin.email} className="border-t border-brand-line hover:bg-brand-neutral/50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-brand-ink">{admin.name}</p>
                        <p className="mt-1 text-sm text-brand-secondary">{admin.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{admin.company}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(admin.status)}`}>
                          {admin.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-start gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
                <CalendarClock className="size-5 text-brand-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Upcoming
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Scheduled follow-ups
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-sm font-semibold text-brand-ink">Billing review with finance</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">08 Apr 2026 at 11:30 AM</p>
              </div>
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-sm font-semibold text-brand-ink">Pending activation follow-up</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">09 Apr 2026 at 3:00 PM</p>
              </div>
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-sm font-semibold text-brand-ink">Platform health check</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">10 Apr 2026 at 9:30 AM</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Shortcuts
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Direct links into platform modules
                </h3>
              </div>
              <BellRing className="size-5 text-brand-secondary" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-start rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/companies")}
              >
                <Building2 className="size-4" />
                All companies
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-start rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/admins")}
              >
                <Users className="size-4" />
                All company admins
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-start rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/billing")}
              >
                <CreditCard className="size-4" />
                Billing
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-start rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/notifications")}
              >
                <BellRing className="size-4" />
                Notifications
              </Button>
            </div>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}
