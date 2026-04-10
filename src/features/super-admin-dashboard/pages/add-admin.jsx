import { ArrowLeft, Building2, CircleAlert, ListChecks, UserRoundCog } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { SuperAdminLayout } from "../components/super-admin-layout";

export function AddAdminPage() {
  const navigate = useNavigate();

  return (
    <SuperAdminLayout>
      <div className="mx-auto max-w-3xl text-brand-ink">
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
              Company admin access is now created during company registration and becomes active after approval.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-brand-line bg-white p-8 shadow-[0_16px_50px_rgba(68,83,74,0.06)] md:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand-secondary">
              <CircleAlert className="size-3.5 text-brand-primary" />
              Updated Flow
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-brand-primary">
                  <Building2 className="size-4.5" />
                </div>
                <p className="mt-4 text-base font-semibold text-brand-ink">1. Create company</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Add the company with the admin’s full name, email, phone number, and password.
                </p>
              </div>

              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-brand-primary">
                  <UserRoundCog className="size-4.5" />
                </div>
                <p className="mt-4 text-base font-semibold text-brand-ink">2. Verify OTP</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Verify the company domain from the OTP sent to the registered admin email.
                </p>
              </div>

              <div className="rounded-[24px] border border-brand-line bg-brand-neutral p-5">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-brand-primary">
                  <ListChecks className="size-4.5" />
                </div>
                <p className="mt-4 text-base font-semibold text-brand-ink">3. Approve pending</p>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  Approve the company from the pending list. The admin can then log in with the saved password.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-2xl border-brand-line px-6 text-brand-ink hover:bg-brand-soft"
                onClick={() => navigate("/super-admin/dashboard/pending-companies")}
              >
                Open pending companies
              </Button>
              <Button
                type="button"
                className="h-12 rounded-2xl bg-brand-primary px-6 text-white hover:bg-brand-primary/90"
                onClick={() => navigate("/super-admin/dashboard/companies/create")}
              >
                Create company
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
