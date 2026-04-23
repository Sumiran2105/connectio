import { useState, useEffect } from "react";
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
  ArrowRight,
  BarChart3,
  PieChart
} from "lucide-react";
import { SuperAdminLayout } from "../components/super-admin-layout";


// Mock data for analytics endpoints
const mockRevenueData = {
  totalRevenue: 1245000,
  currency: "INR",
  timestamp: new Date().toISOString(),
};

const mockMonthlyRevenueData = {
  monthlyRevenue: 325000,
  month: "April 2026",
  percentageChange: 8.2,
  timestamp: new Date().toISOString(),
};

const mockPlansData = {
  plans: [
    { name: "Basic Plan", count: 48, revenue: 240000, activeUsers: 156 },
    { name: "Pro Plan", count: 32, revenue: 480000, activeUsers: 284 },
    { name: "Enterprise Plan", count: 18, revenue: 525000, activeUsers: 412 },
  ],
  timestamp: new Date().toISOString(),
};

const mockCompaniesData = {
  activeCompanies: 98,
  totalCompanies: 156,
  weeklyAddition: 5,
  growthPercentage: 5.2,
  topCompanies: [
    { id: 1, name: "Acme Digital", plan: "Enterprise", revenue: 45000, users: 52 },
    { id: 2, name: "Nova Partners", plan: "Pro", revenue: 28500, users: 38 },
    { id: 3, name: "Horizon Tech", plan: "Enterprise", revenue: 22000, users: 28 },
    { id: 4, name: "Soylent Corp", plan: "Pro", revenue: 18200, users: 22 },
    { id: 5, name: "Initech", plan: "Basic", revenue: 10800, users: 14 },
  ],
  timestamp: new Date().toISOString(),
};

const mockUsersData = {
  totalUsers: 1240,
  monthlyGrowth: 15.8,
  activeUsers: 1050,
  inactiveUsers: 190,
  byPlan: [
    { plan: "Enterprise", count: 412, engagement: "88%" },
    { plan: "Pro", count: 284, engagement: "72%" },
    { plan: "Basic", count: 156, engagement: "45%" },
    { plan: "Trial", count: 388, engagement: "12%" },
  ],
  timestamp: new Date().toISOString(),
};

const stats = [
  {
    label: "Total Revenue",
    value: `₹${(mockRevenueData.totalRevenue / 100000).toFixed(2)}L`,
    change: "+12.5%",
    trend: "up",
    icon: BadgeIndianRupee,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    
  },
  {
    label: "Monthly Revenue",
    value: `₹${(mockMonthlyRevenueData.monthlyRevenue / 1000).toFixed(0)}K`,
    change: `+${mockMonthlyRevenueData.percentageChange}%`,
    trend: "up",
    icon: Calendar,
    color: "text-blue-600",
    bg: "bg-blue-50",
    
  },
  {
    label: "Plan Analytics",
    value: `${mockPlansData.plans.reduce((sum, p) => sum + p.count, 0)} Active`,
    change: "3 Plan Tiers",
    trend: "neutral",
    icon: Layers,
    color: "text-purple-600",
    bg: "bg-purple-50",
    
  },
  {
    label: "Active Companies",
    value: mockCompaniesData.activeCompanies.toString(),
    change: `+${mockCompaniesData.weeklyAddition} this week`,
    trend: "up",
    icon: Building2,
    color: "text-orange-600",
    bg: "bg-orange-50",
    
  },
  {
    label: "User Growth",
    value: `${(mockUsersData.totalUsers / 1000).toFixed(1)}K`,
    change: `+${mockUsersData.monthlyGrowth}%`,
    trend: "up",
    icon: TrendingUp,
    color: "text-pink-600",
    bg: "bg-pink-50",
    
  },
];

export function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    revenue: mockRevenueData,
    monthlyRevenue: mockMonthlyRevenueData,
    plans: mockPlansData,
    companies: mockCompaniesData,
    users: mockUsersData,
  });

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
              Real-time insights from analytics API endpoints with comprehensive metrics.
            </p>
          </div>
         
        </div>

        {/* 5 Stat Cards from API Endpoints */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-[28px] border border-brand-line bg-white p-5 transition-all duration-300 hover:border-brand-primary/30 hover:shadow-lg hover:shadow-brand-primary/5"
                title={`From: ${stat.endpoint}`}
              >
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex flex-col gap-3 flex-1">
                    <div>
                      <p className="text-xs font-medium text-brand-secondary">
                        {stat.label}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-brand-ink">
                        {stat.value}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-brand-secondary'}`}>
                        {stat.change}
                      </span>
                      <ArrowUpRight className={`size-3 ${stat.trend === 'up' ? 'text-emerald-600' : 'hidden'}`} />
                    </div>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110 flex-shrink-0`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                {/* Subtle background decoration */}
                <div className="absolute -bottom-6 -right-6 size-24 rounded-full bg-brand-neutral opacity-40 group-hover:bg-brand-primary/5 transition-colors" />
              </div>
            );
          })}
        </div>

        {/* Revenue Overview Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue Summary Card */}
          <section className="flex flex-col rounded-[32px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-ink">Revenue Overview</h4>
                <p className="text-xs text-brand-secondary mt-1">Total and monthly revenue breakdown</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral">
                <BadgeIndianRupee className="size-4 text-brand-secondary" />
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <p className="text-xs font-medium mb-1">Total Revenue</p>
                <h5 className="text-3xl font-bold ">₹{(analyticsData.revenue.totalRevenue / 100000).toFixed(2)}L</h5>
                <p className="text-xs text-brand-secondary mt-2">Cumulative all-time revenue</p>
              </div>
              <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
                <p className="text-xs font-medium  mb-1">Monthly Revenue</p>
                <h5 className="text-3xl font-bold ">₹{(analyticsData.monthlyRevenue.monthlyRevenue / 1000).toFixed(0)}K</h5>
                <p className="text-xs text-brand-secondary mt-2">April 2026 • +{analyticsData.monthlyRevenue.percentageChange}% growth</p>
              </div>
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-line py-3 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-neutral hover:text-brand-ink">
              <BarChart3 className="size-4" />
              View Revenue Trends
            </button>
          </section>

          {/* Plan Analytics Card */}
          <section className="flex flex-col rounded-[32px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-ink">Plan Analytics</h4>
                <p className="text-xs text-brand-secondary mt-1">Active subscriptions by tier</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral">
                <Layers className="size-4 text-brand-secondary" />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {analyticsData.plans.plans.map((plan, index) => (
                <div key={plan.name} className="rounded-2xl bg-brand-neutral/40 p-4 hover:bg-brand-neutral/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-brand-ink">{plan.name}</p>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">{plan.count} Active</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-secondary">Revenue</span>
                      <span className="font-semibold text-brand-ink">₹{(plan.revenue / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-brand-secondary">Active Users</span>
                      <span className="font-semibold text-brand-ink">{plan.activeUsers} users</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-line py-3 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-neutral hover:text-brand-ink">
              <PieChart className="size-4" />
              View Plan Details
            </button>
          </section>
        </div>

        {/* Companies and Users Analytics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Revenue Companies */}
          <section className="flex flex-col rounded-[32px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-ink">Top Revenue Companies</h4>
                <p className="text-xs text-brand-secondary mt-1">Active: {analyticsData.companies.activeCompanies} • Total: {analyticsData.companies.totalCompanies}</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral">
                <Building2 className="size-4 text-brand-secondary" />
              </div>
            </div>
            <div className="space-y-1 flex-1">
              {analyticsData.companies.topCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between rounded-2xl p-3 hover:bg-brand-neutral/60 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-brand-ink">{company.name}</p>
                    <p className="text-[10px] text-brand-secondary/60 font-medium">{company.plan} • {company.users} users</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">₹{(company.revenue / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-line py-3 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-neutral hover:text-brand-ink">
              <ArrowRight className="size-4" />
              View All Companies
            </button>
          </section>

          {/* User Growth by Plan */}
          <section className="flex flex-col rounded-[32px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-brand-ink">User Growth by Plan</h4>
                <p className="text-xs text-brand-secondary mt-1">Total: {analyticsData.users.totalUsers} • Active: {analyticsData.users.activeUsers}</p>
              </div>
              <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral">
                <Users className="size-4 text-brand-secondary" />
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {analyticsData.users.byPlan.map((tier) => (
                <div key={tier.plan} className="rounded-2xl bg-brand-neutral/40 p-4 hover:bg-brand-neutral/60 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-brand-ink">{tier.plan}</p>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded-lg">{tier.count} Users</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-secondary">Engagement Rate</span>
                    <span className="text-xs font-semibold text-brand-ink">{tier.engagement}</span>
                  </div>
                  <div className="mt-2 h-2 bg-brand-line rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                      style={{ width: tier.engagement }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-line py-3 text-xs font-bold text-brand-secondary transition-all hover:bg-brand-neutral hover:text-brand-ink">
              <TrendingUp className="size-4" />
              View Growth Report
            </button>
          </section>
        </div>

        {/* Company Growth Metrics */}
        <section className="rounded-[32px] border border-brand-line bg-white p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-brand-ink">Company Growth Metrics</h4>
              <p className="text-xs text-brand-secondary mt-1">Weekly additions and growth rate</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-xl bg-brand-neutral">
              <BarChart3 className="size-4 text-brand-secondary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium  mb-2">Active Companies</p>
              <h5 className="text-2xl font-bold ">{analyticsData.companies.activeCompanies}</h5>
              <p className="text-xs  mt-1">Currently active</p>
            </div>
            <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium  mb-2">Total Companies</p>
              <h5 className="text-2xl font-bold ">{analyticsData.companies.totalCompanies}</h5>
              <p className="text-xs  mt-1">All time</p>
            </div>
            <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium  mb-2">Weekly Addition</p>
              <h5 className="text-2xl font-bold ">+{analyticsData.companies.weeklyAddition}</h5>
              <p className="text-xs  mt-1">This week</p>
            </div>
            <div className="rounded-2xl bg-brand-neutral p-4 border border-gray-200 hover:border-gray-400 transition-colors">
              <p className="text-xs font-medium  mb-2">Growth Rate</p>
              <h5 className="text-2xl font-bold ">+{analyticsData.companies.growthPercentage}%</h5>
              <p className="text-xs  mt-1">Monthly growth</p>
            </div>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}
