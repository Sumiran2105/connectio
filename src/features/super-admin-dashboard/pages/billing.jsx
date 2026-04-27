import { 
  BadgeIndianRupee, 
  CalendarDays, 
  CreditCard, 
  Download, 
  ExternalLink, 
  ReceiptText, 
  Search, 
  ShieldCheck, 
  TrendingUp 
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuperAdminLayout } from "../components/super-admin-layout";

const billingRows = [
  {
    company: "Levitica",
    plan: "Enterprise",
    paymentId: "pay_Q2L81KX09A12",
    paymentDate: "07 Apr 2026",
    amount: "₹48,000",
    billingCycle: "Yearly",
    status: "Paid",
  },
  {
    company: "PNSR",
    plan: "Premium",
    paymentId: "pay_L8A1MX22PZ31",
    paymentDate: "04 Apr 2026",
    amount: "₹12,000",
    billingCycle: "Quarterly",
    status: "Paid",
  },
  {
    company: "Sonic Solutions",
    plan: "Free",
    paymentId: "NA",
    paymentDate: "01 Apr 2026",
    amount: "₹0",
    billingCycle: "Monthly",
    status: "Trial",
  },
  {
    company: "Bhargav Labs",
    plan: "Premium",
    paymentId: "pay_Z1B3NC87QQ11",
    paymentDate: "30 Mar 2026",
    amount: "₹18,500",
    billingCycle: "Half-yearly",
    status: "Paid",
  },
  {
    company: "Sai Systems",
    plan: "Enterprise",
    paymentId: "pay_X7D4VK39UA44",
    paymentDate: "28 Mar 2026",
    amount: "₹60,000",
    billingCycle: "Yearly",
    status: "Pending",
  },
];

function statusClass(status) {
  if (status === "Paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-brand-line bg-brand-neutral text-brand-secondary";
}

export function BillingPage() {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return billingRows;
    }

    return billingRows.filter((row) =>
      [row.company, row.plan, row.paymentId, row.paymentDate, row.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search]);

  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
              <ReceiptText className="size-3 text-brand-primary" />
              Super Admin / Billing
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                Billing & Payments
              </h1>
              <p className="mt-2 text-sm text-brand-secondary">
                Monitor platform revenue, manage company subscriptions, and track transaction history.
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search companies or payments..."
              className="h-12 rounded-2xl border-brand-line bg-white pl-11 text-brand-ink transition-all focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="group rounded-[28px] border border-brand-line bg-white p-5 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <BadgeIndianRupee className="size-5" />
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <TrendingUp className="size-3" />
                +12.5%
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-secondary">Total Revenue</p>
              <p className="text-2xl font-bold text-brand-ink">₹1,38,500</p>
            </div>
          </div>

          <div className="group rounded-[28px] border border-brand-line bg-white p-5 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <CreditCard className="size-5" />
              </div>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-secondary">Active Plans</p>
              <p className="text-2xl font-bold text-brand-ink">24 Companies</p>
            </div>
          </div>

          <div className="group rounded-[28px] border border-brand-line bg-white p-5 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <CalendarDays className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-secondary">Next Payout</p>
              <p className="text-2xl font-bold text-brand-ink">01 May 2026</p>
            </div>
          </div>

          <div className="group rounded-[28px] border border-brand-line bg-white p-5 transition-all hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <ReceiptText className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-secondary">Pending Invoices</p>
              <p className="text-2xl font-bold text-brand-ink">02</p>
            </div>
          </div>
        </div>

        {/* Billing Details Section */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-full rounded-[32px] border border-brand-line bg-white p-8 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-brand-ink">Billing Details</h2>
                  <p className="text-sm text-brand-secondary">Platform-wide subscription configurations</p>
                </div>
                <Button variant="outline" className="h-10 rounded-xl border-brand-line text-xs font-semibold hover:bg-brand-soft">
                  Update Settings
                </Button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Current Billing Cycle</p>
                  <p className="text-sm font-semibold text-brand-ink">Multi-Tiered (Monthly/Yearly)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Payment Provider</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-brand-ink">Razorpay</p>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                      CONNECTED
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Tax ID / GSTIN</p>
                  <p className="text-sm font-semibold text-brand-ink">27AAACN1234F1Z5</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Next Review</p>
                  <p className="text-sm font-semibold text-brand-ink">June 15, 2026</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-brand-neutral/50 p-4 border border-brand-line/50">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-primary border border-brand-line shadow-sm">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand-ink">Secure Billing Enabled</p>
                  <p className="text-[11px] text-brand-secondary">All transactions are processed via secure gateways.</p>
                </div>
                <ExternalLink className="size-4 text-brand-secondary hover:text-brand-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-line bg-white p-8 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <h3 className="text-lg font-semibold text-brand-ink">Revenue Overview</h3>
            <p className="mt-1 text-sm text-brand-secondary">Total earnings this month</p>
            
            <div className="mt-8 space-y-6">
              <div>
                <p className="text-3xl font-bold tracking-tight text-brand-ink">₹84,200</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-neutral">
                    <div className="h-full w-[65%] bg-brand-primary rounded-full"></div>
                  </div>
                  <span className="text-[10px] font-bold text-brand-secondary uppercase">65% Goal</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-brand-line">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-secondary font-medium">Enterprise</span>
                  <span className="font-bold text-brand-ink">₹52,000</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-secondary font-medium">Premium</span>
                  <span className="font-bold text-brand-ink">₹32,200</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment History Table */}
        <section className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="flex flex-col gap-4 border-b border-brand-line px-8 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-ink text-left">Payment History</h2>
              <p className="mt-1 text-sm text-brand-secondary text-left">
                A detailed log of all transactions processed.
              </p>
            </div>
            <Button variant="outline" className="h-10 gap-2 rounded-xl border-brand-line bg-white px-4 text-xs font-semibold text-brand-ink hover:bg-brand-soft">
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-brand-neutral/50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Company</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Plan</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Payment ID</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Amount</th>
                  <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredRows.map((row) => (
                  <tr key={`${row.company}-${row.paymentId}`} className="group hover:bg-brand-soft/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-brand-neutral text-[10px] font-bold text-brand-secondary uppercase">
                          {row.company.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-brand-ink">{row.company}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs">
                      <span className="rounded-lg bg-brand-neutral px-2 py-1 font-semibold text-brand-secondary">
                        {row.plan}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-xs font-mono text-brand-secondary">
                      {row.paymentId}
                    </td>
                    <td className="px-8 py-5 text-xs text-brand-secondary">
                      {row.paymentDate}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-brand-ink">
                      {row.amount}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {row.status === "Paid" ? (
                        <button 
                          className="inline-flex size-9 items-center justify-center rounded-xl border border-brand-line bg-white text-brand-secondary transition-all hover:border-brand-primary hover:text-brand-primary"
                          title="Download Invoice"
                        >
                          <Download className="size-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-secondary/40">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-brand-neutral p-4 text-brand-secondary">
                <Search className="size-8" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-brand-ink">No transactions found</h3>
              <p className="mt-1 text-sm text-brand-secondary">Try adjusting your search filters.</p>
            </div>
          )}
        </section>
      </div>
    </SuperAdminLayout>
  );
}
