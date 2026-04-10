import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/client";
import { TEAMS_CREATE, TEAMS_LIST, USERS_SEARCH, TEAMS_MEMBERS, TEAMS_ADD_MEMBER, TEAMS_ASSIGN_LEAD } from "@/config/api";
import { useAuthStore } from "@/store/auth-store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Users,
  Plus,
  Search,
  Settings,
  Shield,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  X,
  CheckCircle2,
  MoreHorizontal,
  Mail,
  Building2,
  Hash,
  LayoutDashboard,
  Loader2,
  AlertCircle
} from "lucide-react";
import { AdminLayout } from "../components/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Schemas
const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

const memberSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

const leadSchema = z.object({
  teamId: z.string().min(1, "Team ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

export function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'create', 'add-member', 'assign-lead'
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);
  const [isAssigningLead, setIsAssigningLead] = useState(false);
  const [assignLeadError, setAssignLeadError] = useState(null);
  const session = useAuthStore((state) => state.session);

  // Forms
  const teamForm = useForm({ resolver: zodResolver(teamSchema), defaultValues: { name: "", description: "" } });
  const memberForm = useForm({ resolver: zodResolver(memberSchema), defaultValues: { teamId: selectedTeam?.id || "", userId: "" } });
  const leadForm = useForm({ resolver: zodResolver(leadSchema), defaultValues: { teamId: selectedTeam?.id || "", userId: "" } });

  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(TEAMS_LIST, {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });

      const rawData = response.data;
      // The API returns { total_departments: X, departments: [...] }
      const teamsData = Array.isArray(rawData) ? rawData : (rawData?.departments || []);

      const transformedTeams = teamsData.map(team => ({
        id: team.id || team.team_id || team.uuid || `T-${Math.random().toString(36).substr(2, 5)}`,
        name: team.name || team.department_name || "Unnamed Team",
        description: team.description || team.dept_description || "",
        lead: team.lead || team.manager || team.manager_name || team.admin || team.dept_manager || "Unassigned",
        memberCount: team.member_count || team.total_users || 0
      }));

      setTeams(transformedTeams);
      if (transformedTeams.length > 0) {
        setSelectedTeam(transformedTeams[0]);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load teams");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [session?.accessToken]);

  useEffect(() => {
    if (selectedTeam) {
      memberForm.setValue("teamId", selectedTeam.id);
      leadForm.setValue("teamId", selectedTeam.id);
    }
  }, [selectedTeam, memberForm, leadForm]);

  const handleUserSearch = async (query) => {
    setUserSearchQuery(query);
    if (!query || query.length < 2) {
      setUserSearchResults([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const response = await apiClient.get(USERS_SEARCH, {
        params: { query: query },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      setUserSearchResults(Array.isArray(response.data) ? response.data : (response.data?.users || []));
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    if (!teamId) return;
    setIsMembersLoading(true);
    setMembersError(null);
    try {
      const response = await apiClient.get(TEAMS_MEMBERS(teamId), {
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      // Handle the nested structure and potential lead info in members response
      const data = response.data;
      const membersData = Array.isArray(data) ? data : (data.members || data.users || []);
      
      // If the members response contains a lead/admin field, prioritize it
      const remoteLead = data.lead || data.admin || data.manager || data.department_admin;
      if (remoteLead && selectedTeam?.id === teamId) {
        setSelectedTeam(prev => prev ? { ...prev, lead: remoteLead } : null);
      }
      
      setTeamMembers(membersData);
    } catch (err) {
      console.error("Error fetching members:", err);
      setMembersError("Failed to load members");
    } finally {
      setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam, session?.accessToken]);

  const onHandleCreateTeam = async (data) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const response = await apiClient.post(TEAMS_CREATE, null, {
        params: { name: data.name },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      const created = response.data;
      const newTeam = {
        id: created?.id ?? `T-${100 + teams.length + 1}`,
        name: created?.name ?? data.name,
        description: created?.description ?? data.description ?? "",
        lead: created?.lead ?? "Unassigned",
        memberCount: created?.member_count ?? 0,
      };
      setTeams((prev) => [...prev, newTeam]);
      setActiveModal(null);
      teamForm.reset();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        "Failed to create team. Please try again.";
      setCreateError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const onHandleAddMember = async (data) => {
    setIsAddingMember(true);
    setAddMemberError(null);
    try {
      await apiClient.post(TEAMS_ADD_MEMBER(data.teamId), null, {
        params: { user_id: data.userId },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      // Refresh members list and team count
      fetchTeamMembers(data.teamId);
      setTeams(teams.map(t => t.id === data.teamId ? { ...t, memberCount: t.memberCount + 1 } : t));
      if (selectedTeam?.id === data.teamId) {
        setSelectedTeam({ ...selectedTeam, memberCount: selectedTeam.memberCount + 1 });
      }
      
      setActiveModal(null);
      memberForm.reset();
    } catch (err) {
      console.error("Add member error:", err);
      setAddMemberError(err?.response?.data?.detail || "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  const onHandleAssignLead = async (data) => {
    setIsAssigningLead(true);
    setAssignLeadError(null);
    try {
      await apiClient.post(TEAMS_ASSIGN_LEAD(data.teamId), null, {
        params: { user_id: data.userId },
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      });
      
      // Refresh teams list to show new lead
      setTeams(teams.map(t => t.id === data.teamId ? { ...t, lead: data.userId } : t));
      if (selectedTeam?.id === data.teamId) {
        setSelectedTeam({ ...selectedTeam, lead: data.userId });
      }
      
      setActiveModal(null);
      leadForm.reset();
    } catch (err) {
      console.error("Assign lead error:", err);
      setAssignLeadError(err?.response?.data?.detail || "Failed to assign lead");
    } finally {
      setIsAssigningLead(false);
    }
  };

  return (
    <AdminLayout>
      <div className="fixed top-20 bottom-0 left-0 lg:left-[292px] right-0 bg-white z-[20] flex flex-row overflow-hidden border-t md:border-t-0 border-brand-line">

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-10 bg-brand-ink/20 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Teams List */}
        <aside className={cn(
          "absolute inset-y-0 left-0 z-20 w-72 flex-col border-r border-brand-line bg-brand-soft transform transition-transform duration-300 md:relative md:translate-x-0 md:flex",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-brand-ink">Teams</h2>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary"
                onClick={() => setActiveModal('create')}
              >
                <Plus className="size-5" />
              </Button>
            </div>

            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
              <input
                type="text"
                placeholder="Search teams..."
                className="w-full bg-white/50 border-brand-line/30 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="flex-1 px-4 overflow-y-auto pb-6 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.1)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-brand-ink/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand-ink/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-brand-secondary/40">
                <Loader2 className="size-8 animate-spin mb-4" />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Teams...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-red-500/60">
                <AlertCircle className="size-8 mb-4 opacity-40" />
                <p className="text-xs font-bold uppercase tracking-widest mb-1">Error Loading</p>
                <p className="text-[10px] font-medium leading-relaxed">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-brand-primary h-8"
                  onClick={fetchTeams}
                >
                  Try Again
                </Button>
              </div>
            ) : teams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-brand-secondary/40">
                <Users className="size-8 mb-4 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">No Teams Found</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-brand-primary h-8"
                  onClick={() => setActiveModal('create')}
                >
                  Create First Team
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsSidebarOpen(false);
                    }}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition-all duration-300",
                      selectedTeam?.id === team.id
                        ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]"
                        : "text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex size-9 items-center justify-center rounded-xl transition-colors",
                        selectedTeam?.id === team.id ? "bg-white/20" : "bg-brand-soft"
                      )}>
                        <Users className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[140px]">{team.name}</p>
                        <p className={cn(
                          "text-[10px] font-medium",
                          selectedTeam?.id === team.id ? "text-white/60" : "text-brand-secondary/60"
                        )}>{team.id}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "size-4 transition-transform duration-300",
                      selectedTeam?.id === team.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                    )} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex flex-1 flex-col bg-white overflow-hidden">
          <header className="flex h-16 md:h-20 shrink-0 items-center justify-between border-b border-brand-line px-4 md:px-10">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <LayoutDashboard className="size-5 text-brand-ink" />
              </Button>
              <div className="flex size-9 md:size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary hidden sm:flex">
                <Users className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-brand-ink truncate">
                  {selectedTeam ? selectedTeam.name : "Select a Team"}
                </h3>
                {selectedTeam && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary/50 truncate">Team ID: {selectedTeam.id}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedTeam}
                className="rounded-xl font-bold border-brand-line text-brand-ink hover:bg-brand-soft hidden sm:flex disabled:opacity-50"
                onClick={() => {
                  leadForm.setValue('teamId', selectedTeam.id);
                  setActiveModal('assign-lead');
                }}
              >
                <ShieldCheck className="md:mr-2 size-4 text-brand-primary" />
                <span className="hidden md:inline">Assign Lead</span>
              </Button>
              <Button
                size="sm"
                disabled={!selectedTeam}
                className="rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20 px-3 md:px-4 disabled:opacity-50"
                onClick={() => {
                  memberForm.setValue('teamId', selectedTeam.id);
                  setActiveModal('add-member');
                }}
              >
                <UserPlus className="sm:mr-2 size-4 shrink-0" />
                <span className="hidden sm:inline">Add Member</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={!selectedTeam}
                className="sm:hidden rounded-xl shrink-0 disabled:opacity-50"
                onClick={() => {
                  leadForm.setValue('teamId', selectedTeam.id);
                  setActiveModal('assign-lead');
                }}
              >
                <MoreHorizontal className="size-5 text-brand-secondary" />
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            {!selectedTeam ? (
              <div className="h-full flex flex-col items-center justify-center text-brand-secondary/40 p-10">
                <div className="size-20 bg-brand-soft rounded-[40px] flex items-center justify-center mb-6">
                  <Users className="size-10 opacity-20" />
                </div>
                <h4 className="text-xl font-bold text-brand-ink mb-2">Select a Team</h4>
                <p className="text-sm font-medium mb-8 max-w-xs text-center">Choose a team from the sidebar to view its members, leads, and configuration.</p>
                {teams.length === 0 && !isLoading && (
                  <Button
                    className="rounded-2xl bg-brand-primary px-8"
                    onClick={() => setActiveModal('create')}
                  >
                    <Plus className="mr-2 size-4" />
                    Create First Team
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-6 md:p-10 space-y-10">
                {/* Stats / Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-[28px] border border-brand-line bg-brand-neutral/30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Team Members</p>
                    <div className="mt-3 flex items-end justify-between">
                      <h4 className="text-2xl md:text-3xl font-extrabold text-brand-ink">{selectedTeam.memberCount}</h4>
                      <Users className="size-5 md:size-6 text-brand-primary/20 mb-1" />
                    </div>
                  </div>
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-[28px] border border-brand-line bg-brand-neutral/30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Team Lead</p>
                    <div className="mt-3 flex items-end justify-between">
                      <h4 className="text-base md:text-lg font-bold text-brand-ink truncate pr-2">{selectedTeam.lead}</h4>
                      <Shield className="size-5 md:size-6 text-brand-primary/20 mb-1" />
                    </div>
                  </div>
                  <div className="p-4 md:p-6 rounded-2xl md:rounded-[28px] border border-brand-line bg-brand-neutral/30">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Status</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <h4 className="text-base md:text-lg font-bold text-brand-ink uppercase tracking-wider">Active</h4>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {/* <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/40 ml-1">About the Team</h4>
                  <div className="p-5 md:p-8 rounded-2xl md:rounded-[32px] border border-brand-line bg-white shadow-sm">
                    <p className="text-brand-ink leading-relaxed font-medium text-sm md:text-base">
                      {selectedTeam.description || "No description provided for this team."}
                    </p>
                  </div>
                </div> */}

                {/* Members List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Members List</h4>
                    <span className="text-[10px] font-bold text-brand-primary underline cursor-pointer">View All</span>
                  </div>
                  
                  {isMembersLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-brand-secondary/40">
                      <Loader2 className="size-6 animate-spin mb-4" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Loading Members...</p>
                    </div>
                  ) : membersError ? (
                    <div className="p-8 rounded-2xl border border-dashed border-red-100 bg-red-50/30 text-center">
                      <p className="text-xs font-bold text-red-500/60 uppercase tracking-widest">{membersError}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-brand-primary h-8"
                        onClick={() => fetchTeamMembers(selectedTeam.id)}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="p-12 rounded-2xl border border-dashed border-brand-line bg-brand-soft/20 text-center">
                      <Users className="size-8 mx-auto mb-4 opacity-10 text-brand-ink" />
                      <p className="text-xs font-bold text-brand-secondary/40 uppercase tracking-widest">No members in this team</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((member, i) => {
                        const isLead = 
                          member.is_admin || 
                          member.is_lead ||
                          (selectedTeam.lead && (
                            member.id === selectedTeam.lead || 
                            member.user_id === selectedTeam.lead || 
                            member.email === selectedTeam.lead ||
                            member.username === selectedTeam.lead ||
                            member.name === selectedTeam.lead
                          )) || 
                          member.role === 'LEAD' || 
                          member.role === 'TEAM_LEAD' ||
                          member.role === 'ADMIN';

                        return (
                          <div key={member.id || i} className="flex items-center justify-between p-4 rounded-2xl border border-brand-line bg-white hover:border-brand-primary/30 transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="size-10 rounded-xl bg-brand-soft flex items-center justify-center font-bold text-brand-primary uppercase">
                                {(member.name || member.username || "U")[0]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-brand-ink leading-none">{member.name || member.username || "Member"}</p>
                                  {isLead && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 animate-in fade-in zoom-in duration-300">
                                      Team Lead
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-brand-secondary mt-1">{member.email || member.user_id || `User ${i + 1}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-soft px-2 py-1 rounded-md text-brand-secondary/70 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isLead ? "Lead" : (member.role || "Member")}
                              </span>
                              <Button variant="ghost" size="icon" className="text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ScrollArea>
        </main>
      </div>

      {/* Modals */}

      {/* Create Team Modal */}
      <Dialog
        open={activeModal === 'create'}
        onOpenChange={(open) => {
          if (!open) {
            setActiveModal(null);
            setCreateError(null);
            teamForm.reset();
          }
        }}
      >
        <DialogContent className="rounded-3xl md:rounded-[32px] border-none bg-white p-0 shadow-2xl w-[95vw] max-w-lg">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-brand-ink">Create a Team</DialogTitle>
            <DialogDescription className="text-brand-secondary font-medium">
              Organize your workforce into cohesive units to manage access and collaboration.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={teamForm.handleSubmit(onHandleCreateTeam)} className="px-8 pb-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-brand-ink font-bold ml-1">Team Name</Label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                <Input
                  placeholder="e.g. Design Systems"
                  className="pl-11 h-12 bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20"
                  disabled={isCreating}
                  {...teamForm.register("name")}
                />
              </div>
              {teamForm.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{teamForm.formState.errors.name.message}</p>
              )}
            </div>
            {createError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                {createError}
              </p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCreating ? "Creating..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={activeModal === 'add-member'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="rounded-3xl md:rounded-[32px] border-none bg-white p-0 shadow-2xl w-[95vw] max-w-md">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-brand-ink text-center">Add Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={memberForm.handleSubmit(onHandleAddMember)} className="px-8 pb-8 space-y-6 text-center">
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label className="text-brand-ink font-bold ml-1">Team ID</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input
                    disabled
                    className="pl-11 h-12 bg-brand-soft/50 border-0 rounded-2xl font-bold text-brand-ink/50 cursor-not-allowed"
                    {...memberForm.register("teamId")}
                  />
                </div>
              </div>
              <div className="space-y-2 text-left relative">
                <Label className="text-brand-ink font-bold ml-1">User ID / Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input
                    placeholder="Enter user unique identifier"
                    className="pl-11 h-12 bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20"
                    onChange={(e) => {
                      memberForm.setValue("userId", e.target.value);
                      handleUserSearch(e.target.value);
                    }}
                    value={memberForm.watch("userId")}
                    disabled={isAddingMember}
                  />
                  {isSearchingUsers && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-primary/40" />
                  )}
                </div>
                {memberForm.formState.errors.userId && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{memberForm.formState.errors.userId.message}</p>}
                {addMemberError && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{addMemberError}</p>}

                {/* Search Results Dropdown */}
                {userSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white rounded-2xl border border-brand-line shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ScrollArea className="max-h-[220px]">
                      <div className="p-2 space-y-1">
                        {userSearchResults.map((user) => (
                          <button
                            key={user.id || user._id}
                            type="button"
                            onClick={() => {
                              memberForm.setValue("userId", user.id || user.email || user.username);
                              setUserSearchResults([]);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-soft transition-colors text-left group"
                          >
                            <div className="size-8 rounded-lg bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary text-xs">
                              {(user.name || user.username || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-brand-ink group-hover:text-brand-primary transition-colors">{user.name || user.username}</p>
                              <p className="text-[10px] text-brand-secondary">{user.email || user.id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isAddingMember}
              className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isAddingMember ? "Adding..." : "Add to Team"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Lead Modal */}
      <Dialog open={activeModal === 'assign-lead'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="rounded-3xl md:rounded-[32px] border-none bg-white p-0 shadow-2xl w-[95vw] max-w-md">
          <DialogHeader className="px-8 pt-8 pb-4">
            <DialogTitle className="text-2xl font-bold text-brand-ink text-center">Assign Team Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={leadForm.handleSubmit(onHandleAssignLead)} className="px-8 pb-8 space-y-6 text-center">
            <div className="p-4 bg-brand-soft rounded-2xl flex items-center gap-4 text-left">
              <div className="size-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">L</div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-brand-ink">Leadership Access</h4>
                <p className="text-[10px] text-brand-secondary">Team leads can manage members and settings.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <Label className="text-brand-ink font-bold ml-1">Team ID</Label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input
                    disabled
                    className="pl-11 h-12 bg-brand-soft/50 border-0 rounded-2xl font-bold text-brand-ink/50 cursor-not-allowed"
                    {...leadForm.register("teamId")}
                  />
                </div>
              </div>
              <div className="space-y-2 text-left relative">
                <Label className="text-brand-ink font-bold ml-1">User ID / Name</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input
                    placeholder="Enter user unique identifier"
                    className="pl-11 h-12 bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20"
                    onChange={(e) => {
                      leadForm.setValue("userId", e.target.value);
                      handleUserSearch(e.target.value);
                    }}
                    value={leadForm.watch("userId")}
                    disabled={isAssigningLead}
                  />
                  {isSearchingUsers && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 size-4 animate-spin text-brand-primary/40" />
                  )}
                </div>
                {leadForm.formState.errors.userId && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{leadForm.formState.errors.userId.message}</p>}
                {assignLeadError && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{assignLeadError}</p>}

                {/* Search Results Dropdown */}
                {userSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-white rounded-2xl border border-brand-line shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ScrollArea className="max-h-[220px]">
                      <div className="p-2 space-y-1">
                        {userSearchResults.map((user) => (
                          <button
                            key={user.id || user._id}
                            type="button"
                            onClick={() => {
                              leadForm.setValue("userId", user.id || user.email || user.username);
                              setUserSearchResults([]);
                            }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-soft transition-colors text-left group"
                          >
                            <div className="size-8 rounded-lg bg-brand-primary/10 flex items-center justify-center font-bold text-brand-primary text-xs">
                              {(user.name || user.username || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-brand-ink group-hover:text-brand-primary transition-colors">{user.name || user.username}</p>
                              <p className="text-[10px] text-brand-secondary">{user.email || user.id}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={isAssigningLead}
              className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {isAssigningLead ? "Assigning..." : "Set as Team Lead"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
