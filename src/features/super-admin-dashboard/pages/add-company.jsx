import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
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
import { Label } from "@/components/ui/label";
import {
  SUPERADMIN_CREATE_COMPANY,
  SUPERADMIN_INVITE_COMPANY_ADMIN,
  SUPERADMIN_RESEND_COMPANY_OTP,
  SUPERADMIN_VERIFY_COMPANY_OTP,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { SuperAdminLayout } from "../components/super-admin-layout";

const defaultForm = {
  name: "",
  domain: "",
  email: "",
  phoneNumber: "",
};

function isValidDomain(value) {
  return /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value.trim());
}

function isValidEmail(value) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function AddCompanyPage() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const [form, setForm] = useState(defaultForm);
  const [companyOtp, setCompanyOtp] = useState("");
  const [createdCompanyId, setCreatedCompanyId] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const requestConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }),
    [session?.accessToken]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "domain" || field === "email") {
      setIsOtpSent(false);
      setIsDomainVerified(false);
      setCompanyOtp("");
      setCreatedCompanyId("");
    }
  }

  function validateBaseForm() {
    if (!form.name.trim() || !form.domain.trim() || !form.email.trim() || !form.phoneNumber.trim()) {
      toast.error("Complete all company registration fields.");
      return false;
    }

    if (!isValidDomain(form.domain)) {
      toast.error("Enter a valid domain like levitica.com");
      return false;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Enter a valid admin email address.");
      return false;
    }

    return true;
  }

  async function handleCreateCompany(event) {
    event.preventDefault();

    if (!validateBaseForm()) {
      return;
    }

    try {
      setIsCreatingCompany(true);

      const response = await apiClient.post(SUPERADMIN_CREATE_COMPANY, null, {
        ...requestConfig,
        params: {
          name: form.name.trim(),
          domain: form.domain.trim().toLowerCase().replace(/^@/, ""),
          email: form.email.trim().toLowerCase(),
          phone_number: form.phoneNumber.trim(),
        },
      });

      setCreatedCompanyId(response.data?.company_id || "");
      setIsOtpSent(true);
      toast.success(response.data?.message || `OTP sent to ${form.email.trim().toLowerCase()}.`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to create the company right now.";

      toast.error(message);
    } finally {
      setIsCreatingCompany(false);
    }
  }

  async function handleVerifyOtp() {
    if (!companyOtp.trim()) {
      toast.error("Enter the OTP sent to the admin email.");
      return;
    }

    if (!createdCompanyId) {
      toast.error("Company reference is missing. Create the company again.");
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const response = await apiClient.post(SUPERADMIN_VERIFY_COMPANY_OTP(createdCompanyId), null, {
        ...requestConfig,
        params: {
          otp: companyOtp.trim(),
        },
      });

      setIsDomainVerified(true);
      toast.success(response.data?.message || "Company domain verified successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to verify OTP right now.";

      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleResendOtp() {
    if (!createdCompanyId) {
      toast.error("Company reference is missing. Create the company again.");
      return;
    }

    try {
      setIsResendingOtp(true);

      const response = await apiClient.post(
        SUPERADMIN_RESEND_COMPANY_OTP(createdCompanyId),
        null,
        requestConfig
      );

      toast.success(response.data?.message || "OTP resent successfully.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to resend OTP right now.";

      toast.error(message);
    } finally {
      setIsResendingOtp(false);
    }
  }

  async function handleConfirmInvite() {
    if (!createdCompanyId) {
      toast.error("Company reference is missing.");
      return;
    }

    try {
      setIsSendingInvite(true);

      const response = await apiClient.post(
        SUPERADMIN_INVITE_COMPANY_ADMIN(createdCompanyId),
        null,
        {
          ...requestConfig,
          params: {
            admin_email: form.email.trim().toLowerCase(),
          },
        }
      );

      toast.success(response.data?.message || "Company approved and invite sent.");
      setIsInviteDialogOpen(false);
      navigate("/super-admin/dashboard", { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to send invite right now.";

      toast.error(message);
    } finally {
      setIsSendingInvite(false);
    }
  }

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
              Add company
            </h1>
            <p className="text-sm text-brand-secondary">
              Create the company, verify its domain with OTP, and then send the final invitation.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-brand-line bg-white p-8 shadow-[0_16px_50px_rgba(68,83,74,0.06)] md:p-10">
          <form onSubmit={handleCreateCompany} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-brand-ink">
                  <Building2 className="size-4 text-brand-primary" />
                  Company name
                </Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter company name"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="flex items-center gap-2 text-brand-ink">
                  <Globe className="size-4 text-brand-primary" />
                  Company domain
                </Label>
                <Input
                  id="domain"
                  value={form.domain}
                  onChange={(event) => updateField("domain", event.target.value)}
                  placeholder="Enter company domain"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-brand-ink">
                  <Mail className="size-4 text-brand-primary" />
                  Admin email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Enter admin email"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-brand-ink">
                  <Phone className="size-4 text-brand-primary" />
                  Phone number
                </Label>
                <Input
                  id="phone"
                  value={form.phoneNumber}
                  onChange={(event) => updateField("phoneNumber", event.target.value)}
                  placeholder="Enter phone number"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>
            </div>

            {!isOtpSent ? (
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={isCreatingCompany}
                  className="h-12 rounded-2xl bg-brand-primary px-10 text-white hover:bg-brand-primary/90"
                >
                  {isCreatingCompany ? "Creating and sending OTP..." : "Create company and send OTP"}
                </Button>
              </div>
            ) : null}

            {isOtpSent ? (
              <div className="space-y-4 rounded-[24px] border border-brand-line bg-brand-neutral p-5">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">Verify company domain</p>
                    <p className="mt-1 text-sm leading-6 text-brand-secondary">
                      We sent an OTP to <span className="font-medium text-brand-ink">{form.email}</span>.
                      Once verified, the company will be ready for the invitation step.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                  <Input
                    value={companyOtp}
                    onChange={(event) => setCompanyOtp(event.target.value)}
                    placeholder="Enter OTP"
                    className="h-12 rounded-2xl border-brand-line bg-white"
                  />
                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
                    disabled={isVerifyingOtp}
                    onClick={handleVerifyOtp}
                  >
                    {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-12 rounded-2xl px-4 text-brand-secondary hover:bg-white hover:text-brand-ink"
                    disabled={isResendingOtp}
                    onClick={handleResendOtp}
                  >
                    {isResendingOtp ? "Resending..." : "Resend OTP"}
                  </Button>
                </div>

                {isDomainVerified ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Domain verified
                  </div>
                ) : null}
              </div>
            ) : null}

            {isDomainVerified ? (
              <div className="space-y-4 rounded-[24px] border border-brand-primary/10 bg-brand-primary/5 p-5">
                <p className="text-sm leading-6 text-brand-primary">
                  Company domain verified successfully. The final step is to send the invitation to{" "}
                  <span className="font-semibold">{form.email}</span>.
                </p>
                <div className="flex justify-center">
                  <Button
                    type="button"
                    className="h-12 rounded-2xl bg-brand-primary px-8 text-white hover:bg-brand-primary/90"
                    onClick={() => setIsInviteDialogOpen(true)}
                  >
                    Approve and send invite
                  </Button>
                </div>
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="rounded-[28px] border border-brand-line bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-brand-ink">
              Confirm company invite
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-brand-secondary">
              The company <span className="font-semibold text-brand-ink">{form.name || "this company"}</span> is verified.
              An invitation will be sent to <span className="font-semibold text-brand-ink">{form.email || "the admin email"}</span>.
              Please confirm to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-[22px] border border-brand-line bg-brand-neutral p-4 text-sm text-brand-secondary">
            <p>
              <span className="font-semibold text-brand-ink">Company:</span> {form.name || "Not available"}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-brand-ink">Domain:</span> {form.domain || "Not available"}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-brand-ink">Admin email:</span> {form.email || "Not available"}
            </p>
          </div>

          <DialogFooter className="gap-3 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-brand-line px-5"
              disabled={isSendingInvite}
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
              disabled={isSendingInvite}
              onClick={handleConfirmInvite}
            >
              {isSendingInvite ? "Sending invite..." : "Confirm and send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
