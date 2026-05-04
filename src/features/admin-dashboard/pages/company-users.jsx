import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Filter,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { COMPANY_USERS, DM_USERS_SEARCH } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminLayout } from "../components/admin-layout";

function normalizeUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function formatLastActive(value) {
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

export function CompanyUsers() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const response = await apiClient.get(COMPANY_USERS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return normalizeUsers(response.data);
    },
  });

  const handleMessage = async (user) => {
    let chatUser = user;

    if (user.email && session?.accessToken) {
      try {
        const response = await apiClient.get(DM_USERS_SEARCH, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          params: {
            query: user.email,
          },
        });
        const results = normalizeUsers(response.data);
        const exactMatch = results.find((result) => result.email === user.email);

        if (exactMatch) {
          chatUser = {
            ...user,
            id: exactMatch.id || exactMatch.user_id || user.id,
            userId: exactMatch.user_id || exactMatch.id || user.userId,
            name: exactMatch.full_name || exactMatch.name || user.name,
            email: exactMatch.email || user.email,
          };
        }
      } catch {
        // Fall back to the company user row data.
      }
    }

    const params = new URLSearchParams({
      userId: String(chatUser.userId || chatUser.id || ""),
      name: chatUser.name || "",
      email: chatUser.email || "",
    });

    navigate(`/admin/dashboard/chat?${params.toString()}`, {
      state: {
        selectedUserId: chatUser.id,
        selectedUserUserId: chatUser.userId,
        selectedUserName: chatUser.name,
        selectedUserEmail: chatUser.email,
      },
    });
    toast.info(`Opening chat with ${user.name || user.email}...`, {
      description: "Chat module is initializing.",
      icon: <MessageSquare className="size-4 text-brand-primary" />,
    });
  };

  const handleCall = (user) => {
    toast.success(`Calling ${user.name || user.email}...`, {
      description: "Connecting to secure voice line.",
      icon: <Phone className="size-4 text-emerald-500" />,
    });
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await apiClient.delete(`${COMPANY_USERS}/${userId}`, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      usersQuery.refetch();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    },
  });

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
  };

  const displayUsers = useMemo(() => {
    return (usersQuery.data || []).map((user, index) => ({
      id: user.id || user.user_id || `company-user-${index}`,
      userId: user.user_id || user.auth_user_id || user.user?.id || user.user?.user_id || user.id || null,
      name: user.name || user.full_name || "Unnamed user",
      email: user.email || "Not available",
      role: (user.role || user.user_role || "USER").toUpperCase(),
      status: String(user.status || user.account_status || "active").toLowerCase(),
      lastActive: formatLastActive(user.last_active || user.updated_at || user.created_at),
    }));
  }, [usersQuery.data]);

  const filteredUsers = displayUsers.filter((user) =>
    [user.email, user.name].join(" ").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="group flex items-center gap-2 text-sm font-medium text-brand-secondary transition-colors hover:text-brand-primary"
            >
              <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold tracking-tight text-brand-ink">User Management</h1>
            <p className="text-sm text-brand-secondary">
              View approved users in your company workspace.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="h-12 rounded-2xl border-brand-line bg-white px-6 font-bold text-brand-secondary hover:bg-brand-soft"
              onClick={() => navigate("/admin/dashboard/invite")}
            >
              <UserPlus className="mr-2 size-5" />
              Invite User
            </Button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-brand-secondary" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border border-brand-line bg-white pl-12 pr-4 text-sm transition-all focus:outline-none focus:ring-4 focus:ring-brand-primary/5"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl border-brand-line bg-white px-5 text-brand-secondary hover:bg-brand-soft">
            <Filter className="mr-2 size-5" />
            Filter
          </Button>
        </div>

        <div className="overflow-y-auto   max-h-[600px] rounded-[32px] border border-brand-line bg-white shadow-[0_24px_80px_rgba(68,83,74,0.08)]">
          {usersQuery.isLoading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-brand-secondary">
              <div className="size-8 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
              Loading users
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-brand-neutral bg-opacity-90 backdrop-blur-sm">
                <tr className="border-b border-brand-line bg-brand-neutral/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">User</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Last Active</th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-brand-neutral/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-soft/30 font-bold text-brand-primary">
                          {user.name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-ink">{user.name}</p>
                          <p className="text-xs text-brand-secondary">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          user.role === "ADMIN"
                            ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                            : "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                        }`}
                      >
                        {user.role === "ADMIN" && <ShieldCheck className="size-4" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className={`size-2.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-brand-secondary/30"}`} />
                        <span className="text-sm font-medium capitalize text-brand-secondary">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-brand-secondary">
                        <Clock className="size-4" />
                        {user.lastActive}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          title="Send Message"
                          onClick={() => handleMessage(user)}
                          className="rounded-xl p-2.5 text-brand-secondary/40 transition-colors hover:bg-brand-soft hover:text-brand-primary active:scale-90"
                        >
                          <MessageSquare className="size-5" />
                        </button>
                        <button
                          title="Start Call"
                          onClick={() => handleCall(user)}
                          className="rounded-xl p-2.5 text-brand-secondary/40 transition-colors hover:bg-brand-soft hover:text-brand-primary active:scale-90"
                        >
                          <Phone className="size-5" />
                        </button>
                        <button
                          title="Delete User"
                          onClick={() => {
                            setUserToDelete(user);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="rounded-xl p-2.5 text-brand-secondary/40 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-90"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center">
              <Users className="mx-auto mb-4 size-12 text-brand-secondary/20" />
              <h3 className="text-lg font-bold text-brand-ink">No users found</h3>
              <p className="mt-1 text-sm text-brand-secondary">
                No approved users are available yet for this company workspace.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between rounded-[32px] border border-brand-line bg-white p-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {filteredUsers.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand-neutral text-xs font-bold text-brand-secondary"
                >
                  {(user.name || user.email).charAt(0)}
                </div>
              ))}
              {filteredUsers.length > 4 ? (
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand-soft text-[10px] font-bold text-brand-secondary">
                  +{filteredUsers.length - 4}
                </div>
              ) : null}
            </div>
            <p className="text-sm text-brand-secondary">
              <span className="font-bold text-brand-ink">{filteredUsers.length} users</span> in your workspace
            </p>
          </div>
          <Button variant="ghost" className="text-sm font-bold text-brand-primary hover:bg-brand-primary/5">
            Download User Report (CSV)
          </Button>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent 
          showCloseButton={false}
          className="max-w-[400px] gap-0 overflow-hidden rounded-[40px] border-none bg-white p-0 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)]"
        >
          <div className="p-8 pb-4">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <div className="flex size-12 items-center justify-center rounded-xl bg-red-100/50">
                <AlertTriangle className="size-7" />
              </div>
            </div>
            <DialogHeader className="gap-2 text-center">
              <DialogTitle className="text-2xl font-bold tracking-tight text-brand-ink">
                Delete User
              </DialogTitle>
              <DialogDescription className="px-2 text-base leading-relaxed text-brand-secondary">
                Are you sure you want to delete{" "}
                <span className="font-bold text-brand-ink">
                  {userToDelete?.name || userToDelete?.email}
                </span>
                ? This action is permanent and cannot be undone.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col gap-3 p-8 pt-4">
            <Button
              onClick={confirmDelete}
              disabled={deleteUserMutation.isPending}
              className="h-12 w-full rounded-2xl bg-red-500 text-base font-bold text-white shadow-[0_8px_20px_-4px_rgba(239,68,68,0.3)] transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-70"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Deleting User...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="h-12 w-full rounded-2xl text-base font-bold text-brand-secondary hover:bg-brand-soft hover:text-brand-ink"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
