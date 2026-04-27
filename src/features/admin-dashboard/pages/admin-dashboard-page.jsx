import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const [kpiRangeType, setKpiRangeType] = useState("weekly");

  // Action handlers - navigate to pages that render in sidebar
  const handleApprovePendingUsers = () => {
    navigate('/admin/dashboard/users');
  };

  const handleManageTeams = () => {
    navigate('/admin/dashboard/teams');
  };

  const handleSecurityMFA = () => {
    navigate('/admin/dashboard/chat');
  };

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
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-5 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-primary">
                <ShieldCheck className="size-3.5" />
                Admin Dashboard
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-brand-ink lg:text-5xl">
                  Company Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleApprovePendingUsers}
                className="group relative overflow-hidden rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Users className="size-4" />
                <span className="hidden sm:inline">Approve Users</span>
                <span className="sm:hidden">Users</span>
              </button>
              <button
                onClick={handleManageTeams}
                className="group relative overflow-hidden rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Building2 className="size-4" />
                <span className="hidden sm:inline">Manage Teams</span>
                <span className="sm:hidden">Teams</span>
              </button>
              <button
                onClick={handleSecurityMFA}
                className="group relative overflow-hidden rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <ShieldCheck className="size-4" />
                <span className="hidden sm:inline">Chats</span>
                <span className="sm:hidden">Security</span>
              </button>
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
                <h2 className="text-2xl font-bold text-brand-ink">Metrics Overview</h2>
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
                  <svg viewBox="0 0 1000 300" className="w-full h-64 bg-brand-neutral rounded-xl border border-brand-line/30 p-4" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={`grid-${i}`}
                        x1="40"
                        y1={60 + (i * 50)}
                        x2="960"
                        y2={60 + (i * 50)}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                    ))}
                    
                    {/* Axes */}
                    <line x1="40" y1="60" x2="40" y2="260" stroke="#9ca3af" strokeWidth="2" />
                    <line x1="40" y1="260" x2="960" y2="260" stroke="#9ca3af" strokeWidth="2" />
                    
                    {/* Line chart */}
                    {(() => {
                      const maxValue = Math.max(...kpiData.trend.map((t) => t.value || 0)) || 1;
                      const padding = 40;
                      const graphWidth = 920;
                      const graphHeight = 200;
                      const points = kpiData.trend.map((item, index) => {
                        const x = padding + (index * (graphWidth / (kpiData.trend.length - 1 || 1)));
                        const y = 260 - ((item.value / maxValue) * graphHeight);
                        return { x, y, value: item.value, label: item.label };
                      });
                      
                      // Generate smooth catmull-rom curve
                      const generateSmoothPath = (points) => {
                        let path = `M ${points[0].x} ${points[0].y}`;
                        
                        for (let i = 0; i < points.length - 1; i++) {
                          const p0 = i > 0 ? points[i - 1] : points[i];
                          const p1 = points[i];
                          const p2 = points[i + 1];
                          const p3 = i < points.length - 2 ? points[i + 2] : p2;
                          
                          const cp1x = p1.x + (p2.x - p0.x) / 6;
                          const cp1y = p1.y + (p2.y - p0.y) / 6;
                          const cp2x = p2.x - (p3.x - p1.x) / 6;
                          const cp2y = p2.y - (p3.y - p1.y) / 6;
                          
                          path += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
                        }
                        return path;
                      };
                      
                      const pathData = generateSmoothPath(points);
                      
                      return (
                        <>
                          {/* Gradient fill under line */}
                          <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Fill area */}
                          <path
                            d={`${pathData} L ${points[points.length - 1].x} 260 L ${points[0].x} 260 Z`}
                            fill="url(#lineGradient)"
                          />
                          
                          {/* Line */}
                          <path
                            d={pathData}
                            stroke="#3b82f6"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* Points */}
                          {points.map((p, i) => (
                            <g key={`point-${i}`}>
                              <circle cx={p.x} cy={p.y} r="5" fill="#3b82f6" />
                              <circle cx={p.x} cy={p.y} r="8" fill="none" stroke="#3b82f6" strokeWidth="2" opacity="0.3" />
                            </g>
                          ))}
                          
                          {/* Labels */}
                          {points.map((p, i) => (
                            <text
                              key={`label-${i}`}
                              x={p.x}
                              y="280"
                              textAnchor="middle"
                              fontSize="12"
                              fill="#6b7280"
                              fontWeight="600"
                            >
                              {p.label}
                            </text>
                          ))}
                          
                          {/* Value tooltips on hover */}
                          {points.map((p, i) => (
                            <g key={`tooltip-${i}`}>
                              <rect
                                x={p.x - 30}
                                y={p.y - 35}
                                width="60"
                                height="25"
                                fill="#1f2937"
                                rx="4"
                                opacity="0"
                                className="hover:opacity-100 transition-opacity"
                              />
                              <text
                                x={p.x}
                                y={p.y - 15}
                                textAnchor="middle"
                                fontSize="12"
                                fill="white"
                                fontWeight="bold"
                                opacity="0"
                                className="hover:opacity-100 transition-opacity"
                              >
                                {p.value}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
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


      </div>
    </AdminLayout>
  );
}
