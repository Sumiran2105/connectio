import { useQuery } from "@tanstack/react-query";
import {
  LoaderCircle,
  Mail,
  Search,
  ShieldCheck,
  UserRoundCog,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { SUPERADMIN_COMPANY_ADMINS } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminLayout } from "../components/super-admin-layout";

function normalizeAdmins(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.admins)) {
    return data.admins;
  }

  if (Array.isArray(data?.company_admins)) {
    return data.company_admins;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function formatStatus(status) {
  if (!status) {
    return "Active";
  }

  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

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
  const session = useAuthStore((state) => state.session);
  const [search, setSearch] = useState("");

  const companyAdminsQuery = useQuery({
    queryKey: ["super-admin-company-admins"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_COMPANY_ADMINS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return normalizeAdmins(response.data);
    },
  });

  const adminRows = useMemo(() => {
    return (companyAdminsQuery.data || []).map((admin, index) => {
      const firstName = admin.name || admin.full_name || admin.first_name || "";
      const companyName =
        admin.company_name || admin.company?.name || admin.company || admin.organization_name || "Not assigned";
      const status = formatStatus(admin.status || admin.account_status || admin.invite_status);

      return {
        id: admin.id || admin.user_id || admin.admin_id || `${admin.email || "admin"}-${index}`,
        name: firstName || "Unnamed admin",
        email: admin.email || admin.admin_email || "Not available",
        company: companyName,
        role: admin.role || admin.user_role || "Company Admin",
        invitedOn: formatDate(admin.invited_on || admin.created_at || admin.invited_at),
        status,
      };
    });
  }, [companyAdminsQuery.data]);

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
  }, [adminRows, search]);

  const activeCount = adminRows.filter((row) => row.status === "Active").length;
  const pendingCount = adminRows.filter((row) => row.status === "Pending").length;

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
                A live directory of company admin accounts across all onboarded companies.
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
                <p className="text-2xl font-semibold text-brand-ink">{activeCount}</p>
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
                <p className="text-2xl font-semibold text-brand-ink">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="border-b border-brand-line px-6 py-5">
            <h2 className="text-lg font-semibold text-brand-ink">Admin Directory</h2>
            <p className="mt-1 text-sm text-brand-secondary">
              This table is now connected to the live super admin company-admin list.
            </p>
          </div>

          <div className="overflow-x-auto">
            {companyAdminsQuery.isLoading ? (
              <div className="flex min-h-56 items-center justify-center gap-3 px-6 py-10 text-brand-secondary">
                <LoaderCircle className="size-5 animate-spin" />
                Loading company admins
              </div>
            ) : companyAdminsQuery.isError ? (
              <div className="px-6 py-10 text-sm text-brand-tertiary">
                Unable to load company admins right now. Try refreshing the page or signing in again.
              </div>
            ) : filteredRows.length ? (
              <table className="min-w-full border-collapse">
                <thead className="bg-brand-neutral">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Invited On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="border-t border-brand-line hover:bg-brand-neutral/50">
                      <td className="px-6 py-4 text-sm font-semibold text-brand-ink">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{row.email}</td>
                      <td className="px-6 py-4 text-sm text-brand-ink">{row.company}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{row.role}</td>
                      <td className="px-6 py-4 text-sm text-brand-secondary">{row.invitedOn}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${adminStatusClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-10 text-sm text-brand-secondary">
                No company admins found yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </SuperAdminLayout>
  );
}
