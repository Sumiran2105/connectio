import { useMutation } from "@tanstack/react-query";
import { KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { AUTH_LOGIN_MFA, AUTH_MFA_VERIFY } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";

export function AdminMfaVerifyPage() {
  const navigate = useNavigate();
  const pendingMfaSession = useAuthStore((state) => state.pendingMfaSession);
  const setSession = useAuthStore((state) => state.setSession);
  const clearPendingMfaSession = useAuthStore((state) => state.clearPendingMfaSession);
  const isSetupVerification = Boolean(pendingMfaSession?.mfaSetupRequired);
  const isUserFlow = pendingMfaSession?.role === "USER";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: "",
      rememberDevice: false,
    },
    mode: "onBlur",
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ mfaToken, userId, otp, rememberDevice }) => {
      if (isSetupVerification) {
        const response = await apiClient.post(AUTH_MFA_VERIFY, null, {
          params: {
            otp,
          },
          headers: {
            Authorization: `Bearer ${mfaToken}`,
          },
        });

        return response.data;
      }

      const response = await apiClient.post(AUTH_LOGIN_MFA, null, {
        params: {
          user_id: userId,
          otp,
          remember_device: rememberDevice,
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      if (isSetupVerification) {
        toast.success("MFA setup verified. Please sign in again to continue.");
        clearPendingMfaSession();
        navigate("/login?mode=workspace", { replace: true });
        return;
      }

      const nextRole = data.user_role || pendingMfaSession.role;
      setSession({
        accessToken:
          data.access_token ||
          data.token ||
          data.accessToken ||
          pendingMfaSession.mfaToken,
        refreshToken: data.refresh_token || data.refreshToken || null,
        expiresIn: data.expires_in || data.expiresIn || null,
        role: nextRole,
        email: pendingMfaSession.email,
        userId: data.user_id || data.id || pendingMfaSession.userId || null,
        mfaVerified: true,
      });
      clearPendingMfaSession();
      toast.success("OTP login verified. Workspace session is now active.");
      navigate(nextRole === "USER" ? "/user/dashboard" : "/admin/dashboard", {
        replace: true,
      });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        isSetupVerification
          ? "MFA setup verification failed. Please try again."
          : "OTP login verification failed. Please try again.";

      toast.error(message);
    },
  });

  if (!pendingMfaSession?.mfaToken && !pendingMfaSession?.userId) {
    return <Navigate to="/admin/auth" replace />;
  }

  const onSubmit = handleSubmit((values) => {
      verifyMutation.mutate({
        mfaToken: pendingMfaSession.mfaToken,
        userId: pendingMfaSession.userId,
        otp: values.otp,
        rememberDevice: values.rememberDevice,
      });
  });

  function handleCancel() {
    clearPendingMfaSession();
    navigate("/admin/auth", { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_100%)] px-6 py-10">
      <section className="w-full max-w-xl rounded-[32px] border border-brand-line bg-white p-7 shadow-[0_24px_80px_rgba(68,83,74,0.12)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
          <ShieldCheck className="size-3.5 text-brand-primary" />
          OTP Verify
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
              {isSetupVerification
                ? "Verify the authenticator setup."
                : "Enter the one-time password."}
            </h1>
          
          </div>

          <div className="flex size-14 shrink-0 items-center justify-center rounded-3xl bg-brand-tertiary text-white shadow-lg shadow-brand-tertiary/20">
            <KeyRound className="size-6" />
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-brand-line bg-brand-neutral p-5">
          <p className="text-sm text-brand-secondary">
            {isSetupVerification ? "Verifying setup for" : "Verifying login for"}
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-ink">
            {pendingMfaSession.email}
          </p>
         
        </div>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-ink" htmlFor="admin-otp">
              OTP code
            </label>
            <Input
              id="admin-otp"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              className="h-12 rounded-2xl border-brand-line bg-white px-4 text-sm text-brand-ink placeholder:text-brand-secondary/70 focus-visible:border-brand-primary focus-visible:ring-brand-primary/[0.15]"
              aria-invalid={Boolean(errors.otp)}
              {...register("otp", {
                required: "OTP is required",
                minLength: {
                  value: 4,
                  message: "OTP looks too short",
                },
              })}
            />
            {errors.otp ? (
              <p className="text-sm text-rose-600">{errors.otp.message}</p>
            ) : null}
          </div>

          {!isSetupVerification ? (
            <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-soft/30 px-4 py-3 text-sm text-brand-ink">
              <input
                type="checkbox"
                className="size-4 rounded border-brand-line accent-[var(--brand-primary)]"
                {...register("rememberDevice")}
              />
              Remember this device
            </label>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="h-12 rounded-2xl bg-brand-primary px-5 text-white hover:bg-brand-primary/90"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  {isSetupVerification ? "Verifying setup" : "Verifying login"}
                </>
              ) : (
                isSetupVerification ? "Verify setup OTP" : "Verify login OTP"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
              onClick={() =>
                navigate(
                  isSetupVerification ? "/admin/mfa/setup" : "/login?mode=workspace"
                )
              }
            >
              {isSetupVerification ? "Back to setup" : "Back to login"}
            </Button>
            <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft "
            onClick={() => {
              const targetPath = isUserFlow ? "/user/mfa/setup" : "/admin/mfa/setup";
              navigate(targetPath, { replace: true });
            }}
            >
              Reset MFA
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="h-12 rounded-2xl text-brand-secondary hover:bg-brand-soft hover:text-brand-ink"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
