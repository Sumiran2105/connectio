import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AUTH_LOGIN } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";

const defaultValues = {
  email: "",
  password: "",
};

const workspaceDemoLogins = [
  {
    label: "Admin demo",
    email: "admin@demo.com",
    password: "Admin@1234",
  },
  {
    label: "User demo",
    email: "user@demo.com",
    password: "User@1234",
  },
];

export function LoginForm({ audience = "workspace" }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const setPendingMfaSession = useAuthStore((state) => state.setPendingMfaSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await apiClient.post(AUTH_LOGIN, null, {
        params: {
          email: payload.email,
          password: payload.password,
        },
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      const role = data.user_role;

      if (role === "SUPER_ADMIN") {
        if (audience === "workspace") {
          clearSession();
          toast.error("This is a super admin account. Switch to the Super Admin tab.");
          return;
        }

        setSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          role,
          email: variables.email,
          userId: data.user_id || data.id || null,
        });

        toast.success("Super admin signed in successfully.");
        navigate("/super-admin/dashboard", { replace: true });
        return;
      }

      if (audience === "super-admin") {
        clearSession();
        toast.error("This account belongs to the admin or user flow. Use the Admin/User tab.");
        return;
      }

      if (data.access_token) {
        setSession({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          role,
          email: variables.email,
          userId: data.user_id || data.id || null,
          mfaVerified: true,
        });

        toast.success("Signed in successfully.");
        navigate(role === "USER" ? "/user/dashboard" : "/admin/dashboard", { replace: true });
        return;
      }

      const requiresSetup = Boolean(data.mfa_setup_required);

      setPendingMfaSession({
        mfaToken: data.mfa_token || null,
        userId: data.user_id || null,
        mfaSetupRequired: requiresSetup,
        role,
        email: variables.email,
      });

      if (requiresSetup) {
        toast.success("Credentials accepted. Continue with MFA setup.");
        navigate("/admin/mfa/setup", { replace: true });
        return;
      }

      if (data.user_id) {
        toast.success("Credentials accepted. Continue with OTP login.");
        navigate("/admin/mfa/verify", { replace: true });
        return;
      }

      toast.error("Login response is missing the data needed to continue.");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Unable to sign in right now. Please check your credentials.";

      toast.error(message);
    },
  });

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  const isSuperAdmin = audience === "super-admin";

  const applyDemoLogin = (demoLogin) => {
    setValue("email", demoLogin.email, { shouldDirty: true, shouldValidate: true });
    setValue("password", demoLogin.password, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/[0.92] p-5 shadow-[0_30px_80px_rgba(92,122,145,0.16)] backdrop-blur sm:p-6 xl:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
            <ShieldCheck className="size-3.5" />
            {isSuperAdmin ? "Platform Access" : "Workspace Access"}
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-brand-ink sm:text-3xl">
              {isSuperAdmin ? "Super admin sign in" : "User sign in"}
            </h1>
            <p className="max-w-sm text-sm leading-6 text-brand-secondary">
              {isSuperAdmin
                ? "Use your platform credentials to access global controls and tenant management."
                : "Sign in with your email and password to continue into your workspace flow."}
            </p>
          </div>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20 sm:size-12">
          <LockKeyhole className="size-5" />
        </div>
      </div>

      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink" htmlFor={`login-email-${audience}`}>
            Email
          </label>
          <Input
            id={`login-email-${audience}`}
            type="email"
            placeholder={isSuperAdmin ? "owner@conectio.app" : "admin@company.com"}
            autoComplete="email"
            className="h-12 rounded-2xl border-brand-line bg-brand-neutral px-4 text-sm text-brand-ink placeholder:text-brand-secondary/70 focus-visible:border-brand-primary focus-visible:ring-brand-primary/[0.15]"
            aria-invalid={Boolean(errors.email)}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-brand-ink" htmlFor={`login-password-${audience}`}>
            Password
          </label>
          <Input
            id={`login-password-${audience}`}
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-12 rounded-2xl border-brand-line bg-brand-neutral px-4 text-sm text-brand-ink placeholder:text-brand-secondary/70 focus-visible:border-brand-primary focus-visible:ring-brand-primary/[0.15]"
            aria-invalid={Boolean(errors.password)}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password ? (
            <p className="text-sm text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>

        {!isSuperAdmin ? (
          <div className="grid gap-2 rounded-2xl border border-brand-line bg-white/70 p-3 sm:grid-cols-2">
            {workspaceDemoLogins.map((demoLogin) => (
              <Button
                key={demoLogin.email}
                type="button"
                variant="ghost"
                className="h-auto justify-start rounded-xl px-3 py-2 text-left text-brand-ink hover:bg-brand-soft"
                onClick={() => applyDemoLogin(demoLogin)}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{demoLogin.label}</span>
                  <span className="block truncate text-xs font-normal text-brand-secondary">
                    {demoLogin.email}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-brand-primary text-sm font-semibold text-white hover:bg-brand-primary/90"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
      
    </div>
  );
}
