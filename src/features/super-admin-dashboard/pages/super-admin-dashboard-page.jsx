import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BellRing,
  Building2,
  CalendarClock,
  CheckCheck,
  CircleAlert,
  CircleDashed,
  CreditCard,
  LoaderCircle,
  Plus,
  Shield,
  UserRoundCog,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  SUPERADMIN_APPROVE_COMPANY,
  SUPERADMIN_COMPANIES,
  SUPERADMIN_DASHBOARD_OVERVIEW,
  SUPERADMIN_PENDING_COMPANIES,
  SUPERADMIN_REJECT_COMPANY,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminLayout } from "../components/super-admin-layout";

const recentFollowUps = [
  {
    title: "Billing review with finance",
    detail: "10 Apr 2026 at 11:30 AM",
  },
  {
    title: "Pending activation follow-up",
    detail: "11 Apr 2026 at 3:00 PM",
  },
  {
    title: "Platform health check",
    detail: "12 Apr 2026 at 9:30 AM",
  },
];

function normalizeCollection(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function formatStatus(status) {
  if (!status) {
    return "Pending";
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

function statusClass(status) {
  if (status === "Active" || status === "Approved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-brand-line bg-brand-neutral text-brand-secondary";
}

export function SuperAdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const [selectedCompanyForApproval, setSelectedCompanyForApproval] = useState(null);
  const [selectedCompanyForRejection, setSelectedCompanyForRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const requestConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }),
    [session?.accessToken]
  );

  const companiesQuery = useQuery({
    queryKey: ["super-admin-dashboard-companies"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_COMPANIES, requestConfig);
      return normalizeCollection(response.data, ["companies"]);
    },
  });

  const overviewQuery = useQuery({
    queryKey: ["super-admin-dashboard-overview"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_DASHBOARD_OVERVIEW, requestConfig);
      return response.data || {};
    },
  });

  const pendingCompaniesQuery = useQuery({
    queryKey: ["super-admin-dashboard-pending-companies"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_PENDING_COMPANIES, requestConfig);
      return normalizeCollection(response.data, ["companies", "pending_companies", "data"]);
    },
  });

  const companyAdminsQuery = useQuery({
    queryKey: ["super-admin-dashboard-company-admins"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_COMPANIES, requestConfig);
      return normalizeCollection(response.data, ["companies", "data"]);
    },
  });

  const approveCompanyMutation = useMutation({
    mutationFn: async ({ companyId }) => {
      return apiClient.post(SUPERADMIN_APPROVE_COMPANY(companyId), null, requestConfig);
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Company approved successfully.");
      setSelectedCompanyForApproval(null);
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-company-admins"] });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to approve the company right now.";

      toast.error(message);
    },
  });

  const rejectCompanyMutation = useMutation({
    mutationFn: async ({ companyId, reason }) => {
      return apiClient.post(SUPERADMIN_REJECT_COMPANY(companyId), null, {
        ...requestConfig,
        params: {
          reason,
        },
      });
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Company request rejected.");
      setSelectedCompanyForRejection(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-pending-companies"] });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to reject the company request right now.";

      toast.error(message);
    },
  });

  const allCompanies = companiesQuery.data || [];
  const allCompanyAdmins = companyAdminsQuery.data || [];
  const pendingCompanies = useMemo(() => {
    return (pendingCompaniesQuery.data || []).map((company, index) => ({
      id: company.company_id || company.id || `pending-company-${index}`,
      name: company.company_name || company.name || `Company ${index + 1}`,
      domain: company.domain || company.company_domain || "Not available",
      adminEmail: company.admin_email || company.email || company.owner_email || "",
      phoneNumber: company.phone_number || company.phone || "Not available",
      createdOn: formatDate(company.created_at || company.created_on || company.registered_at),
      status: formatStatus(company.status || "Pending"),
    }));
  }, [pendingCompaniesQuery.data]);

  const recentAdmins = useMemo(() => {
    return (allCompanyAdmins || []).slice(0, 4).map((admin, index) => ({
      id: admin.id || admin.company_id || `company-admin-${index}`,
      name: admin.admin_full_name || admin.full_name || "Unnamed admin",
      email: admin.admin_email || admin.email || "Not available",
      company: admin.name || admin.company_name || "Not assigned",
      status: formatStatus(admin.status || admin.account_status || admin.invite_status || "Active"),
    }));
  }, [allCompanyAdmins]);

  const overview = overviewQuery.data || {};
  const overviewCards = [
    {
      label: "Total Companies",
      value: String(overview.total ?? allCompanies.length ?? 0),
      note: "All company workspaces tracked by the platform",
      icon: Building2,
      accent: "bg-brand-soft text-brand-primary",
    },
    {
      label: "Approved",
      value: String(overview.approved ?? 0),
      note: "Companies ready for admin login and workspace access",
      icon: UserCheck,
      accent: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending Verification",
      value: String(overview.pending_verification ?? 0),
      note: "Company registrations still waiting on domain OTP verification",
      icon: CircleDashed,
      accent: "bg-amber-50 text-amber-700",
    },
    {
      label: "Pending Admin",
      value: String(overview.pending_admin ?? 0),
      note: "Verified companies waiting for super admin approval",
      icon: UserRoundCog,
      accent: "bg-sky-50 text-sky-700",
    },
    {
      label: "Rejected",
      value: String(overview.rejected ?? 0),
      note: "Registration requests closed by the platform team",
      icon: XCircle,
      accent: "bg-rose-50 text-rose-700",
    },
    {
      label: "Platform Health",
      value: overviewQuery.isLoading ? "..." : "Healthy",
      note: "Overview and queue services are responding normally",
      icon: Activity,
      accent: "bg-violet-50 text-violet-700",
    },
  ];

  const isDashboardLoading =
    overviewQuery.isLoading ||
    companiesQuery.isLoading ||
    pendingCompaniesQuery.isLoading ||
    companyAdminsQuery.isLoading;

  function handleApproveIntent(company) {
    setSelectedCompanyForApproval(company);
  }

  function handleConfirmApprove() {
    if (!selectedCompanyForApproval) {
      return;
    }

    approveCompanyMutation.mutate({
      companyId: selectedCompanyForApproval.id,
    });
  }

  function handleRejectIntent(company) {
    setSelectedCompanyForRejection(company);
    setRejectionReason("");
  }

  function handleConfirmReject() {
    if (!selectedCompanyForRejection) {
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error("Enter a reason before rejecting the company.");
      return;
    }

    rejectCompanyMutation.mutate({
      companyId: selectedCompanyForRejection.id,
      reason: rejectionReason.trim(),
    });
  }

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
                  Review new company registrations, approve and invite company admins, and keep
                  the platform onboarding queue moving from a single dashboard.
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

        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
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
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${card.accent}`}>
                    <Icon className="size-5" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Platform Snapshot
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Registration and approval pipeline
                </h3>
              </div>
              <div className="rounded-2xl bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-primary">
                {overview.total ?? 0} total
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Verified
                </p>
                <p className="mt-3 text-2xl font-semibold text-brand-ink">
                  {(overview.total ?? 0) - (overview.pending_verification ?? 0)}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Companies that completed domain verification.
                </p>
              </div>
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Awaiting Approval
                </p>
                <p className="mt-3 text-2xl font-semibold text-brand-ink">
                  {(overview.pending_admin ?? 0) + pendingCompanies.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Companies ready for super admin review.
                </p>
              </div>
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Admin Directory
                </p>
                <p className="mt-3 text-2xl font-semibold text-brand-ink">
                  {allCompanyAdmins.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Company admins currently visible to the platform.
                </p>
              </div>
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                  Queue State
                </p>
                <p className="mt-3 text-2xl font-semibold text-brand-ink">
                  {pendingCompanies.length ? "Action needed" : "Clear"}
                </p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  {pendingCompanies.length
                    ? `${pendingCompanies.length} companies are still waiting in review.`
                    : "No company approvals are blocked right now."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Suggested Next Metrics
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Useful backend additions later
                </h3>
              </div>
              <BellRing className="size-5 text-brand-secondary" />
            </div>

            <div className="mt-6 space-y-4">
              {[
                "Total company admins invited",
                "Companies verified today",
                "Average approval turnaround time",
                "Rejected companies this week",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-dashed border-brand-line bg-brand-neutral px-4 py-4"
                >
                  <p className="text-sm font-semibold text-brand-ink">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-brand-secondary">
                    This can be added as a dedicated dashboard metric when the backend exposes it.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
            <div className="flex items-center justify-between gap-4 border-b border-brand-line px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                  Pending Companies
                </p>
                <h3 className="mt-2 text-xl font-semibold text-brand-ink">
                  Company registration approvals
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
              {pendingCompaniesQuery.isLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-3 px-6 py-10 text-brand-secondary">
                  <LoaderCircle className="size-5 animate-spin" />
                  Loading pending companies
                </div>
              ) : pendingCompaniesQuery.isError ? (
                <div className="px-6 py-10 text-sm text-brand-tertiary">
                  Unable to load pending companies right now.
                </div>
              ) : pendingCompanies.length ? (
                <table className="min-w-full border-collapse">
                  <thead className="bg-brand-neutral">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                        Admin Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                        Created On
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingCompanies.map((company) => {
                      const isApproving =
                        approveCompanyMutation.isPending &&
                        approveCompanyMutation.variables?.companyId === company.id;
                      const isRejecting =
                        rejectCompanyMutation.isPending &&
                        rejectCompanyMutation.variables?.companyId === company.id;

                      return (
                        <tr key={company.id} className="border-t border-brand-line hover:bg-brand-neutral/50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-brand-ink">{company.name}</p>
                            <p className="mt-1 text-sm text-brand-secondary">{company.domain}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-brand-ink">{company.adminEmail || "Not available"}</p>
                            <p className="mt-1 text-sm text-brand-secondary">{company.phoneNumber}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-brand-secondary">{company.createdOn}</p>
                            <span
                              className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(company.status)}`}
                            >
                              {company.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                className="h-9 rounded-xl bg-brand-primary px-4 text-white hover:bg-brand-primary/90"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleApproveIntent(company)}
                              >
                                {isApproving ? (
                                  <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCheck className="size-4" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="h-9 rounded-xl border-rose-200 px-4 text-rose-700 hover:bg-rose-50"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleRejectIntent(company)}
                              >
                                {isRejecting ? (
                                  <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="size-4" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-10 text-sm text-brand-secondary">
                  No pending company registrations right now.
                </div>
              )}
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
              {companyAdminsQuery.isLoading ? (
                <div className="flex min-h-56 items-center justify-center gap-3 px-6 py-10 text-brand-secondary">
                  <LoaderCircle className="size-5 animate-spin" />
                  Loading company admins
                </div>
              ) : companyAdminsQuery.isError ? (
                <div className="px-6 py-10 text-sm text-brand-tertiary">
                  Unable to load company admin activity right now.
                </div>
              ) : recentAdmins.length ? (
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
                      <tr key={admin.id} className="border-t border-brand-line hover:bg-brand-neutral/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-brand-ink">{admin.name}</p>
                          <p className="mt-1 text-sm text-brand-secondary">{admin.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-brand-secondary">{admin.company}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${statusClass(admin.status)}`}
                          >
                            {admin.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-10 text-sm text-brand-secondary">
                  No company admin activity found yet.
                </div>
              )}
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
              {recentFollowUps.map((item) => (
                <div key={item.title} className="rounded-[24px] border border-brand-line bg-brand-neutral p-4">
                  <p className="text-sm font-semibold text-brand-ink">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-brand-secondary">{item.detail}</p>
                </div>
              ))}
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

            <div className="mt-6 rounded-[24px] border border-brand-line bg-brand-neutral p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft">
                  {isDashboardLoading ? (
                    <LoaderCircle className="size-4 animate-spin text-brand-primary" />
                  ) : pendingCompanies.length ? (
                    <CircleAlert className="size-4 text-amber-600" />
                  ) : (
                    <CheckCheck className="size-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-ink">Onboarding queue status</p>
                  <p className="mt-1 text-sm leading-6 text-brand-secondary">
                    {isDashboardLoading
                      ? "Refreshing the latest company registrations and admin records."
                      : pendingCompanies.length
                        ? `${pendingCompanies.length} company registration requests are waiting for approval.`
                        : "No company approvals are pending right now."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Dialog
          open={Boolean(selectedCompanyForApproval)}
          onOpenChange={(open) => {
            if (!open && !approveCompanyMutation.isPending) {
              setSelectedCompanyForApproval(null);
            }
          }}
        >
          <DialogContent className="rounded-[28px] border border-brand-line bg-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-brand-ink">
                Confirm approval and invite
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-brand-secondary">
                The company{" "}
                <span className="font-semibold text-brand-ink">
                  {selectedCompanyForApproval?.name || "this company"}
                </span>{" "}
                will be approved. After approval, the company admin can log in using the password set during company creation.
                Please confirm to continue.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-[22px] border border-brand-line bg-brand-neutral p-4 text-sm text-brand-secondary">
              <p>
                <span className="font-semibold text-brand-ink">Company:</span>{" "}
                {selectedCompanyForApproval?.name || "Not available"}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-brand-ink">Domain:</span>{" "}
                {selectedCompanyForApproval?.domain || "Not available"}
              </p>
              <p className="mt-2">
                <span className="font-semibold text-brand-ink">Admin email:</span>{" "}
                {selectedCompanyForApproval?.adminEmail || "Not available"}
              </p>
            </div>

            <DialogFooter className="gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-brand-line px-5"
                disabled={approveCompanyMutation.isPending}
                onClick={() => setSelectedCompanyForApproval(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
                disabled={approveCompanyMutation.isPending}
                onClick={handleConfirmApprove}
              >
                {approveCompanyMutation.isPending ? "Approving..." : "Confirm approval"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(selectedCompanyForRejection)}
          onOpenChange={(open) => {
            if (!open && !rejectCompanyMutation.isPending) {
              setSelectedCompanyForRejection(null);
              setRejectionReason("");
            }
          }}
        >
          <DialogContent className="rounded-[28px] border border-brand-line bg-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-brand-ink">
                Reject company request
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-brand-secondary">
                Enter the reason for rejecting{" "}
                <span className="font-semibold text-brand-ink">
                  {selectedCompanyForRejection?.name || "this company"}
                </span>
                .
              </DialogDescription>
            </DialogHeader>

            <Input
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter rejection reason"
              className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
            />

            <DialogFooter className="gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-2xl border-brand-line px-5"
                disabled={rejectCompanyMutation.isPending}
                onClick={() => {
                  setSelectedCompanyForRejection(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl bg-rose-600 px-5 text-white hover:bg-rose-700"
                disabled={rejectCompanyMutation.isPending}
                onClick={handleConfirmReject}
              >
                {rejectCompanyMutation.isPending ? "Rejecting..." : "Confirm reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
