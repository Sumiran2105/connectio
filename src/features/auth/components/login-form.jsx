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

const demoUser = {
  email: "user@demo.com",
  password: "User@12345",
  user_role: "USER",
  access_token: "demo-user-access-token",
  refresh_token: "demo-user-refresh-token",
  expires_in: 86400,
};

export function LoginForm({ audience = "workspace" }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const setPendingMfaSession = useAuthStore((state) => state.setPendingMfaSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    mode: "onBlur",
  });

  const loginMutation = useMutation({
    mutationFn: async (payload) => {
      if (
        audience === "workspace" &&
        payload.email.trim().toLowerCase() === demoUser.email &&
        payload.password === demoUser.password
      ) {
        return demoUser;
      }

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

  return (
    <div className="w-full max-w-md rounded-[30px] border border-white/80 bg-white/[0.92] p-6 shadow-[0_30px_80px_rgba(92,122,145,0.16)] backdrop-blur xl:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
            <ShieldCheck className="size-3.5" />
            {isSuperAdmin ? "Platform Access" : "Workspace Access"}
          </span>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
              {isSuperAdmin ? "Super admin sign in" : "User sign in"}
            </h1>
            <p className="max-w-sm text-sm leading-6 text-brand-secondary">
              {isSuperAdmin
                ? "Use your platform credentials to access global controls and tenant management."
                : "Sign in with your email and password to continue into your workspace flow."}
            </p>
          </div>
        </div>

        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
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

      {!isSuperAdmin ? (
        <div className="mt-6 rounded-2xl border border-brand-line bg-brand-neutral p-4 text-sm text-brand-secondary">
          Demo user:
          <code className="mx-1 rounded bg-white px-1.5 py-0.5 text-xs text-brand-ink">
            user@demo.com
          </code>
          /
          <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-xs text-brand-ink">
            User@12345
          </code>
        </div>
      ) : null}
    </div>
  );
}
