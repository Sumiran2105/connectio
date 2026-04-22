import { useNavigate } from "react-router-dom";
import { Bot, Calendar, FileText, MessageCircle, Users2, Video } from "lucide-react";

import { UserLayout } from "../components/user-layout";

const actions = [
  {
    title: "Start a chat",
    description: "Jump into direct messages and team conversations.",
    icon: MessageCircle,
    route: "/user/dashboard/chat",
  },
  {
    title: "Join a meet",
    description: "Open your next scheduled meeting or start one instantly.",
    icon: Video,
    route: "/user/dashboard/meet",
  },
  {
    title: "Review files",
    description: "Access shared documents, uploads, and workspace resources.",
    icon: FileText,
    route: "/user/dashboard/files",
  },
  {
    title: "Check calendar",
    description: "See events, deadlines, and collaboration schedules.",
    icon: Calendar,
    route: "/user/dashboard/calendar",
  },
  {
    title: "Open teams",
    description: "Move between teams, channels, and collaboration groups.",
    icon: Users2,
    route: "/user/dashboard/teams",
  },
  {
    title: "Use AI",
    description: "Get summaries, assistance, and productivity support.",
    icon: Bot,
    route: "/user/dashboard/ai",
  },
];

export function UserDashboardPage() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <section className="rounded-[32px] border border-brand-line bg-white p-7 shadow-[0_24px_80px_rgba(68,83,74,0.08)] sm:p-8">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-brand-secondary">
              User Workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-brand-ink">
              Welcome to your collaboration workspace
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-brand-secondary">
              This is a starter user dashboard shell with the same structural idea as
              the admin side. We can now grow dedicated pages for chat, meetings,
              channels, teams, files, calendar, and AI on top of this layout.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {actions.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                onClick={() => navigate(item.route)}
                className="cursor-pointer rounded-[24px] border border-brand-line bg-brand-neutral p-5 transition-all duration-200 hover:border-brand-primary hover:bg-white hover:shadow-md"
              >
                <Icon className="mb-4 size-5 text-brand-primary" />
                <h2 className="text-base font-semibold text-brand-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-brand-secondary">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </UserLayout>
  );
}
