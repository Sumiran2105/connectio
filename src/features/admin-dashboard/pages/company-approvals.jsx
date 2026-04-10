import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ClipboardCheck,
  Clock,
  LoaderCircle,
  Mail,
  Search,
  Shield,
  UserCheck,
  X,
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
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { COMPANY_APPROVE_USER, COMPANY_PENDING_USERS, COMPANY_REJECT_USER } from "@/config/api";
import { AdminLayout } from "../components/admin-layout";

function normalizePendingUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.pending_users)) {
    return data.pending_users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function formatDate(value) {
  if (!value) {
    return "Recently requested";
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

export function CompanyApprovals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForRejection, setSelectedUserForRejection] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const pendingUsersQuery = useQuery({
    queryKey: ["company-pending-users"],
    queryFn: async () => {
      const response = await apiClient.get(COMPANY_PENDING_USERS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return normalizePendingUsers(response.data);
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await apiClient.post(COMPANY_APPROVE_USER(userId), null, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("User successfully approved.");
      queryClient.invalidateQueries({ queryKey: ["company-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["company-users"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Approval failed.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const response = await apiClient.post(COMPANY_REJECT_USER(userId), null, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
        params: {
          reason,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Registration request rejected.");
      setSelectedUserForRejection(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["company-pending-users"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to process rejection.");
    },
  });

  const pendingUsers = useMemo(() => {
    return (pendingUsersQuery.data || []).map((user, index) => ({
      id: user.id || user.user_id || `pending-user-${index}`,
      name: user.name || user.full_name || "Pending user",
      email: user.email || "Not available",
      requestedAt: formatDate(user.created_at || user.requested_at || user.registered_at),
    }));
  }, [pendingUsersQuery.data]);

  const filteredUsers = pendingUsers.filter((user) =>
    [user.email, user.name].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleRejectIntent(user) {
    setSelectedUserForRejection(user);
    setRejectionReason("");
  }

  function handleConfirmReject() {
    if (!selectedUserForRejection) {
      return;
    }

    rejectMutation.mutate({
      userId: selectedUserForRejection.id,
      reason: rejectionReason.trim(),
    });
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="group flex items-center gap-2 text-sm font-semibold text-brand-secondary transition-all hover:text-brand-primary"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Dashboard Overview
            </button>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-brand-ink">Approvals</h1>
              <p className="mt-2 text-base text-brand-secondary">
                Review pending users who registered under your company domain.
              </p>
            </div>
          </div>
          <div className="flex h-16 items-center gap-4 rounded-3xl border border-brand-line bg-white px-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="size-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">Action Required</p>
              <p className="text-sm font-bold text-brand-ink">{filteredUsers.length} Pending</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md shadow-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
            <input
              type="text"
              placeholder="Search by requester details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-14 w-full rounded-2xl border border-brand-line bg-white pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />
          </div>
        </div>

        {pendingUsersQuery.isLoading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 rounded-[32px] border border-brand-line bg-white text-brand-secondary">
            <LoaderCircle className="size-5 animate-spin" />
            Loading pending users
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group relative overflow-hidden rounded-[32px] border border-brand-line bg-white p-6 transition-all duration-300 hover:border-brand-primary/20 hover:shadow-xl hover:shadow-brand-ink/5"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-5">
                    <div className="flex size-12 items-center justify-center rounded-[20px] bg-brand-neutral text-lg font-black text-brand-secondary ring-1 ring-brand-line group-hover:bg-brand-primary group-hover:text-white group-hover:ring-brand-primary transition-all">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-ink">{user.name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm font-medium text-brand-secondary">
                        <span className="flex items-center gap-2">
                          <Mail className="size-4 text-brand-primary/60" />
                          {user.email}
                        </span>
                        <span className="hidden h-1 w-1 rounded-full bg-brand-line md:block" />
                        <span className="flex items-center gap-2">
                          <Clock className="size-4 text-brand-primary/60" />
                          Applied {user.requestedAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => handleRejectIntent(user)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      variant="outline"
                      className="h-11 flex-1 rounded-2xl border-brand-line px-6 text-sm font-bold text-brand-tertiary transition-all hover:bg-brand-tertiary/5 md:flex-none"
                    >
                      <X className="mr-2 size-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="h-11 flex-1 rounded-2xl bg-brand-primary px-8 text-sm font-bold text-white shadow-xl shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 md:flex-none"
                    >
                      {approveMutation.isPending ? "Approving..." : (
                        <span className="flex items-center">
                          <Check className="mr-2 size-4" />
                          Approve
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[48px] border-2 border-dashed border-brand-line bg-white/50 p-24 text-center backdrop-blur-sm">
            <div className="mb-6 flex size-20 items-center justify-center rounded-[28px] bg-emerald-50 text-emerald-500 shadow-sm">
              <UserCheck className="size-10" />
            </div>
            <h3 className="text-xl font-black text-brand-ink">Clear Workspace</h3>
            <p className="mt-2 max-w-sm text-base text-brand-secondary">
              You've settled all pending registration requests. Your workspace is fully up to date.
            </p>
          </div>
        )}

        <div className="mt-12 overflow-hidden rounded-[40px] border border-brand-primary/10 bg-gradient-to-r from-brand-primary/5 to-transparent p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-brand-primary/10">
              <Shield className="size-6 text-brand-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-brand-ink">Security Protocol</h3>
              <p className="max-w-2xl text-sm leading-relaxed text-brand-secondary">
                Every member in your workspace goes through a manual approval process so only verified users get access.
              </p>
            </div>
            <Button variant="outline" className="h-11 rounded-2xl border-brand-line bg-white font-bold text-brand-ink hover:bg-brand-soft">
              Security Log
            </Button>
          </div>
        </div>

        <Dialog
          open={Boolean(selectedUserForRejection)}
          onOpenChange={(open) => {
            if (!open && !rejectMutation.isPending) {
              setSelectedUserForRejection(null);
              setRejectionReason("");
            }
          }}
        >
          <DialogContent className="rounded-[28px] border border-brand-line bg-white sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-brand-ink">Reject user request</DialogTitle>
              <DialogDescription className="text-sm leading-6 text-brand-secondary">
                Enter a reason for rejecting{" "}
                <span className="font-semibold text-brand-ink">
                  {selectedUserForRejection?.name || "this user"}
                </span>.
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
                disabled={rejectMutation.isPending}
                onClick={() => {
                  setSelectedUserForRejection(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-11 rounded-2xl bg-rose-600 px-5 text-white hover:bg-rose-700"
                disabled={rejectMutation.isPending}
                onClick={handleConfirmReject}
              >
                {rejectMutation.isPending ? "Rejecting..." : "Confirm reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
