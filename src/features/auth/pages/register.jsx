import {
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AUTH_ADMIN_REGISTER,
  AUTH_REGISTER,
  AUTH_RESEND_OTP,
  AUTH_VERIFY_OTP,
} from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";

const defaultAdminForm = {
  full_name: "",
  companyName: "",
  companyDomain: "",
  adminEmail: "",
  phoneNumber: "",
  address: "",
  password: "",
  confirm_password: "",
};

const defaultUserForm = {
  full_name: "",
  email: "",
  mobile_number: "",
  password: "",
  confirm_password: "",
};

function isValidDomain(value) {
  return /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value.trim());
}

function isValidEmail(value) {
  return /\S+@\S+\.\S+/.test(value.trim());
}

export function RegisterPage() {
  const session = useAuthStore((state) => state.session);
  const [mode, setMode] = useState("admin");
  const [adminForm, setAdminForm] = useState(defaultAdminForm);
  const [userForm, setUserForm] = useState(defaultUserForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [adminOtp, setAdminOtp] = useState("");
  const [isDomainVerified, setIsDomainVerified] = useState(false);
  const [registeredCompanyId, setRegisteredCompanyId] = useState("");
  const [isAdminPasswordVisible, setIsAdminPasswordVisible] = useState(false);
  const [isAdminConfirmPasswordVisible, setIsAdminConfirmPasswordVisible] = useState(false);
  const [isUserPasswordVisible, setIsUserPasswordVisible] = useState(false);
  const [isUserConfirmPasswordVisible, setIsUserConfirmPasswordVisible] = useState(false);

  if (session?.accessToken) {
    if (session.role === "SUPER_ADMIN") {
      return <Navigate to="/super-admin/dashboard" replace />;
    }

    return <Navigate to="/admin/dashboard" replace />;
  }

  const helperText = useMemo(() => {
    if (mode === "admin") {
      return "Admin registration requests are prepared for super admin review and company onboarding approval.";
    }

    return "User registration requests are prepared against the email domain so they can be routed to the matching company admin.";
  }, [mode]);

  function updateAdminField(field, value) {
    setAdminForm((current) => ({ ...current, [field]: value }));

    if (
      field === "companyDomain" ||
      field === "adminEmail" ||
      field === "password" ||
      field === "confirm_password"
    ) {
      setIsDomainVerified(false);
      setIsOtpSent(false);
      setAdminOtp("");
      setRegisteredCompanyId("");
    }
  }

  function updateUserField(field, value) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSendDomainOtp(event) {
    event.preventDefault();

    if (
      !adminForm.full_name.trim() ||
      !adminForm.companyName.trim() ||
      !adminForm.companyDomain.trim() ||
      !adminForm.adminEmail.trim() ||
      !adminForm.phoneNumber.trim() ||
      !adminForm.address.trim() ||
      !adminForm.password ||
      !adminForm.confirm_password
    ) {
      toast.error("Complete all admin registration fields before sending OTP.");
      return;
    }

    if (!isValidDomain(adminForm.companyDomain)) {
      toast.error("Enter a valid company domain like levitica.com");
      return;
    }

    if (!isValidEmail(adminForm.adminEmail)) {
      toast.error("Enter a valid admin email address.");
      return;
    }

    if (adminForm.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (adminForm.password !== adminForm.confirm_password) {
      toast.error("Password and confirm password must match.");
      return;
    }

    try {
      setIsSendingOtp(true);

      const response = await apiClient.post(AUTH_ADMIN_REGISTER, null, {
        params: {
          full_name: adminForm.full_name.trim(),
          company_name: adminForm.companyName.trim(),
          domain: adminForm.companyDomain.trim().toLowerCase().replace(/^@/, ""),
          email: adminForm.adminEmail.trim().toLowerCase(),
          phone_number: adminForm.phoneNumber.trim(),
          address: adminForm.address.trim(),
          password: adminForm.password,
          confirm_password: adminForm.confirm_password,
        },
      });

      setRegisteredCompanyId(response.data?.company_id || "");
      setIsOtpSent(true);
      toast.success(response.data?.message || `OTP sent to ${adminForm.adminEmail.trim().toLowerCase()}.`);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to send OTP right now.";

      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyAdminOtp() {
    if (!adminOtp.trim()) {
      toast.error("Enter the OTP sent to the admin email.");
      return;
    }

    if (adminOtp.trim().length < 4) {
      toast.error("Enter a valid OTP.");
      return;
    }

    if (!registeredCompanyId) {
      toast.error("Company registration reference is missing. Send OTP again.");
      return;
    }

    try {
      setIsVerifyingOtp(true);

      const response = await apiClient.post(AUTH_VERIFY_OTP(registeredCompanyId), null, {
        params: {
          otp: adminOtp.trim(),
        },
      });

      setIsDomainVerified(true);
      toast.success(response.data?.message || "Verified domain. Your account will be activated soon.");
      setIsSubmitting(true);
      window.setTimeout(() => {
        setAdminForm(defaultAdminForm);
        setIsDomainVerified(false);
        setIsOtpSent(false);
        setAdminOtp("");
        setRegisteredCompanyId("");
        setIsSubmitting(false);
      }, 900);
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
    if (!registeredCompanyId) {
      toast.error("Company registration reference is missing. Submit again.");
      return;
    }

    try {
      setIsResendingOtp(true);

      const response = await apiClient.post(AUTH_RESEND_OTP(registeredCompanyId));

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

  async function handleUserSubmit(event) {
    event.preventDefault();

    if (
      !userForm.full_name.trim() ||
      !userForm.email.trim() ||
      !userForm.mobile_number.trim() ||
      !userForm.password ||
      !userForm.confirm_password
    ) {
      toast.error("Complete all user registration fields.");
      return;
    }

    if (!isValidEmail(userForm.email)) {
      toast.error("Enter a valid email address.");
      return;
    }

    if (userForm.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (userForm.password !== userForm.confirm_password) {
      toast.error("Password and confirm password must match.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      full_name: userForm.full_name.trim(),
      email: userForm.email.trim().toLowerCase(),
      mobile_number: userForm.mobile_number.trim(),
      password: userForm.password,
      confirm_password: userForm.confirm_password,
    };

    try {
      const response = await apiClient.post(AUTH_REGISTER, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success(response.data?.message || "User registration request submitted successfully.");
      setUserForm(defaultUserForm);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to register the user right now.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,_#b9dcf8_0%,_#d7ebfb_24%,_#edf6ff_58%,_#f8fbff_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_48%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.92)_100%)]" />
      <div className="absolute left-[8%] top-[18%] size-48 rounded-full bg-white/40 blur-3xl" />
      <div className="absolute right-[10%] top-[24%] size-56 rounded-full bg-white/30 blur-3xl" />
      <div className="absolute bottom-[12%] left-[12%] h-36 w-60 rounded-full bg-white/55 blur-2xl" />
      <div className="absolute bottom-[10%] right-[14%] h-40 w-72 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute left-1/2 top-[57%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45" />
      <div className="absolute left-1/2 top-[57%] h-[760px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-2xl bg-white/75 px-4 py-2 shadow-[0_10px_30px_rgba(92,122,145,0.08)] ring-1 ring-white/60 transition hover:bg-white/90"
          >
            <div className="flex size-8 items-center justify-center rounded-xl bg-[#1f2937] text-white">
              <Sparkles className="size-4" />
            </div>
            <p className="text-sm font-semibold text-brand-ink">Levitica</p>
          </Link>

          <div className="hidden rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary shadow-[0_10px_30px_rgba(92,122,145,0.08)] ring-1 ring-white/60 md:inline-flex">
            Unified register
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center py-8 sm:items-center">
          <section className="w-full max-w-5xl space-y-5">
            <div className="flex justify-center">
              <div className="inline-flex rounded-full border border-brand-line/70 bg-white/90 p-1 shadow-[0_14px_40px_rgba(92,122,145,0.12)]">
                <Button
                  type="button"
                  variant="ghost"
                  className={`rounded-full px-5 text-sm ${mode === "admin" ? "bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white" : "text-brand-secondary hover:bg-brand-soft"}`}
                  onClick={() => setMode("admin")}
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`rounded-full px-5 text-sm ${mode === "user" ? "bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white" : "text-brand-secondary hover:bg-brand-soft"}`}
                  onClick={() => setMode("user")}
                >
                  User
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-4xl rounded-[30px] border border-white/80 bg-white/[0.92] p-5 shadow-[0_30px_80px_rgba(92,122,145,0.16)] backdrop-blur md:p-6 xl:p-7">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                      <ShieldCheck className="size-3.5" />
                      {mode === "admin" ? "Admin Registration" : "User Registration"}
                    </span>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                        {mode === "admin" ? "Register as admin" : "Register as user"}
                      </h1>
                      <p className="max-w-2xl text-sm leading-6 text-brand-secondary">
                        {mode === "admin"
                          ? "Create a company registration request that will be reviewed by super admin."
                          : "Create a user registration request that can be routed to the matching company admin."}
                      </p>
                    </div>
                  </div>

                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
                    {mode === "admin" ? <Building2 className="size-5" /> : <UserRound className="size-5" />}
                  </div>
                </div>

                {mode === "admin" ? (
                  <form className="space-y-4" onSubmit={handleSendDomainOtp}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-ink">Full name</label>
                      <Input
                        value={adminForm.full_name}
                        onChange={(event) => updateAdminField("full_name", event.target.value)}
                        placeholder="Enter your full name"
                        className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                      />
                      </div>

                      <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-ink">Company name</label>
                      <Input
                        value={adminForm.companyName}
                        onChange={(event) => updateAdminField("companyName", event.target.value)}
                        placeholder="Enter company name"
                        className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                      />
                      </div>

                      <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-ink">Company domain</label>
                        <Input
                          value={adminForm.companyDomain}
                          onChange={(event) => updateAdminField("companyDomain", event.target.value)}
                          placeholder="Enter company domain"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Phone no</label>
                        <Input
                          value={adminForm.phoneNumber}
                          onChange={(event) => updateAdminField("phoneNumber", event.target.value)}
                          placeholder="Enter phone number"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Company address</label>
                        <Input
                          value={adminForm.address}
                          onChange={(event) => updateAdminField("address", event.target.value)}
                          placeholder="Enter company address"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Admin email ID</label>
                        <Input
                          type="email"
                          value={adminForm.adminEmail}
                          onChange={(event) => updateAdminField("adminEmail", event.target.value)}
                          placeholder="Enter admin email"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Password</label>
                        <div className="relative">
                          <Input
                            type={isAdminPasswordVisible ? "text" : "password"}
                            value={adminForm.password}
                            onChange={(event) => updateAdminField("password", event.target.value)}
                            placeholder="Create password"
                            className="h-12 rounded-2xl border-brand-line bg-brand-neutral pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full text-brand-secondary hover:bg-white hover:text-brand-ink"
                            onClick={() => setIsAdminPasswordVisible((current) => !current)}
                          >
                            {isAdminPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            <span className="sr-only">
                              {isAdminPasswordVisible ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Confirm password</label>
                        <div className="relative">
                          <Input
                            type={isAdminConfirmPasswordVisible ? "text" : "password"}
                            value={adminForm.confirm_password}
                            onChange={(event) => updateAdminField("confirm_password", event.target.value)}
                            placeholder="Confirm password"
                            className="h-12 rounded-2xl border-brand-line bg-brand-neutral pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full text-brand-secondary hover:bg-white hover:text-brand-ink"
                            onClick={() => setIsAdminConfirmPasswordVisible((current) => !current)}
                          >
                            {isAdminConfirmPasswordVisible ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                            <span className="sr-only">
                              {isAdminConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {!isOtpSent ? (
                      <div className="flex justify-center">
                        <Button
                          type="submit"
                          size="lg"
                          className="h-12 w-full rounded-2xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-primary/90 md:w-auto md:min-w-56 md:px-8"
                          disabled={isSendingOtp}
                        >
                          {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                        </Button>
                      </div>
                    ) : null}

                    {isOtpSent ? (
                      <div className="space-y-4 rounded-[24px] border border-brand-line bg-brand-neutral p-4 md:p-5">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                            <Mail className="size-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-brand-ink">OTP verification</p>
                            <p className="mt-1 text-sm leading-6 text-brand-secondary">
                              We sent an OTP to the admin email{" "}
                              <span className="font-medium text-brand-ink">{adminForm.adminEmail}</span>. Enter it
                              below to verify the domain and activate the registration request.
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                          <Input
                            value={adminOtp}
                            onChange={(event) => setAdminOtp(event.target.value)}
                            placeholder="Enter OTP"
                            className="h-12 rounded-2xl border-brand-line bg-white"
                          />
                          <Button
                            type="button"
                            className="h-12 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
                            disabled={isVerifyingOtp}
                            onClick={handleVerifyAdminOtp}
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
                            Verified domain
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {isDomainVerified ? (
                      <p className="rounded-2xl border border-brand-primary/10 bg-brand-primary/5 px-4 py-3 text-sm leading-6 text-brand-primary">
                        Domain verified successfully. Your account will be activated soon.
                      </p>
                    ) : null}
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={handleUserSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Full name</label>
                        <Input
                          value={userForm.full_name}
                          onChange={(event) => updateUserField("full_name", event.target.value)}
                          placeholder="Enter your full name"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Email</label>
                        <Input
                          type="email"
                          value={userForm.email}
                          onChange={(event) => updateUserField("email", event.target.value)}
                          placeholder="user@example.com"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Mobile number</label>
                        <Input
                          value={userForm.mobile_number}
                          onChange={(event) => updateUserField("mobile_number", event.target.value)}
                          placeholder="Enter mobile number"
                          className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Password</label>
                        <div className="relative">
                          <Input
                            type={isUserPasswordVisible ? "text" : "password"}
                            value={userForm.password}
                            onChange={(event) => updateUserField("password", event.target.value)}
                            placeholder="Enter password"
                            className="h-12 rounded-2xl border-brand-line bg-brand-neutral pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full text-brand-secondary hover:bg-white hover:text-brand-ink"
                            onClick={() => setIsUserPasswordVisible((current) => !current)}
                          >
                            {isUserPasswordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            <span className="sr-only">
                              {isUserPasswordVisible ? "Hide password" : "Show password"}
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-brand-ink">Confirm password</label>
                        <div className="relative">
                          <Input
                            type={isUserConfirmPasswordVisible ? "text" : "password"}
                            value={userForm.confirm_password}
                            onChange={(event) => updateUserField("confirm_password", event.target.value)}
                            placeholder="Confirm password"
                            className="h-12 rounded-2xl border-brand-line bg-brand-neutral pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full text-brand-secondary hover:bg-white hover:text-brand-ink"
                            onClick={() => setIsUserConfirmPasswordVisible((current) => !current)}
                          >
                            {isUserConfirmPasswordVisible ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                            <span className="sr-only">
                              {isUserConfirmPasswordVisible ? "Hide confirm password" : "Show confirm password"}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 w-full rounded-2xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-primary/90 md:w-auto md:min-w-64 md:px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit user registration"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="mx-auto max-w-md text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-secondary shadow-[0_10px_30px_rgba(92,122,145,0.08)]">
                <CheckCircle2 className="size-3.5 text-brand-primary" />
                {mode === "admin" ? "Admin Flow" : "User Flow"}
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-secondary">{helperText}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
