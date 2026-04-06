import { BadgeIndianRupee, CalendarDays, CreditCard, ReceiptText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { SuperAdminLayout } from "../components/super-admin-layout";

const billingRows = [
  {
    company: "Levitica",
    plan: "Enterprise",
    paymentId: "pay_Q2L81KX09A12",
    paymentDate: "07 Apr 2026",
    amount: "Rs. 48,000",
    billingCycle: "Yearly",
    status: "Paid",
  },
  {
    company: "PNSR",
    plan: "Premium",
    paymentId: "pay_L8A1MX22PZ31",
    paymentDate: "04 Apr 2026",
    amount: "Rs. 12,000",
    billingCycle: "Quarterly",
    status: "Paid",
  },
  {
    company: "Sonic Solutions",
    plan: "Free",
    paymentId: "NA",
    paymentDate: "01 Apr 2026",
    amount: "Rs. 0",
    billingCycle: "Monthly",
    status: "Trial",
  },
  {
    company: "Bhargav Labs",
    plan: "Premium",
    paymentId: "pay_Z1B3NC87QQ11",
    paymentDate: "30 Mar 2026",
    amount: "Rs. 18,500",
    billingCycle: "Half-yearly",
    status: "Paid",
  },
  {
    company: "Sai Systems",
    plan: "Enterprise",
    paymentId: "pay_X7D4VK39UA44",
    paymentDate: "28 Mar 2026",
    amount: "Rs. 60,000",
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
              <ReceiptText className="size-3 text-brand-primary" />
              Billing
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                Billing Details
              </h1>
              <p className="mt-2 text-sm text-brand-secondary">
                Subscription plan details and payment records for every company.
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company, plan, or payment ID"
              className="h-12 rounded-2xl border-brand-line bg-white pl-11 text-brand-ink"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <BadgeIndianRupee className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Collected</p>
                <p className="text-2xl font-semibold text-brand-ink">Rs. 1,38,500</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <CreditCard className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Active Plans</p>
                <p className="text-2xl font-semibold text-brand-ink">4 paid tiers</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <CalendarDays className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Latest Payment</p>
                <p className="text-2xl font-semibold text-brand-ink">07 Apr 2026</p>
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="border-b border-brand-line px-6 py-5">
            <h2 className="text-lg font-semibold text-brand-ink">Company Billing Table</h2>
            <p className="mt-1 text-sm text-brand-secondary">
              Mock billing data for now. We can connect this to the backend later.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-brand-neutral">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Payment ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Payment Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Cycle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.company}-${row.paymentId}`} className="border-t border-brand-line hover:bg-brand-neutral/50">
                    <td className="px-6 py-4 text-sm font-semibold text-brand-ink">{row.company}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.plan}</td>
                    <td className="px-6 py-4 text-sm text-brand-ink">{row.paymentId}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.paymentDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-brand-ink">{row.amount}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.billingCycle}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}
