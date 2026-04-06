import { 
  ArrowUpRight, 
  BadgeIndianRupee, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Users, 
  FileBarChart2,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";
import { SuperAdminLayout } from "../components/super-admin-layout";

const stats = [
  {
    label: "Total Revenue",
    value: "₹1,24,500",
    change: "+12.5%",
    trend: "up",
    icon: BadgeIndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Monthly Revenue",
    value: "₹32,000",
    change: "+8.2%",
    trend: "up",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Plan Analytics",
    value: "48 Active",
    change: "Enterprise focus",
    trend: "neutral",
    icon: Layers,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    label: "Active Companies",
    value: "156",
    change: "+5 this week",
    trend: "up",
    icon: Building2,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    label: "User Growth",
    value: "1,240",
    change: "+15.8%",
    trend: "up",
    icon: TrendingUp,
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

const analyticLists = [
  {
    title: "Top Revenue Companies",
    description: "Highest contributing tenants this quarter",
    items: [
      { name: "Acme Digital", value: "₹45,000", detail: "Enterprise Plan" },
      { name: "Nova Partners", value: "₹28,500", detail: "Pro Plan" },
      { name: "Horizon Tech", value: "₹22,000", detail: "Enterprise Plan" },
      { name: "Soylent Corp", value: "₹18,200", detail: "Pro Plan" },
      { name: "Initech", value: "₹10,800", detail: "Basic Plan" },
    ],
  },
  {
    title: "User Engagement by Plan",
    description: "Daily active users across subscription tiers",
    items: [
      { name: "Enterprise Tier", value: "88% DAU", detail: "High Activity" },
      { name: "Pro Tier", value: "72% DAU", detail: "Steady Usage" },
      { name: "Basic Tier", value: "45% DAU", detail: "Occasional" },
      { name: "Trial Users", value: "12% DAU", detail: "Low Conversion" },
      { name: "Support Tier", value: "95% SLA", detail: "Priority" },
    ],
  },
  {
    title: "Recent Plan Upgrades",
    description: "Companies that moved to a higher tier",
    items: [
      { name: "Cyberdyne", value: "Pro → Ent", detail: "2 days ago" },
      { name: "Stark Ind.", value: "Basic → Pro", detail: "3 days ago" },
      { name: "Wayne Ent.", value: "Pro → Ent", detail: "1 week ago" },
      { name: "Globex", value: "Basic → Pro", detail: "1 week ago" },
      { name: "Umbrella", value: "Pro → Ent", detail: "2 weeks ago" },
    ],
  },
  {
    title: "Platform Usage Metrics",
    description: "Resource consumption by category",
    items: [
      { name: "Data Storage", value: "3.2 TB", detail: "68% Capacity" },
      { name: "API Requests", value: "1.2M", detail: "Normal Range" },
      { name: "Compute Units", value: "850", detail: "Stable" },
      { name: "Active Sessions", value: "4.5k", detail: "+12% Peak" },
      { name: "Audit Logs", value: "15 GB", detail: "Purge in 5d" },
    ],
  },
  {
    title: "Support & Health Status",
    description: "System performance and helpdesk stats",
    items: [
      { name: "Critical Alerts", value: "0", detail: "Clean Health" },
      { name: "Pending Tickets", value: "12", detail: "Response: 1.8h" },
      { name: "Uptime (30d)", value: "99.99%", detail: "Exceeding SLA" },
      { name: "Server Latency", value: "45ms", detail: "Optimal" },
      { name: "User NPS", value: "72", detail: "Excellent" },
    ],
  },
];

export function AnalyticsPage() {
  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
              <FileBarChart2 className="size-3 text-brand-primary" />
              Platform Analytics
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Business Intelligence Overview
            </h1>
            <p className="text-sm text-brand-secondary">
              Real-time insights across revenue, companies, and user engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-px bg-brand-line/50 sm:block" />
            <div className="flex flex-col text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">
                Last Updated
              </p>
              <p className="text-sm font-semibold text-brand-ink">Just now</p>
            </div>
          </div>
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[28px] border border-brand-line bg-white p-5 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
              >
                <div className="flex flex-col gap-4">
                  <div className={`flex size-10 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-secondary">
                      {stat.label}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-brand-ink">
                      {stat.value}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className={`text-[10px] font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-brand-secondary'}`}>
                      {stat.change}
                    </span>
                    <ArrowUpRight className={`size-3 ${stat.trend === 'up' ? 'text-emerald-600' : 'hidden'}`} />
                  </div>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-brand-neutral opacity-40 group-hover:bg-brand-primary/5 transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Analytics List - 5 Detailed Items */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {analyticLists.map((list, index) => (
            <section
              key={list.title}
              className={`flex flex-col rounded-[32px] border border-brand-line bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md ${
                index >= 3 ? "lg:col-span-1.5 lg:max-w-none" : ""
              }`}
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-brand-ink">{list.title}</h4>
                  <p className="text-xs text-brand-secondary mt-1">{list.description}</p>
                </div>
                <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral text-brand-secondary group-hover:bg-brand-soft">
                  <ArrowRight className="size-4" />
                </div>
              </div>

              <div className="space-y-1 flex-1">
                {list.items.map((item, i) => (
                  <div
                    key={item.name}
                    className={`flex items-center justify-between rounded-2xl p-3 transition-colors hover:bg-brand-neutral/60 ${
                      i !== list.items.length - 1 ? "" : ""
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-brand-ink">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-brand-secondary/60 font-medium">
                        {item.detail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-primary">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-line py-3 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-neutral hover:text-brand-ink">
                View Full Report
              </button>
            </section>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
