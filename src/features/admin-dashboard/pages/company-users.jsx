import { Users, UserPlus, MoreVertical, Shield, Mail, ArrowLeft, Search, Filter, ShieldCheck, Clock, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { COMPANY_USERS } from "@/config/api";
import { AdminLayout } from "../components/admin-layout";

export function CompanyUsers() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["company-users"],
    queryFn: async () => {
      const response = await apiClient.get(COMPANY_USERS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      return response.data || [];
    },
  });

  const handleMessage = (user) => {
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

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data for display if API is empty
  const displayUsers = filteredUsers.length > 0 ? filteredUsers : [
    { id: "1", name: "Alex Rivera", email: "alex@connectio.com", role: "ADMIN", status: "active", lastActive: "2 hours ago" },
    { id: "2", name: "Sarah Chen", email: "sarah.c@connectio.com", role: "USER", status: "active", lastActive: "5 mins ago" },
    { id: "3", name: "Marcus Thorne", email: "marcus@connectio.com", role: "USER", status: "inactive", lastActive: "3 days ago" },
    { id: "4", name: "Elena Vance", email: "elena@connectio.com", role: "MANAGER", status: "active", lastActive: "1 day ago" },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
            User Management
          </h1>
          <p className="text-sm text-brand-secondary">
            View, manage, and update access for all members in your company workspace.
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

      <div className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_24px_80px_rgba(68,83,74,0.08)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-line bg-brand-neutral/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-secondary/60">Last Active</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {displayUsers.map((user) => (
              <tr key={user.id} className="group transition-colors hover:bg-brand-neutral/30">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary/20 to-brand-soft/30 font-bold text-brand-primary">
                      {user.name?.charAt(0) || user.email?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">{user.name || "N/A"}</p>
                      <p className="text-xs text-brand-secondary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${user.role === "ADMIN"
                      ? "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                      : "bg-blue-50 text-blue-600 ring-1 ring-blue-200"
                    }`}>
                    {user.role === "ADMIN" && <ShieldCheck className="size-4" />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-brand-secondary/30"}`} />
                    <span className="text-sm font-medium text-brand-secondary capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-xs text-brand-secondary">
                    <Clock className="size-4" />
                    {user.lastActive || "Never"}
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
                    <button className="rounded-xl p-2.5 text-brand-secondary/40 transition-colors hover:bg-brand-soft hover:text-brand-ink">
                      <MoreVertical className="size-6" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isLoading && (
          <div className="p-10 text-center">
            <div className="mx-auto size-8 animate-spin rounded-full border-4 border-brand-primary/20 border-t-brand-primary" />
          </div>
        )}

        {!isLoading && displayUsers.length === 0 && (
          <div className="p-20 text-center">
            <Users className="mx-auto size-12 text-brand-secondary/20 mb-4" />
            <h3 className="text-lg font-bold text-brand-ink">No users found</h3>
            <p className="text-sm text-brand-secondary mt-1">Try expanding your search or invite a new user.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between rounded-[32px] border border-brand-line bg-white p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-10 rounded-full border-2 border-white bg-brand-neutral" />
            ))}
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-brand-soft text-[10px] font-bold text-brand-secondary">
              +12
            </div>
          </div>
          <p className="text-sm text-brand-secondary">
            <span className="font-bold text-brand-ink">124 users</span> in your workspace
          </p>
        </div>
        <Button variant="ghost" className="text-sm font-bold text-brand-primary hover:bg-brand-primary/5">
          Download User Report (CSV)
        </Button>
      </div>
      </div>
    </AdminLayout>
  );
}
