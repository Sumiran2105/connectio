import { Mail, UserPlus, ArrowLeft, ShieldCheck, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { COMPANY_INVITE_USER } from "@/config/api";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { AdminLayout } from "../components/admin-layout";

export function InviteUser() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await apiClient.post(COMPANY_INVITE_USER, null, {
        params: {
          email: data.email.trim(),
        },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      toast.success(response.data?.message || "User invited successfully.");
      reset();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to invite user right now.";

      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 space-y-2">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="group flex items-center gap-2 text-sm font-medium text-brand-secondary transition-colors hover:text-brand-primary"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-brand-ink">
          Invite new user
        </h1>
        <p className="text-sm text-brand-secondary">
          Add a new member to your company workspace by sending them an invitation link.
        </p>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_24px_80px_rgba(68,83,74,0.08)]">
        <div className="bg-brand-primary/5 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/30">
              <UserPlus className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-brand-ink">Member Invitation</h2>
              <p className="text-xs text-brand-secondary">
                Secure invitation system
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="flex items-center gap-2 text-sm font-semibold text-brand-ink"
              >
                <Mail className="size-4 text-brand-primary" />
                User Email Address <span className="text-brand-tertiary">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address.",
                    },
                  })}
                  placeholder="name@company.com"
                  className={`h-14 w-full rounded-2xl border bg-brand-neutral px-5 text-sm transition-all focus:outline-none focus:ring-4 ${
                    errors.email
                      ? "border-brand-tertiary/50 ring-brand-tertiary/10"
                      : "border-brand-line focus:border-brand-primary focus:ring-brand-primary/5"
                  }`}
                />
                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-brand-tertiary animate-in fade-in slide-in-from-top-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <p className="text-[11px] leading-relaxed text-brand-secondary/70">
                The user will receive a secure link to complete their account setup.
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-brand-line px-8 text-brand-secondary transition-all hover:bg-brand-soft hover:text-brand-ink active:scale-95"
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-brand-primary px-10 font-bold text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 hover:shadow-xl hover:shadow-brand-primary/30 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    Sending...
                  </span>
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-brand-line bg-brand-neutral/50 p-6 backdrop-blur-sm">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <ShieldCheck className="size-5 text-brand-secondary" />
          </div>
          <h3 className="text-sm font-bold text-brand-ink">Secure Access</h3>
          <p className="mt-2 text-xs leading-5 text-brand-secondary">
            Invited users must verify their identity and can only access their assigned company resources.
          </p>
        </div>
        <div className="rounded-3xl border border-brand-line bg-brand-neutral/50 p-6 backdrop-blur-sm">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-white shadow-sm">
            <Info className="size-5 text-brand-secondary" />
          </div>
          <h3 className="text-sm font-bold text-brand-ink">Invitation Expiry</h3>
          <p className="mt-2 text-xs leading-5 text-brand-secondary">
            Links are single-use and expire after 24 hours for enhanced security.
          </p>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
