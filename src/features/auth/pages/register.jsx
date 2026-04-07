import { Building2, CheckCircle2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

const defaultAdminForm = {
  name: "",
  companyName: "",
  companyDomain: "",
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
  }

  function updateUserField(field, value) {
    setUserForm((current) => ({ ...current, [field]: value }));
  }

  async function handleAdminSubmit(event) {
    event.preventDefault();

    if (!adminForm.name.trim() || !adminForm.companyName.trim() || !adminForm.companyDomain.trim()) {
      toast.error("Complete all admin registration fields.");
      return;
    }

    if (!isValidDomain(adminForm.companyDomain)) {
      toast.error("Enter a valid company domain like levitica.com");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: adminForm.name.trim(),
      company_name: adminForm.companyName.trim(),
      company_domain: adminForm.companyDomain.trim().toLowerCase().replace(/^@/, ""),
    };

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    console.log("Admin registration payload queued for super admin:", payload);
    toast.success("Admin registration request sent to super admin.");
    setAdminForm(defaultAdminForm);
    setIsSubmitting(false);
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

    const emailDomain = payload.email.split("@")[1] || "company domain";

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    console.log("User registration payload queued for domain admin:", payload);
    toast.success(`User registration request sent to the ${emailDomain} admin flow.`);
    setUserForm(defaultUserForm);
    setIsSubmitting(false);
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
          <section className="w-full max-w-xl space-y-5">
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
              <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/[0.92] p-6 shadow-[0_30px_80px_rgba(92,122,145,0.16)] backdrop-blur xl:p-8">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
                      <ShieldCheck className="size-3.5" />
                      {mode === "admin" ? "Admin Registration" : "User Registration"}
                    </span>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
                        {mode === "admin" ? "Register as admin" : "Register as user"}
                      </h1>
                      <p className="max-w-sm text-sm leading-6 text-brand-secondary">
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
                  <form className="space-y-5" onSubmit={handleAdminSubmit}>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-ink">Name</label>
                      <Input
                        value={adminForm.name}
                        onChange={(event) => updateAdminField("name", event.target.value)}
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

                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-2xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit admin registration"}
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-5" onSubmit={handleUserSubmit}>
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
                      <Input
                        type="password"
                        value={userForm.password}
                        onChange={(event) => updateUserField("password", event.target.value)}
                        placeholder="Enter password"
                        className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-ink">Confirm password</label>
                      <Input
                        type="password"
                        value={userForm.confirm_password}
                        onChange={(event) => updateUserField("confirm_password", event.target.value)}
                        placeholder="Confirm password"
                        className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-2xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Submit user registration"}
                    </Button>
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
