import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  Hash,
  Search,
  ShieldCheck,
  SquarePen,
  Users2,
} from "lucide-react";

import { TEAMS_MY_TEAMS } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";
import { ChatAvatar } from "../components/chat-avatar";
import { UserLayout } from "../components/user-layout";

function normalizeTeams(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.teams)) {
    return data.teams;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function buildTeamView(team, index) {
  const name = team?.name || team?.team_name || `Team ${index + 1}`;
  const description =
    team?.description ||
    team?.purpose ||
    team?.about ||
    "No team description available yet.";
  const members =
    team?.members_count ||
    team?.member_count ||
    team?.members?.length ||
    team?.users_count ||
    0;
  const channels =
    team?.channels_count ||
    team?.channel_count ||
    team?.channels?.length ||
    0;
  const role = team?.role || team?.user_role || team?.membership_role || "Member";

  return {
    id: team?.id || team?.team_id || `${name}-${index}`,
    name,
    description,
    members,
    channels,
    role,
    memberLabel: `${members} members`,
    channelLabel: `${channels} channels`,
  };
}

function TeamSidebarItem({ team, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
        isActive
          ? "border-brand-primary/20 bg-white shadow-sm"
          : "border-transparent bg-transparent hover:border-gray-200 hover:bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <ChatAvatar name={team.name} size="size-11" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="truncate text-sm font-semibold text-gray-900">{team.name}</p>
            <span className="shrink-0 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-primary">
              {team.role}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{team.description}</p>
        </div>
      </div>
    </button>
  );
}

function TeamMetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <Icon className="size-4" />
        <p className="text-[11px] font-bold uppercase tracking-[0.22em]">{label}</p>
      </div>
      <p className="mt-4 text-3xl font-semibold text-gray-950">{value}</p>
    </div>
  );
}

export function TeamsPage() {
  const session = useAuthStore((state) => state.session);
  const [search, setSearch] = useState("");
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const teamsQuery = useQuery({
    queryKey: ["my-teams", session?.accessToken],
    queryFn: async () => {
      const response = await apiClient.get(TEAMS_MY_TEAMS, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      return normalizeTeams(response.data).map(buildTeamView);
    },
    enabled: Boolean(session?.accessToken),
    staleTime: 30 * 1000,
  });

  const teams = teamsQuery.data || [];

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return teams;
    }

    return teams.filter(
      (team) =>
        team.name.toLowerCase().includes(query) ||
        team.description.toLowerCase().includes(query) ||
        team.role.toLowerCase().includes(query)
    );
  }, [search, teams]);

  const activeTeam =
    filteredTeams.find((team) => team.id === activeTeamId) ||
    teams.find((team) => team.id === activeTeamId) ||
    filteredTeams[0] ||
    teams[0] ||
    null;

  useEffect(() => {
    if (!activeTeamId && teams[0]) {
      setActiveTeamId(teams[0].id);
    }
  }, [activeTeamId, teams]);

  function openTeam(team) {
    setActiveTeamId(team.id);
    setIsMobilePanelOpen(true);
  }

  return (
    <UserLayout
      showFloatingActions={false}
      contentClassName="overflow-hidden px-0 py-0 sm:px-0 lg:px-0 lg:py-0"
      contentInnerClassName="max-w-none h-full"
    >
      <div className="flex h-[calc(100vh-5rem)] min-h-[640px] w-full overflow-hidden bg-white">
        <aside
          className={`shrink-0 flex-col border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white ${
            isMobilePanelOpen ? "hidden sm:flex" : "flex w-full sm:w-[22rem]"
          }`}
        >
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-gray-950">Teams</h2>
                <p className="mt-1 text-sm text-gray-500">Your team memberships</p>
              </div>
              <button
                type="button"
                className="rounded-2xl border border-gray-200 bg-white p-2.5 text-gray-700 shadow-sm transition hover:border-brand-primary/30 hover:text-brand-primary"
                aria-label="Teams workspace"
                title="Teams workspace"
              >
                <SquarePen className="size-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.15)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
            <div className="px-6 py-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                  Your teams
                </h3>
                <span className="text-xs font-medium text-gray-400">{teams.length}</span>
              </div>

              <div className="space-y-2">
                {teamsQuery.isLoading ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    Loading your teams...
                  </div>
                ) : null}

                {teamsQuery.isError ? (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-sm text-rose-600">
                    Unable to load your teams right now.
                  </div>
                ) : null}

                {!teamsQuery.isLoading && !teamsQuery.isError && !filteredTeams.length ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-4 text-sm text-gray-500">
                    No teams matched this search.
                  </div>
                ) : null}

                {filteredTeams.map((team) => (
                  <TeamSidebarItem
                    key={team.id}
                    team={team}
                    isActive={activeTeam?.id === team.id}
                    onClick={() => openTeam(team)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col bg-white ${
            isMobilePanelOpen ? "flex" : "hidden sm:flex"
          }`}
        >
          {activeTeam ? (
            <>
              <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setIsMobilePanelOpen(false)}
                      className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 sm:hidden"
                    >
                      <ChevronLeft className="size-5" />
                    </button>
                    <ChatAvatar name={activeTeam.name} size="size-11" />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-gray-950">{activeTeam.name}</h3>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                        {activeTeam.role}
                      </p>
                    </div>
                  </div>
                </div>
              </header>

              <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-6 py-3">
                <div className="flex items-center gap-6">
                  {["overview", "members", "channels"].map((tab) => (
                    <span
                      key={tab}
                      className={`border-b-2 pb-2 text-sm font-medium capitalize ${
                        tab === "overview"
                          ? "border-brand-primary text-brand-primary"
                          : "border-transparent text-gray-600"
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/60 px-4 py-6 sm:px-6 [scrollbar-width:thin]">
            {!activeTeam ? (
              <div className="flex min-h-[420px] h-full flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-soft text-brand-primary">
                  <Users2 className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-950">Select a team</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Pick a team from the left to explore its membership and channel footprint.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                    Team profile
                  </p>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
                    {activeTeam.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <TeamMetricCard icon={Users2} label="Members" value={activeTeam.members} />
                  <TeamMetricCard icon={Hash} label="Channels" value={activeTeam.channels} />
                  <TeamMetricCard icon={ShieldCheck} label="Role" value={activeTeam.role} />
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                  <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                      Workspace summary
                    </p>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">People collaboration</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {activeTeam.memberLabel} currently belong to this team space.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">Channel structure</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {activeTeam.channelLabel} are connected to this team for collaboration.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">Your access</p>
                        <p className="mt-1 text-sm text-gray-500">
                          You currently participate in this team as a <span className="font-medium text-gray-700">{activeTeam.role}</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <aside className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-gray-400">
                      Snapshot
                    </p>
                    <div className="mt-5 space-y-4">
                      <div className="rounded-2xl border border-gray-200 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                          Membership
                        </p>
                        <p className="mt-2 text-base font-semibold text-gray-950">{activeTeam.memberLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                          Channels available
                        </p>
                        <p className="mt-2 text-base font-semibold text-gray-950">{activeTeam.channelLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-gray-200 px-4 py-4">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">
                          Role
                        </p>
                        <p className="mt-2 text-base font-semibold text-brand-primary">{activeTeam.role}</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </UserLayout>
  );
}
