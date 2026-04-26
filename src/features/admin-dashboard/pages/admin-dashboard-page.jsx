import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, ShieldCheck, Users, LoaderCircle, UserCheck, CalendarClock, TrendingUp } from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/lib/client";
import { COMPANY_DASHBOARD, COMPANY_KPI_TRENDS } from "@/config/api";
import { Button } from "@/components/ui/button";

const actions = [
  {
    title: "Approve pending users",
    description: "Review registrations and allow users into the company workspace.",
    icon: Users,
  },
  {
    title: "Manage company teams",
    description: "Maintain teams, channels, and company collaboration structure.",
    icon: Building2,
  },
  {
    title: "Security and MFA",
    description: "Track protected access, device trust, and role management.",
    icon: ShieldCheck,
  },
];

export function AdminDashboardPage() {
  const session = useAuthStore((state) => state.session);
  const [kpiRangeType, setKpiRangeType] = useState("weekly");

  const { data: dashboardData = {}, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get(COMPANY_DASHBOARD, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.accessToken,
    retry: 1,
  });

  const { data: kpiData = { trend: [] }, isLoading: isKpiLoading } = useQuery({
    queryKey: ["kpi-trends", kpiRangeType],
    queryFn: async () => {
      const response = await apiClient.get(COMPANY_KPI_TRENDS(kpiRangeType), {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return response.data;
    },
    enabled: !!session?.accessToken,
    retry: 1,
  });

  const overviewCards = [
    {
      label: "Total Users",
      value: dashboardData?.total_users || 0,
      icon: Users,
      accent: "bg-brand-soft text-brand-primary",
    },
    {
      label: "Active Users",
      value: dashboardData?.active_users || 0,
      icon: UserCheck,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending Users",
      value: dashboardData?.pending_users || 0,
      icon: Users,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Total Meetings",
      value: dashboardData?.total_meetings || 0,
      icon: CalendarClock,
      accent: "bg-sky-50 text-sky-700",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 pb-12">
        {/* Hero Section */}
        <section className="rounded-3xl">
          <div className="flex flex-col gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
                <ShieldCheck className="size-3.5" />
                Admin Dashboard
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-brand-ink lg:text-5xl">
                  Company Admin Dashboard
                </h1>
                {/* <p className="max-w-2xl text-base leading-8 text-brand-secondary/80">
                  Monitor workspace activity, manage users, schedule meetings, and oversee collaboration across your organization.
                </p> */}
              </div>
            </div>
          </div>
        </section>

        {/* Overview Stats Cards */}
        {isLoading ? (
          <section className="flex items-center justify-center py-20 gap-3 text-brand-secondary">
            <LoaderCircle className="size-6 animate-spin" />
            <span className="text-lg font-medium">Loading dashboard data</span>
          </section>
        ) : error ? (
          <section className="rounded-3xl border border-rose-300 bg-rose-50 p-8 text-center">
            <p className="text-sm font-medium text-rose-700">
              Unable to load dashboard data. Showing default values.
            </p>
          </section>
        ) : null}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className="group relative overflow-hidden rounded-3xl border border-brand-line bg-white p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity" />
                <div className="relative space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">
                      {card.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-brand-ink">
                      {card.value}
                    </p>
                  </div>
                  {/* note removed */}
                </div>
                <div className="absolute right-6 top-1/4 -translate-y-1/2">
                  <div className={`flex items-center justify-center rounded-xl p-3 ${card.accent} transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className="size-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* KPI Trends */}
        <section className="rounded-[32px] border border-brand-line bg-white p-7 shadow-[0_24px_80px_rgba(68,83,74,0.08)] sm:p-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft">
                  <TrendingUp className="size-5 text-brand-primary" />
                </div>
                <h2 className="text-2xl font-bold text-brand-ink">KPI Trends</h2>
              </div>
              <div className="flex gap-2">
                {[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" },
                ].map((range) => (
                  <Button
                    key={range.value}
                    onClick={() => setKpiRangeType(range.value)}
                    className={`h-10 rounded-xl px-4 text-sm font-bold transition-all ${
                      kpiRangeType === range.value
                        ? "bg-brand-primary text-white"
                        : "border border-brand-line bg-white text-brand-secondary hover:bg-brand-soft"
                    }`}
                    variant={kpiRangeType === range.value ? "default" : "outline"}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {isKpiLoading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-brand-secondary">
                <LoaderCircle className="size-6 animate-spin" />
                <span className="text-sm font-medium">Loading trends...</span>
              </div>
            ) : kpiData?.trend && kpiData.trend.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-brand-line">
                  <div className="flex h-64 items-end justify-between gap-2 rounded-xl bg-brand-neutral p-6 border border-brand-line/30">
                    {kpiData.trend.map((item, index) => {
                      const maxValue = Math.max(...kpiData.trend.map((t) => t.value || 0));
                      const heightPercent = (item.value / (maxValue || 1)) * 100;
                      const minHeight = item.value === 0 && maxValue > 0 ? "3px" : item.value > 0 ? "25px" : "0px";
                      return (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-brand-primary to-brand-primary/60 transition-all hover:opacity-80"
                            style={{ 
                              height: `${heightPercent}%`, 
                              minHeight: minHeight
                            }}
                            title={`${item.label}: ${item.value}`}
                          />
                          <span className="text-center text-[10px] font-semibold text-brand-secondary leading-tight max-w-12 overflow-hidden text-ellipsis">
                            {item.label}
                          </span>
                          <span className="text-xs font-bold text-brand-ink">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border border-brand-line rounded-xl bg-brand-neutral px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">Average Value</p>
                    <p className="text-lg font-bold text-brand-ink">
                      {(kpiData.trend.reduce((sum, t) => sum + (t.value || 0), 0) / kpiData.trend.length).toFixed(0)}
                    </p>
                  </div>
                  <div className="border border-brand-line rounded-xl bg-brand-neutral px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">Peak Value</p>
                    <p className="text-lg font-bold text-brand-ink">
                      {Math.max(...kpiData.trend.map((t) => t.value || 0))}
                    </p>
                  </div>
                  <div className="border border-brand-line rounded-xl bg-brand-neutral px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-secondary">Total Periods</p>
                    <p className="text-lg font-bold text-brand-ink">{kpiData.trend.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-brand-neutral/30 p-8 text-center">
                <p className="text-sm text-brand-secondary">No trend data available for {kpiRangeType} view</p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-[32px] border border-brand-line bg-white p-7 shadow-[0_24px_80px_rgba(68,83,74,0.08)] sm:p-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-ink">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {actions.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-brand-line bg-brand-neutral p-5 hover:shadow-md transition-all"
                  >
                    <Icon className="mb-4 size-5 text-brand-primary" />
                    <h2 className="text-base font-semibold text-brand-ink">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-secondary">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
