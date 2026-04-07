import { ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthStore } from "@/store/auth-store";

const modeContent = {
  workspace: {
    pill: "User Portal",
    note: "Company users and admins continue through direct login, MFA setup, or OTP verification based on the backend response.",
  },
  "super-admin": {
    pill: "Super Admin Portal",
    note: "Platform owners can use the same login experience, while staying separated by role-aware routing after authentication.",
  },
};

export function LoginPage() {
  const session = useAuthStore((state) => state.session);
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "super-admin" ? "super-admin" : "workspace";

  if (session?.accessToken) {
    if (session.role === "SUPER_ADMIN") {
      return <Navigate to="/super-admin/dashboard" replace />;
    }

    return <Navigate to="/admin/dashboard" replace />;
  }

  const selectedMode = modeContent[mode];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,_#b9dcf8_0%,_#d7ebfb_24%,_#edf6ff_58%,_#f8fbff_100%)]">
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
            <div>
              <p className="text-sm font-semibold text-brand-ink">Levitica</p>
            </div>
          </Link>

          <div className="hidden rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary shadow-[0_10px_30px_rgba(92,122,145,0.08)] ring-1 ring-white/60 md:inline-flex">
            Unified login
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <section className="w-full max-w-xl space-y-5">
            <div className="flex justify-center">
              <div className="inline-flex rounded-full border border-brand-line/70 bg-white/90 p-1 shadow-[0_14px_40px_rgba(92,122,145,0.12)]">
                <Button
                  type="button"
                  variant="ghost"
                  className={`rounded-full px-5 text-sm ${mode === "workspace" ? "bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white" : "text-brand-secondary hover:bg-brand-soft"}`}
                  onClick={() => setSearchParams({ mode: "workspace" })}
                >
                  User
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`rounded-full px-5 text-sm ${mode === "super-admin" ? "bg-brand-primary text-white hover:bg-brand-primary/90 hover:text-white" : "text-brand-secondary hover:bg-brand-soft"}`}
                  onClick={() => setSearchParams({ mode: "super-admin" })}
                >
                  Super Admin
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <LoginForm audience={mode} />
            </div>

            <div className="mx-auto max-w-md text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-secondary shadow-[0_10px_30px_rgba(92,122,145,0.08)]">
                <ShieldCheck className="size-3.5 text-brand-primary" />
                {selectedMode.pill}
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-secondary">
                {selectedMode.note}
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
