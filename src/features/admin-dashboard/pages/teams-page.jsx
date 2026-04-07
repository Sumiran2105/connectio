import React, { useState, useEffect } from "react";
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
  LayoutDashboard
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
  const [teams, setTeams] = useState([
    { id: "T-101", name: "Engineering Core", description: "Backend and infrastructure team", lead: "Alex Rivera", memberCount: 12 },
    { id: "T-102", name: "Product Design", description: "UI/UX and product strategy", lead: "Sarah J.", memberCount: 5 },
    { id: "T-103", name: "Marketing Ops", description: "Growth and retention campaigns", lead: "Marcus Wright", memberCount: 8 },
  ]);

  const [selectedTeam, setSelectedTeam] = useState(teams[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'create', 'add-member', 'assign-lead'

  // Forms
  const teamForm = useForm({ resolver: zodResolver(teamSchema), defaultValues: { name: "", description: "" } });
  const memberForm = useForm({ resolver: zodResolver(memberSchema), defaultValues: { teamId: selectedTeam.id, userId: "" } });
  const leadForm = useForm({ resolver: zodResolver(leadSchema), defaultValues: { teamId: selectedTeam.id, userId: "" } });
  
  useEffect(() => {
    if (selectedTeam) {
      memberForm.setValue("teamId", selectedTeam.id);
      leadForm.setValue("teamId", selectedTeam.id);
    }
  }, [selectedTeam, memberForm, leadForm]);

  const onHandleCreateTeam = (data) => {
    const newTeam = {
      id: `T-${100 + teams.length + 1}`,
      name: data.name,
      description: data.description,
      lead: "Unassigned",
      memberCount: 0
    };
    setTeams([...teams, newTeam]);
    setActiveModal(null);
    teamForm.reset();
  };

  const onHandleAddMember = (data) => {
    console.log("Adding member:", data);
    setTeams(teams.map(t => t.id === data.teamId ? { ...t, memberCount: t.memberCount + 1 } : t));
    if (selectedTeam.id === data.teamId) {
      setSelectedTeam({ ...selectedTeam, memberCount: selectedTeam.memberCount + 1 });
    }
    setActiveModal(null);
    memberForm.reset();
  };

  const onHandleAssignLead = (data) => {
    console.log("Assigning lead:", data);
    setTeams(teams.map(t => t.id === data.teamId ? { ...t, lead: data.userId } : t));
    if (selectedTeam.id === data.teamId) {
      setSelectedTeam({ ...selectedTeam, lead: data.userId });
    }
    setActiveModal(null);
    leadForm.reset();
  };

  return (
    <AdminLayout>
      <div className="flex h-[calc(100vh-180px)] min-h-[600px] overflow-hidden rounded-[32px] border border-brand-line bg-white shadow-[0_32px_120px_rgba(68,83,74,0.12)] relative">
        
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-10 bg-brand-ink/10 backdrop-blur-[2px] md:hidden"
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

          <ScrollArea className="flex-1 px-4">
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
                    selectedTeam.id === team.id
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-[1.02]"
                      : "text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex size-9 items-center justify-center rounded-xl transition-colors",
                      selectedTeam.id === team.id ? "bg-white/20" : "bg-brand-soft"
                    )}>
                      <Users className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[140px]">{team.name}</p>
                      <p className={cn(
                        "text-[10px] font-medium",
                        selectedTeam.id === team.id ? "text-white/60" : "text-brand-secondary/60"
                      )}>{team.id}</p>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "size-4 transition-transform duration-300",
                    selectedTeam.id === team.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"
                  )} />
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Content Area */}
        <main className="flex flex-1 flex-col bg-white">
          <header className="flex h-20 items-center justify-between border-b border-brand-line px-6 md:px-10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <LayoutDashboard className="size-5 text-brand-ink" />
              </Button>
              <div className="flex size-10 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-ink">{selectedTeam.name}</h3>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary/50">Team ID: {selectedTeam.id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="rounded-xl font-bold border-brand-line text-brand-ink hover:bg-brand-soft"
                onClick={() => {
                  leadForm.setValue('teamId', selectedTeam.id);
                  setActiveModal('assign-lead');
                }}
              >
                <ShieldCheck className="mr-2 size-4 text-brand-primary" />
                Assign Lead
              </Button>
              <Button 
                className="rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/20"
                onClick={() => {
                  memberForm.setValue('teamId', selectedTeam.id);
                  setActiveModal('add-member');
                }}
              >
                <UserPlus className="mr-2 size-4" />
                Add Member
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-6 md:p-10 space-y-10">
              {/* Stats / Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[28px] border border-brand-line bg-brand-neutral/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Team Members</p>
                  <div className="mt-3 flex items-end justify-between">
                    <h4 className="text-3xl font-extrabold text-brand-ink">{selectedTeam.memberCount}</h4>
                    <Users className="size-6 text-brand-primary/20 mb-1" />
                  </div>
                </div>
                <div className="p-6 rounded-[28px] border border-brand-line bg-brand-neutral/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Team Lead</p>
                  <div className="mt-3 flex items-end justify-between">
                    <h4 className="text-lg font-bold text-brand-ink truncate pr-2">{selectedTeam.lead}</h4>
                    <Shield className="size-6 text-brand-primary/20 mb-1" />
                  </div>
                </div>
                <div className="p-6 rounded-[28px] border border-brand-line bg-brand-neutral/30">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Status</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <h4 className="text-lg font-bold text-brand-ink uppercase tracking-wider">Active</h4>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/40 ml-1">About the Team</h4>
                <div className="p-8 rounded-[32px] border border-brand-line bg-white shadow-sm">
                  <p className="text-brand-ink leading-relaxed font-medium">
                    {selectedTeam.description || "No description provided for this team."}
                  </p>
                </div>
              </div>

              {/* Members Mock List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-brand-secondary/40">Members List</h4>
                  <span className="text-[10px] font-bold text-brand-primary underline cursor-pointer">View All</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-brand-line bg-white hover:border-brand-primary/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-brand-soft flex items-center justify-center font-bold text-brand-primary">
                          {String.fromCharCode(64 + i)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-ink leading-none">Member User {i}</p>
                          <p className="text-[11px] text-brand-secondary mt-1">user_00{i}@company.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-soft px-2 py-1 rounded-md text-brand-secondary/70 opacity-0 group-hover:opacity-100 transition-opacity">Developer</span>
                        <Button variant="ghost" size="icon" className="text-brand-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>

      {/* Modals */}
      
      {/* Create Team Modal */}
      <Dialog open={activeModal === 'create'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="rounded-[32px] border-none bg-white p-0 shadow-2xl max-w-lg">
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
                  {...teamForm.register("name")}
                />
              </div>
              {teamForm.formState.errors.name && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{teamForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-brand-ink font-bold ml-1">Description</Label>
              <Textarea 
                placeholder="What will this team focus on?" 
                className="bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20 min-h-[100px] p-4"
                {...teamForm.register("description")}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20">
                Create Team
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={activeModal === 'add-member'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="rounded-[32px] border-none bg-white p-0 shadow-2xl max-w-md">
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
              <div className="space-y-2 text-left">
                <Label className="text-brand-ink font-bold ml-1">User ID / Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input 
                    placeholder="Enter user unique identifier" 
                    className="pl-11 h-12 bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20"
                    {...memberForm.register("userId")}
                  />
                </div>
                {memberForm.formState.errors.userId && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{memberForm.formState.errors.userId.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20">
              Add to Team
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Lead Modal */}
      <Dialog open={activeModal === 'assign-lead'} onOpenChange={(open) => !open && setActiveModal(null)}>
        <DialogContent className="rounded-[32px] border-none bg-white p-0 shadow-2xl max-w-md">
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
              <div className="space-y-2 text-left">
                <Label className="text-brand-ink font-bold ml-1">User ID / Name</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                  <Input 
                    placeholder="Enter user unique identifier" 
                    className="pl-11 h-12 bg-brand-neutral/50 border-0 rounded-2xl focus:ring-brand-primary/20"
                    {...leadForm.register("userId")}
                  />
                </div>
                {leadForm.formState.errors.userId && <p className="text-xs text-red-500 mt-1 ml-1 font-bold">{leadForm.formState.errors.userId.message}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full h-12 rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg shadow-brand-primary/20">
              Set as Team Lead
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
}
