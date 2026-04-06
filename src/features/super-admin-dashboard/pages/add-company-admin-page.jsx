import { zodResolver } from "@hookform/resolvers/zod";
import { UserRoundCog, Mail, ArrowLeft, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "../components/super-admin-layout";

const adminSchema = z.object({
  company_id: z.string().min(1, "Company ID is required."),
  email: z.string().email("Please enter a valid email address."),
});

export function AddCompanyAdminPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      company_id: "",
      email: "",
    },
  });

  const onSubmit = async (data) => {
    // In a real app, this would be an API call
    console.log("Inviting company admin:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate("/super-admin/dashboard");
  };

  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-2xl text-brand-ink">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-brand-secondary transition hover:text-brand-primary"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Add company admin
            </h1>
            <p className="text-sm text-brand-secondary">
              Invite a new administrator to manage a specific company workspace.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-brand-line bg-white p-8 shadow-[0_16px_50px_rgba(68,83,74,0.06)] md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              {/* Company ID Field */}
              <div className="space-y-2">
                <label
                  htmlFor="company_id"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <Building2 className="size-4 text-brand-primary" />
                  Company ID <span className="text-brand-tertiary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="company_id"
                    {...register("company_id")}
                    placeholder="e.g. acme-corp-123"
                    className={`h-12 w-full rounded-2xl border bg-brand-neutral px-4 text-sm transition focus:outline-none focus:ring-2 ${errors.company_id
                      ? "border-brand-tertiary/50 ring-brand-tertiary/20"
                      : "border-brand-line focus:border-brand-primary focus:ring-brand-primary/10"
                      }`}
                  />
                  {errors.company_id && (
                    <p className="mt-1.5 text-xs font-medium text-brand-tertiary">
                      {errors.company_id.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <Mail className="size-4 text-brand-primary" />
                  Admin Email <span className="text-brand-tertiary">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="admin@example.com"
                    className={`h-12 w-full rounded-2xl border bg-brand-neutral px-4 text-sm transition focus:outline-none focus:ring-2 ${errors.email
                      ? "border-brand-tertiary/50 ring-brand-tertiary/20"
                      : "border-brand-line focus:border-brand-primary focus:ring-brand-primary/10"
                      }`}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-brand-tertiary">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <p className="text-[11px] text-brand-secondary/70">
                  The admin will receive an invitation email to join the company workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-brand-line px-8 text-brand-secondary hover:bg-brand-soft"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-brand-primary px-10 text-white shadow-lg shadow-brand-primary/20 transition-all hover:bg-brand-primary/90 hover:shadow-xl hover:shadow-brand-primary/30"
              >
                {isSubmitting ? "Sending Invite..." : "Send invite"}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-primary/10 bg-brand-primary/5 p-4 text-sm text-brand-primary">
          <p className="leading-6">
            <strong>Security Note:</strong> Invitations are valid for 24 hours. The recipient
            must complete the registration process within this timeframe to gain admin access.
          </p>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
