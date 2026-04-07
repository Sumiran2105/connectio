import { ArrowRight, Building2, CheckCircle2, Globe, Mail, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const highlights = [
  {
    title: "Enterprise onboarding",
    description: "Provision companies, assign admins, and bring each tenant into the platform with a guided flow.",
    icon: Building2,
  },
  {
    title: "Domain-aware access",
    description: "Keep company registration aligned with workspace ownership and future approval checks.",
    icon: Globe,
  },
  {
    title: "Secure operations",
    description: "Support role-based access, MFA-ready authentication, and backend-first governance.",
    icon: ShieldCheck,
  },
];

function isValidDomain(value) {
  return /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value.trim());
}

export function LandingPage() {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    companyDomain: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDomainVerified, setIsDomainVerified] = useState(false);

  const normalizedDomain = useMemo(
    () => form.companyDomain.trim().toLowerCase().replace(/^@/, ""),
    [form.companyDomain]
  );

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (field === "companyDomain") {
      setIsDomainVerified(false);
    }
  }

  async function handleVerifyDomain() {
    if (!isValidDomain(normalizedDomain)) {
      toast.error("Enter a valid company domain like levitica.com");
      return;
    }

    setIsVerifying(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setIsVerifying(false);
    setIsDomainVerified(true);
    toast.success("Domain verified successfully.");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.companyName.trim()) {
      toast.error("Complete all registration fields first.");
      return;
    }

    if (!isDomainVerified) {
      toast.error("Verify the company domain before submitting.");
      return;
    }

    toast.success("Registration request submitted.");
    setForm({
      name: "",
      companyName: "",
      companyDomain: "",
    });
    setIsDomainVerified(false);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f6f6ff_0%,_#eef3ef_44%,_#f6f6ff_100%)] text-brand-ink">
      <header className="sticky top-0 z-40 border-b border-brand-line/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-primary text-white">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
                Levitica
              </p>
              <p className="text-sm font-semibold text-brand-ink">Enterprise Platform</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#home" className="text-sm font-medium text-brand-secondary transition hover:text-brand-primary">Home</a>
            <a href="#about" className="text-sm font-medium text-brand-secondary transition hover:text-brand-primary">About</a>
            <a href="#contact" className="text-sm font-medium text-brand-secondary transition hover:text-brand-primary">Contact</a>
            <Link to="/register" className="text-sm font-medium text-brand-secondary transition hover:text-brand-primary">Register</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              className="rounded-2xl bg-brand-primary text-white hover:bg-brand-primary/90"
              asChild
            >
              <Link to="/register">Register</Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-brand-line bg-white text-brand-ink hover:bg-brand-soft"
              asChild
            >
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </header>

      <section id="home" className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-24">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
            <ShieldCheck className="size-3.5 text-brand-primary" />
            Collaboration SaaS
          </div>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1] tracking-[-0.05em] text-brand-ink md:text-6xl">
              One platform for enterprise collaboration, control, and company onboarding.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-brand-secondary md:text-lg">
              Bring companies into a secure collaboration workspace with a guided registration
              flow, domain-aware onboarding, and admin-first platform management.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              className="h-12 rounded-2xl bg-brand-primary px-6 text-white hover:bg-brand-primary/90"
              asChild
            >
              <Link to="/register">
                Start company registration
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-2xl border-brand-line bg-white px-6 text-brand-ink hover:bg-brand-soft"
              asChild
            >
              <Link to="/super-admin/auth">Super admin login</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {highlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[28px] border border-brand-line bg-white p-6 shadow-[0_16px_50px_rgba(68,83,74,0.06)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft">
                  <Icon className="size-5 text-brand-primary" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-brand-ink">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-brand-secondary">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="about" className="border-y border-brand-line/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-2 lg:px-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
              About
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Designed for company onboarding and long-term collaboration.
            </h2>
          </div>

          <div className="space-y-5 text-brand-secondary">
            <p className="leading-8">
              The platform supports super admins, company admins, and organization users in one
              structured system. It is built to scale from first registration through meetings,
              messaging, approvals, billing, and analytics.
            </p>
            <p className="leading-8">
              This landing flow focuses on company registration so new organizations can begin with
              validated workspace identity before deeper backend activation steps happen.
            </p>
          </div>
        </div>
      </section>

      <section id="register" className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
              Register
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Register your company workspace
            </h2>
            <p className="text-sm leading-7 text-brand-secondary">
              Submit your company details here. The company domain must be verified first, and
              only then will the registration request be allowed to continue.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[32px] border border-brand-line bg-white p-6 shadow-[0_18px_60px_rgba(68,83,74,0.08)] sm:p-8"
          >
            <div className="grid gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-ink">Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-ink">Company name</label>
                <Input
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  placeholder="Enter company name"
                  className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-ink">Company domain</label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    value={form.companyDomain}
                    onChange={(event) => updateField("companyDomain", event.target.value)}
                    placeholder="Enter domain like levitica.com"
                    className="h-12 rounded-2xl border-brand-line bg-brand-neutral"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-2xl border-brand-line bg-white px-5 text-brand-ink hover:bg-brand-soft"
                    onClick={handleVerifyDomain}
                    disabled={isVerifying}
                  >
                    {isVerifying ? "Verifying..." : "Verify domain"}
                  </Button>
                </div>

                {isDomainVerified ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    {normalizedDomain} verified
                  </div>
                ) : (
                  <p className="text-xs text-brand-secondary">
                    Verify the domain to unlock the submit action.
                  </p>
                )}
              </div>

              {isDomainVerified ? (
                <Button
                  type="submit"
                  className="mt-2 h-12 rounded-2xl bg-brand-primary text-white hover:bg-brand-primary/90"
                >
                  Submit registration
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </section>

      <section id="contact" className="border-t border-brand-line/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-16 lg:grid-cols-3 lg:px-10">
          <div className="space-y-3 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-secondary">
              Contact
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Talk to the onboarding team
            </h2>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-6">
            <Mail className="size-5 text-brand-primary" />
            <p className="mt-4 text-sm font-semibold text-brand-ink">Email</p>
            <p className="mt-2 text-sm text-brand-secondary">onboarding@levitica.com</p>
          </div>

          <div className="rounded-[28px] border border-brand-line bg-white p-6">
            <Phone className="size-5 text-brand-primary" />
            <p className="mt-4 text-sm font-semibold text-brand-ink">Phone</p>
            <p className="mt-2 text-sm text-brand-secondary">+91 98765 43210</p>
          </div>
        </div>
      </section>
    </main>
  );
}
