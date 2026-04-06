import { Mail, Search, ShieldCheck, UserRoundCog, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { SuperAdminLayout } from "../components/super-admin-layout";

const adminRows = [
  {
    name: "Sumiran DSM",
    email: "sumiran.dsm@gmail.com",
    company: "Pexpo",
    role: "Company Admin",
    invitedOn: "07 Apr 2026",
    status: "Active",
  },
  {
    name: "Akhil Reddy",
    email: "akhil@leviticatechnologies.com",
    company: "Levitica",
    role: "Company Admin",
    invitedOn: "05 Apr 2026",
    status: "Pending",
  },
  {
    name: "Meera Shah",
    email: "meera@sonicsolutions.com",
    company: "Sonic Solutions",
    role: "Company Admin",
    invitedOn: "03 Apr 2026",
    status: "Active",
  },
  {
    name: "Rahul Varma",
    email: "rahul@pnsr.com",
    company: "PNSR",
    role: "Company Admin",
    invitedOn: "02 Apr 2026",
    status: "Active",
  },
  {
    name: "Suhani Gupta",
    email: "suhani@saisystems.com",
    company: "Sai Systems",
    role: "Company Admin",
    invitedOn: "31 Mar 2026",
    status: "Inactive",
  },
];

function adminStatusClass(status) {
  if (status === "Active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-600";
}

export function CompanyAdminsPage() {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return adminRows;
    }

    return adminRows.filter((row) =>
      [row.name, row.email, row.company, row.role, row.status]
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
              <UserRoundCog className="size-3 text-brand-primary" />
              Company Admins
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                All Company Admins
              </h1>
              <p className="mt-2 text-sm text-brand-secondary">
                A table view of company admin accounts across all onboarded companies.
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, email, or company"
              className="h-12 rounded-2xl border-brand-line bg-white pl-11 text-brand-ink"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Total Admins</p>
                <p className="text-2xl font-semibold text-brand-ink">{adminRows.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Active</p>
                <p className="text-2xl font-semibold text-brand-ink">
                  {adminRows.filter((row) => row.status === "Active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <Mail className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-secondary">Pending Invites</p>
                <p className="text-2xl font-semibold text-brand-ink">
                  {adminRows.filter((row) => row.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="border-b border-brand-line px-6 py-5">
            <h2 className="text-lg font-semibold text-brand-ink">Admin Directory</h2>
            <p className="mt-1 text-sm text-brand-secondary">
              Mock company-admin data for now. We can integrate the live endpoint later.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-brand-neutral">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Invited On</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.email}-${row.company}`} className="border-t border-brand-line hover:bg-brand-neutral/50">
                    <td className="px-6 py-4 text-sm font-semibold text-brand-ink">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.email}</td>
                    <td className="px-6 py-4 text-sm text-brand-ink">{row.company}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.role}</td>
                    <td className="px-6 py-4 text-sm text-brand-secondary">{row.invitedOn}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${adminStatusClass(row.status)}`}>
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
