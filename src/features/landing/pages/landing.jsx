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

      <section id="home" className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] pt-16 pb-24 px-6 overflow-hidden">

        {/* Glowing Background concentric circles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-60">
          <div className="absolute size-[400px] rounded-full border-[1.5px] border-brand-primary/30 shadow-[0_0_30px_rgba(0,105,71,0.15)] animate-pulse [animation-duration:3s]" />
          <div className="absolute size-[650px] rounded-full border-[1.5px] border-brand-primary/20 shadow-[0_0_30px_rgba(0,105,71,0.1)] animate-pulse [animation-duration:4s] [animation-delay:1s]" />
          <div className="absolute size-[950px] rounded-full border border-brand-primary/10 shadow-[0_0_30px_rgba(0,105,71,0.05)] animate-pulse [animation-duration:5s] [animation-delay:2s]" />
          <div className="absolute size-[1300px] rounded-full border border-brand-primary/5 animate-pulse [animation-duration:6s] [animation-delay:3s]" />
        </div>

        {/* Massive Title Text (Above the phone) */}
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col pointer-events-none mb-12 sm:mb-16">
          <style>{`
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <h1 className="text-[60px] sm:text-[90px] lg:text-[120px] font-bold leading-[0.9] tracking-tight text-brand-ink/90">
            <span className="block text-center lg:text-left" style={{ animation: "slideUpFade 1s ease-out forwards" }}>
              Welcome
            </span>
            <span className="block text-center lg:text-right text-brand-primary opacity-0" style={{ animation: "slideUpFade 1s ease-out 0.4s forwards" }}>
              To Connectio
            </span>
          </h1>
        </div>

        {/* Center Mockup with Floating Elements */}
        <div className="relative z-30 flex justify-center opacity-0" style={{ animation: "slideUpFade 1s ease-out 0.6s forwards" }}>

          {/* Floating Element 1 - Top Left */}
          <div className="hidden lg:flex absolute top-[15%] -left-[170px] flex-col items-center gap-3 bg-white/90 backdrop-blur p-4 rounded-[28px] shadow-[0_20px_40px_rgba(68,83,74,0.08)] border border-white animate-bounce [animation-duration:5s]">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 text-brand-primary flex items-center justify-center">
              <ShieldCheck className="size-7" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-brand-ink leading-tight">Enterprise<br />Grade</p>
            </div>
          </div>

          {/* Floating Element 2 - Bottom Left */}
          <div className="hidden lg:flex absolute bottom-[25%] -left-[140px] flex-col items-center gap-3 bg-white/90 backdrop-blur p-4 rounded-[28px] shadow-[0_20px_40px_rgba(68,83,74,0.08)] border border-white animate-bounce [animation-duration:5.5s] [animation-delay:0.8s]">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-emerald-600 flex items-center justify-center">
              <Globe className="size-7" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-brand-ink leading-tight">Custom<br />Domains</p>
            </div>
          </div>

          {/* Floating Element 3 - Top Right */}
          <div className="hidden lg:flex absolute top-[20%] -right-[150px] flex-col items-center gap-3 bg-white/90 backdrop-blur p-4 rounded-[28px] shadow-[0_20px_40px_rgba(68,83,74,0.08)] border border-white animate-bounce [animation-duration:4.5s] [animation-delay:0.4s]">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-amber-500 flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-brand-ink leading-tight">Secure<br />Auth</p>
            </div>
          </div>

          {/* Floating Element 4 - Bottom Right */}
          <div className="hidden lg:flex absolute bottom-[15%] -right-[180px] flex-col items-center gap-3 bg-white/90 backdrop-blur p-4 rounded-[28px] shadow-[0_20px_40px_rgba(68,83,74,0.08)] border border-white animate-bounce [animation-duration:6s] [animation-delay:1.5s]">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 text-indigo-600 flex items-center justify-center">
              <Building2 className="size-7" />
            </div>
            <div className="text-center">
              <p className="text-[12px] font-bold text-brand-ink leading-tight">Fast<br />Onboarding</p>
            </div>
          </div>

          {/* CSS Phone Frame */}
          <div className="w-[300px] sm:w-[320px] h-[620px] bg-white rounded-[50px] shadow-[0_0_60px_rgba(0,105,71,0.1)] ring-4 ring-white border-[10px] border-brand-line relative overflow-hidden flex flex-col shrink-0">

            {/* Dynamic Island */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-40 flex items-center justify-between px-3">
              <div className="size-3 rounded-full bg-white/15" />
              <div className="size-3 rounded-full bg-white/15" />
            </div>

            {/* Simulated UI Inside Phone - Connectio Dashboard Mock */}
            <div className="flex-1 overflow-y-auto bg-brand-neutral pt-16 pb-8 px-5 [scrollbar-width:none]">

              {/* Profile Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-brand-soft overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] font-bold text-brand-secondary">Hello!</p>
                    <p className="text-sm font-bold text-brand-ink truncate">Admin User</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20">
                  <Sparkles className="size-3.5 text-brand-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Pro</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-brand-line text-center">
                  <div className="size-10 mx-auto bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-2">
                    <Building2 className="size-5" />
                  </div>
                  <p className="text-[11px] font-bold text-brand-ink">Companies</p>
                </div>
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-brand-line text-center">
                  <div className="size-10 mx-auto bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2">
                    <ShieldCheck className="size-5" />
                  </div>
                  <p className="text-[11px] font-bold text-brand-ink">Security</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-sm font-bold text-brand-ink mb-3">Recent Activity</h3>
                <div className="bg-white rounded-[20px] p-3 shadow-sm border border-brand-line">

                  {[
                    { icon: ArrowRight, color: "bg-blue-500", name: "Company onboarded", desc: "Acme Corp joined", time: "10m" },
                    { icon: Globe, color: "bg-emerald-500", name: "Domain verified", desc: "acme.com verified", time: "1h" },
                    { icon: CheckCircle2, color: "bg-brand-primary", name: "Account active", desc: "All systems go", time: "1d" },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-brand-line/50 last:border-0">
                      <div className={`size-9 ${act.color} rounded-xl flex items-center justify-center text-white shrink-0`}>
                        <act.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-brand-ink truncate">{act.name}</p>
                        <p className="text-[9px] text-brand-secondary truncate">{act.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] text-brand-secondary font-medium">{act.time}</p>
                      </div>
                    </div>
                  ))}

                  <div className="w-full mt-2 py-2.5 rounded-xl border border-brand-line bg-brand-neutral/50 text-center text-[11px] font-bold text-brand-ink">
                    View all activity
                  </div>
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-brand-line rounded-full" />
          </div>
        </div>

        {/* Bottom Call to Actions overlaid to match layout */}
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between mt-12 md:mt-[-40px] z-40 relative px-6 lg:px-10">

          <div className="text-center md:text-left max-w-sm mb-10 md:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold leading-[1.2] text-brand-ink">
              The ultimate enterprise <br /> platform is here.
            </h2>
            <div className="flex gap-3 mt-6 justify-center md:justify-start">
              <Button className="rounded-2xl h-12 px-6 shadow-md shadow-brand-primary/20" asChild>
                <Link to="/register">Get Started Now</Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3 max-w-xs text-center md:text-right">
            <p className="text-brand-secondary font-medium text-sm leading-relaxed">
              Secure onboarding. Seamless collaboration. <br className="hidden md:block" /> Goodbye tracking nightmares.
            </p>
          </div>

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
