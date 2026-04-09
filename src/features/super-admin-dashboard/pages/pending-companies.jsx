import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCheck,
  LoaderCircle,
  Mail,
  Search,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
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
  SUPERADMIN_INVITE_COMPANY_ADMIN,
  SUPERADMIN_PENDING_COMPANIES,
  SUPERADMIN_REJECT_COMPANY,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminLayout } from "../components/super-admin-layout";

function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.companies)) {
    return data.companies;
  }

  if (Array.isArray(data?.pending_companies)) {
    return data.pending_companies;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
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

function formatStatus(status) {
  if (!status) {
    return "Pending";
  }

  return String(status)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status) {
  if (status === "Pending") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "Rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-brand-line bg-brand-neutral text-brand-secondary";
}

export function PendingCompaniesPage() {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const [search, setSearch] = useState("");
  const [selectedCompanyForApproval, setSelectedCompanyForApproval] = useState(null);

  const requestConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }),
    [session?.accessToken]
  );

  const pendingCompaniesQuery = useQuery({
    queryKey: ["super-admin-pending-companies-page"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_PENDING_COMPANIES, requestConfig);
      return normalizeCollection(response.data);
    },
  });

  const approveInviteMutation = useMutation({
    mutationFn: async ({ companyId, adminEmail }) => {
      return apiClient.post(
        SUPERADMIN_INVITE_COMPANY_ADMIN(companyId),
        null,
        {
          ...requestConfig,
          params: {
            admin_email: adminEmail,
          },
        }
      );
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Company approved and invite sent.");
      setSelectedCompanyForApproval(null);
      queryClient.invalidateQueries({ queryKey: ["super-admin-pending-companies-page"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-pending-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-companies"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-dashboard-company-admins"] });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to approve and invite right now.";

      toast.error(message);
    },
  });

  const rejectCompanyMutation = useMutation({
    mutationFn: async (companyId) => {
      return apiClient.post(SUPERADMIN_REJECT_COMPANY(companyId), null, requestConfig);
    },
    onSuccess: (response) => {
      toast.success(response.data?.message || "Company request rejected.");
      queryClient.invalidateQueries({ queryKey: ["super-admin-pending-companies-page"] });
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

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return pendingCompanies;
    }

    return pendingCompanies.filter((company) =>
      [company.name, company.domain, company.adminEmail, company.phoneNumber, company.status]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [pendingCompanies, search]);

  function handleApproveIntent(company) {
    setSelectedCompanyForApproval(company);
  }

  function handleConfirmApprove() {
    if (!selectedCompanyForApproval) {
      return;
    }

    approveInviteMutation.mutate({
      companyId: selectedCompanyForApproval.id,
      adminEmail: selectedCompanyForApproval.adminEmail,
    });
  }

  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary">
              <Building2 className="size-3 text-brand-primary" />
              Pending Companies
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                Company Approval Queue
              </h1>
              <p className="mt-2 text-sm text-brand-secondary">
                Review companies registered from the public register page and either approve with admin invite or reject them.
              </p>
            </div>
          </div>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by company or admin email"
              className="h-12 rounded-2xl border-brand-line bg-white pl-11 text-brand-ink"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_16px_50px_rgba(68,83,74,0.06)]">
          <div className="border-b border-brand-line px-6 py-5">
            <h2 className="text-lg font-semibold text-brand-ink">Pending Requests</h2>
            <p className="mt-1 text-sm text-brand-secondary">
              Approve and invite sends the admin invitation in one step. Reject removes the request from the queue.
            </p>
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
            ) : filteredCompanies.length ? (
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
                  {filteredCompanies.map((company) => {
                    const isApproving =
                      approveInviteMutation.isPending &&
                      approveInviteMutation.variables?.companyId === company.id;
                    const isRejecting =
                      rejectCompanyMutation.isPending &&
                      rejectCompanyMutation.variables === company.id;

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
                              disabled={isApproving || isRejecting || !company.adminEmail}
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
                                  Approve and invite
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 rounded-xl border-rose-200 px-4 text-rose-700 hover:bg-rose-50"
                              disabled={isApproving || isRejecting}
                              onClick={() => rejectCompanyMutation.mutate(company.id)}
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
        </section>

        <Dialog
          open={Boolean(selectedCompanyForApproval)}
          onOpenChange={(open) => {
            if (!open && !approveInviteMutation.isPending) {
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
                An invitation will be sent to{" "}
                <span className="font-semibold text-brand-ink">
                  {selectedCompanyForApproval?.name || "this company"}
                </span>{" "}
                at{" "}
                <span className="font-semibold text-brand-ink">
                  {selectedCompanyForApproval?.adminEmail || "the admin email"}
                </span>
                . Please confirm to continue.
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
                disabled={approveInviteMutation.isPending}
                onClick={() => setSelectedCompanyForApproval(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
                disabled={approveInviteMutation.isPending}
                onClick={handleConfirmApprove}
              >
                {approveInviteMutation.isPending ? "Sending invite..." : "Confirm and send invite"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
