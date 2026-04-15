import { ArrowRight, Building2, CheckCircle2, Globe, Mail, Menu, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

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

          <div className="hidden md:flex items-center gap-3">
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

          <div className="flex md:hidden items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-brand-soft text-brand-ink rounded-xl">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white/95 backdrop-blur border-l border-brand-line z-50">
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-brand-ink text-left font-bold tracking-tight">Levitica Enterprise</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6">
                  <a href="#home" className="text-lg font-semibold text-brand-ink hover:text-brand-primary transition-colors">Home</a>
                  <a href="#about" className="text-lg font-semibold text-brand-ink hover:text-brand-primary transition-colors">About Platform</a>
                  <a href="#contact" className="text-lg font-semibold text-brand-ink hover:text-brand-primary transition-colors">Contact Sales</a>
                  <div className="w-full h-[1px] bg-brand-line my-2" />
                  <Button className="w-full rounded-2xl bg-brand-primary justify-start px-4 h-12 text-[15px] font-semibold text-white shadow-md shadow-brand-primary/10" asChild>
                    <Link to="/register">Register Workspace</Link>
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl border-brand-line bg-white justify-start px-4 h-12 text-[15px] font-semibold text-brand-ink hover:bg-brand-soft" asChild>
                    <Link to="/login">Login Portal</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
            <ScrollArea className="flex-1 w-full bg-brand-neutral pt-16 pb-8 px-5">

              {/* Profile Header */}
              <div className="flex items-center justify-between mb-8 mt-1">
                <div className="flex items-center gap-3">
                  <Avatar className="size-11 border-2 border-white shadow-sm ring-1 ring-brand-line/50">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" />
                    <AvatarFallback className="bg-brand-primary text-white font-bold text-xs">AU</AvatarFallback>
                  </Avatar>
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
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-brand-line text-center transition-transform hover:scale-105 active:scale-95 duration-300">
                  <div className="size-10 mx-auto bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center mb-2">
                    <Building2 className="size-5" />
                  </div>
                  <p className="text-[11px] font-bold text-brand-ink">Companies</p>
                </div>
                <div className="bg-white rounded-[20px] p-4 shadow-sm border border-brand-line text-center transition-transform hover:scale-105 active:scale-95 duration-300">
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
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-brand-line/50 last:border-0 hover:bg-brand-neutral/30 px-2 rounded-xl transition-colors cursor-pointer">
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

                  <div className="w-full mt-2 py-2.5 rounded-xl border border-brand-line bg-brand-neutral/50 text-center text-[11px] font-bold text-brand-ink hover:bg-brand-neutral transition-colors cursor-pointer active:scale-[0.98]">
                    View all activity
                  </div>
                </div>
              </div>
            </ScrollArea>

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

      <section id="about" className="relative py-24 overflow-hidden">
        {/* Minimal Glow Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] opacity-60 mix-blend-multiply" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-brand-primary/5 blur-[120px] rounded-[100%] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 sm:mb-20">
            <div className="max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 backdrop-blur-sm">
                <div className="size-1.5 rounded-full bg-brand-primary animate-pulse" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                  System Architecture
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-ink leading-[1.1]">
                Designed for unified <br className="hidden sm:block" /> company collaboration.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-brand-secondary leading-relaxed">
              This landing flow focuses on company registration so new organizations can begin with
              validated workspace identity before deeper activation steps happen.
            </p>
          </div>

          {/* Futuristic Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">

            {/* Highlighted Architecture Card */}
            <div className="md:col-span-2 group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-white/50 p-8 sm:p-10 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-brand-primary/5 backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="flex flex-col h-full relative z-10">
                <div className="mb-16 flex justify-between items-start">
                  <div className="size-14 rounded-2xl bg-white shadow-sm border border-brand-line flex items-center justify-center text-brand-primary">
                    <Building2 className="size-6" />
                  </div>
                  <Sparkles className="size-5 text-brand-primary/40" />
                </div>

                <div className="mt-auto">
                  <h3 className="text-2xl font-bold text-brand-ink mb-4">Structured Hierarchy</h3>
                  <p className="text-sm sm:text-base text-brand-secondary leading-relaxed max-w-xl mb-6">
                    The platform supports super admins, company admins, and organization users in one strictly structured ecosystem. Built from the ground up for granular control across internal teams and external contractors, ensuring that authorization checks are handled safely.
                  </p>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 max-w-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-ink">Role-Based Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-ink">Audit Logging</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-ink">Custom Policies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-brand-primary" />
                      <span className="text-sm font-medium text-brand-ink">Multi-Tenant Logic</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-cards */}
            <div className="flex flex-col gap-4 lg:gap-6">
              <div className="flex-1 group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-white/50 p-8 transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-brand-primary/5 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="size-12 rounded-2xl bg-white shadow-sm border border-brand-line flex items-center justify-center text-brand-secondary mb-8">
                    <ShieldCheck className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink mb-2">Verified Identity</h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed mt-auto">
                    Domain-aware access keeps registrations aligned with workspace ownership.
                  </p>
                </div>
              </div>

              <div className="flex-1 group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-white/50 p-8 transition-all hover:bg-white/80 hover:shadow-lg hover:shadow-brand-primary/5 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="size-12 rounded-2xl bg-white shadow-sm border border-brand-line flex items-center justify-center text-brand-secondary mb-8">
                    <Globe className="size-5" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-ink mb-2">Infinite Scale</h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed mt-auto">
                    Scales efficiently from first registration through robust analytics and billing.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="register" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden">
        {/* Subtle background glow for the register section */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] items-center">
          <div className="space-y-6 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-primary/20 bg-brand-primary/5 backdrop-blur-sm">
              <div className="size-1.5 rounded-full bg-brand-primary animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">
                Workspace Creation
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-brand-ink leading-[1.1]">
              Register your workspace
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-brand-secondary">
              Submit your company details here. The company domain must be verified first, enabling secure and validated onboarding into your enterprise environment.
            </p>

            {/* Visual Steps animation */}
            <div className="pt-6 flex flex-col gap-4">
              <div className="flex items-center gap-4 group cursor-default">
                <div className="size-10 rounded-full bg-white border border-brand-line flex items-center justify-center text-brand-primary font-bold shadow-sm group-hover:scale-110 transition-transform duration-300">1</div>
                <p className="text-sm font-medium text-brand-ink group-hover:text-brand-primary transition-colors">Provide organization details</p>
              </div>
              <div className="w-[2px] h-6 bg-brand-line ml-[19px] -my-2" />
              <div className="flex items-center gap-4 group cursor-default">
                <div className="size-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-bold shadow-sm group-hover:scale-110 transition-transform duration-300">2</div>
                <p className="text-sm font-medium text-brand-ink group-hover:text-brand-primary transition-colors">Verify domain ownership</p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-white/60 p-8 sm:p-10 shadow-2xl shadow-brand-primary/5 backdrop-blur-xl transition-all duration-500 hover:shadow-brand-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative z-10 grid gap-6">

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-ink ml-1">Full Name</label>
                <Input
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Enter your full name"
                  className="h-14 rounded-2xl border-brand-line bg-white/70 shadow-sm focus-visible:ring-brand-primary/20 transition-all hover:bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-brand-ink ml-1">Company Details</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={form.companyName}
                    onChange={(event) => updateField("companyName", event.target.value)}
                    placeholder="Company name"
                    className="h-14 rounded-2xl border-brand-line bg-white/70 shadow-sm focus-visible:ring-brand-primary/20 transition-all hover:bg-white"
                  />
                  <Input
                    value={form.companyDomain}
                    onChange={(event) => updateField("companyDomain", event.target.value)}
                    placeholder="Domain (levitica.com)"
                    className="h-14 rounded-2xl border-brand-line bg-white/70 shadow-sm focus-visible:ring-brand-primary/20 transition-all hover:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-between min-h-[48px]">
                {!isDomainVerified ? (
                  <>
                    <p className="text-xs w-full text-brand-secondary text-left">
                      Verify domain to enable registration.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-12 rounded-2xl border-brand-line bg-white px-6 text-brand-ink hover:bg-brand-soft shadow-sm transition-all hover:scale-105 active:scale-95"
                      onClick={handleVerifyDomain}
                      disabled={isVerifying || !form.companyDomain}
                    >
                      {isVerifying ? "Verifying..." : "Verify domain"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex w-full items-center justify-between animate-in fade-in zoom-in duration-500">
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        {normalizedDomain} verified
                      </div>
                      <Button
                        type="submit"
                        className="w-full sm:w-auto h-12 rounded-2xl bg-brand-primary text-white hover:bg-brand-primary/90 px-8 shadow-lg shadow-brand-primary/20 transition-all hover:scale-105 active:scale-95"
                      >
                        Submit
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      <section id="contact" className="relative pb-32 pt-24 overflow-hidden">
        {/* Glow effect blending from previous sections */}
        <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-brand-primary/10 blur-[130px] rounded-full pointer-events-none z-10" />

        {/* Ambient Video Background */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/video.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-3 items-center">

            <div className="space-y-6 lg:col-span-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-line/60 bg-transparent shadow-sm">
                <Mail className="size-3.5 text-black" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">
                  Get in touch
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-black leading-[1.1]">
                Talk to the onboarding team
              </h2>
              <p className="text-sm sm:text-base text-black font-medium leading-relaxed max-w-md">
                Need enterprise pricing or have security questions? We are here to guide you through the process quickly.
              </p>
            </div>

            <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
              <a href="mailto:onboarding@levitica.com" className="group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-transparent p-8 transition-all duration-500 hover:bg-white/10 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-2 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Decorative border glow top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="size-14 rounded-2xl bg-white shadow-sm border border-brand-line flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 group-hover:text-brand-primary/80 transition-all duration-500 group-hover:shadow-brand-primary/20">
                    <Mail className="size-6" />
                  </div>
                  <div className="mt-auto w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-black mb-1 transition-colors">Email Us</p>
                      <ArrowRight className="size-4 text-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <p className="text-black text-sm font-medium">onboarding@levitica.com</p>
                  </div>
                </div>
              </a>

              <a href="tel:+919876543210" className="group relative overflow-hidden rounded-[32px] border border-brand-line/60 bg-transparent p-8 transition-all duration-500 hover:bg-white/10 hover:shadow-2xl hover:shadow-brand-primary/10 hover:-translate-y-2 cursor-pointer delay-75">
                <div className="absolute inset-0 bg-gradient-to-bl from-brand-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Decorative border glow top */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-start h-full">
                  <div className="size-14 rounded-2xl bg-white shadow-sm border border-brand-line flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 group-hover:text-brand-primary/80 transition-all duration-500 group-hover:shadow-brand-primary/20">
                    <Phone className="size-6" />
                  </div>
                  <div className="mt-auto w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-black mb-1 transition-colors">Call Support</p>
                      <ArrowRight className="size-4 text-black opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
                    </div>
                    <p className="text-black text-sm font-medium">+91 98765 43210</p>
                  </div>
                </div>
              </a>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
