import { UserRoundCog, Mail, ArrowLeft, Building2, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  SUPERADMIN_COMPANIES,
  SUPERADMIN_INVITE_COMPANY_ADMIN,
} from "@/config/api";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminLayout } from "../components/super-admin-layout";

export function AddAdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const session = useAuthStore((state) => state.session);
  const initialCompanyId = searchParams.get("companyId") || "";
  const inviteResult = location.state?.inviteResult || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      company_id: initialCompanyId,
      email: "",
    },
  });

  const selectedCompanyId = watch("company_id");

  const companiesQuery = useQuery({
    queryKey: ["super-admin-companies-select"],
    queryFn: async () => {
      const response = await apiClient.get(SUPERADMIN_COMPANIES, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response.data?.companies)) {
        return response.data.companies;
      }

      return [];
    },
  });

  const onSubmit = async (data) => {
    try {
      const companyId = data.company_id.trim();
      const response = await apiClient.post(SUPERADMIN_INVITE_COMPANY_ADMIN(companyId), null, {
        params: {
          admin_email: data.email.trim(),
        },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      toast.success(response.data?.message || "Company admin invited successfully.");

      if (response.data?.activation_link) {
        navigate("/super-admin/dashboard/admins/create", {
          replace: true,
          state: {
            inviteResult: response.data,
          },
        });
        return;
      }

      navigate("/super-admin/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to invite company admin right now.";

      toast.error(message);
    }
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
              {/* Company Selection Field */}
              <div className="space-y-2">
                <label
                  htmlFor="company_id"
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <Building2 className="size-4 text-brand-primary" />
                  Company <span className="text-brand-tertiary">*</span>
                </label>
                <div className="relative space-y-3">
                  <div className="relative">
                    <select
                      id="company_id"
                      {...register("company_id", {
                        required: "Company is required.",
                      })}
                      className={`h-12 w-full appearance-none rounded-2xl border bg-brand-neutral px-4 pr-12 text-sm transition focus:outline-none focus:ring-2 ${
                        errors.company_id
                          ? "border-brand-tertiary/50 ring-brand-tertiary/20"
                          : "border-brand-line focus:border-brand-primary focus:ring-brand-primary/10"
                      }`}
                      defaultValue={initialCompanyId}
                    >
                      <option value="">Select a company</option>
                      {companiesQuery.data?.map((company, index) => {
                        const companyId = company.id || company.company_id || "";
                        const companyName =
                          company.name || company.company_name || `Company ${index + 1}`;
                        const companyDomain = company.domain ? ` - ${company.domain}` : "";

                        return (
                          <option key={companyId || `${companyName}-${index}`} value={companyId}>
                            {companyName}
                            {companyDomain}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-brand-secondary" />
                  </div>

                  <input
                    id="company_id"
                    value={selectedCompanyId || ""}
                    readOnly
                    placeholder="Selected company ID will appear here"
                    className="h-12 w-full rounded-2xl border border-brand-line bg-white px-4 text-sm text-brand-secondary"
                  />

                  {companiesQuery.data?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {companiesQuery.data.slice(0, 6).map((company, index) => {
                        const companyId = company.id || company.company_id || "";
                        const companyName =
                          company.name || company.company_name || `Company ${index + 1}`;

                        return (
                          <button
                            key={companyId || `${companyName}-${index}`}
                            type="button"
                            onClick={() => setValue("company_id", companyId)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                              selectedCompanyId === companyId
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-brand-line bg-white text-brand-secondary hover:border-brand-primary hover:text-brand-primary"
                            }`}
                          >
                            {companyName}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {errors.company_id && (
                    <p className="mt-1.5 text-xs font-medium text-brand-tertiary">
                      {errors.company_id.message}
                    </p>
                  )}
                  <p className="text-[11px] text-brand-secondary/70">
                    Choose the company from the dropdown. The matching company ID will be
                    used automatically for the invite request.
                  </p>
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
                    {...register("email", {
                      required: "Admin email is required.",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email address.",
                      },
                    })}
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

        {inviteResult ? (
          <div className="mt-8 rounded-2xl border border-brand-line bg-white p-5 text-sm text-brand-ink shadow-[0_16px_50px_rgba(68,83,74,0.04)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-secondary">
              Invite Result
            </p>
            <p className="mt-3 text-sm leading-6 text-brand-secondary">
              {inviteResult.message || "Invite sent successfully."}
            </p>
            <div className="mt-4 rounded-2xl border border-brand-line bg-brand-neutral px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
                Activation link
              </p>
              <p className="mt-2 break-all text-sm text-brand-ink">
                {inviteResult.activation_link}
              </p>
            </div>
          </div>
        ) : null}

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
