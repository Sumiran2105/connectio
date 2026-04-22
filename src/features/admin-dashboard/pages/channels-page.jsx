import { AddMemberDialog, ChannelSettingsDialog, DeleteChannelDialog, MembersDialog, } from "./channels/channel-dialogs";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Hash,
  Plus,
  Search,
  Settings,
  Users,
  Globe,
  Lock,
  PlusCircle,
  Smile,
  Image as ImageIcon,
  Paperclip,
  Send,
  Trash2,
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
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/client";
import { CHANNELS_CREATE, CHANNELS_LIST, CHANNELS_DELETE, TEAMS_LIST, CHANNEL_MEMBERS, CHANNEL_MEMBERS_BULK, TEAMS_MEMBERS, CHANNEL_UPDATE, USERS_SEARCH, COMPANY_USERS } from "@/config/api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
 
import {
  DEFAULT_VALUES,
  channelSchema,
  getTeamCompanyId,
  getUserEmail,
  getUserId,
  getUserName,
  getUserRecord,
} from "./channels/channel-utils";

export function ChannelsPage() {
  const [teams, setTeams] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isFetchingTeamMembers, setIsFetchingTeamMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [memberRole, setMemberRole] = useState("user");
  const [addMemberSource, setAddMemberSource] = useState("team");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  const [isMembersPanelOpen, setIsMembersPanelOpen] = useState(false);
  const [channelMembers, setChannelMembers] = useState([]);
  const [isFetchingChannelMembers, setIsFetchingChannelMembers] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingChannel, setIsDeletingChannel] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const session = useAuthStore((state) => state.session);
  const token = session?.accessToken;

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get(TEAMS_LIST, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const rawData = response.data;
        const teamDataRaw = Array.isArray(rawData) ? rawData : (rawData?.departments || rawData?.items || []);

        const transformedTeams = teamDataRaw.map(team => ({
          ...team,
          id: team.id || team.team_id || team.uuid || team.department_id,
          name: team.name || team.department_name || "Unnamed Team"
        }));

        setTeams(transformedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    if (token) fetchTeams();
  }, [token]);

  React.useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(CHANNELS_LIST, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const channelData = Array.isArray(response.data) ? response.data : (response.data?.items || []);
        setChannels(channelData);
        if (channelData.length > 0) {
          setSelectedChannel(channelData[0]);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchChannels();
  }, [token]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
    },
  });

  const selectedTeamId = watch("team_id");
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  // Sync company_id in form when session changes
  React.useEffect(() => {
    const resolvedCompanyId = session?.company_id || getTeamCompanyId(selectedTeam);
    if (resolvedCompanyId) {
      setValue("company_id", resolvedCompanyId, { shouldValidate: true });
    }
  }, [session, selectedTeam, setValue]);

  React.useEffect(() => {
    if (!teams.length) return;
    if (!selectedTeamId) {
      setValue("team_id", teams[0].id, { shouldValidate: true });
    }
  }, [teams, selectedTeamId, setValue]);

  React.useEffect(() => {
    if (!isDialogOpen) return;
    reset({
      ...DEFAULT_VALUES,
      company_id: session?.company_id || getTeamCompanyId(teams[0]) || "",
      team_id: teams[0]?.id || "",
    });
  }, [isDialogOpen, reset, session?.company_id, teams]);

  const onSubmit = async (data) => {
    try {
      // Final data preparation
      const payload = {
        ...data,
        is_private: data.visibility === "private" || data.is_private,
        parent_channel_id: data.parent_channel_id || null,
      };

      console.log("Submitting channel creation payload:", payload);

      const response = await apiClient.post(CHANNELS_CREATE, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      console.log("Channel creation successful:", response.data);

      const newChannel = response.data;
      setChannels(prev => [...prev, newChannel]);
      setSelectedChannel(newChannel);

      setIsDialogOpen(false);
      reset({
        ...DEFAULT_VALUES,
        company_id: session?.company_id || "",
        team_id: teams[0]?.id || "",
      });
      toast.success("Channel created successfully!");
    } catch (error) {
      console.error("Critical error in channel creation:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Failed to create channel. Please check your inputs and try again.";
      toast.error(errorMessage);
    }
  };

  const onInvalidSubmit = (invalidErrors) => {
    console.error("Channel form validation blocked submit:", invalidErrors);

    const firstErrorMessage =
      invalidErrors.team_id?.message ||
      invalidErrors.company_id?.message ||
      invalidErrors.name?.message ||
      invalidErrors.slug?.message ||
      "Please fill all required channel details before creating the channel.";

    toast.error(firstErrorMessage);
  };

  // Fetch team members when the add-people dialog opens
  const openAddMemberDialog = async (source = "team") => {
    if (!selectedChannel) return;
    const teamId = selectedChannel.team_id;
    setAddMemberError("");
    setMemberSearchQuery("");
    setSelectedMemberIds(new Set());
    setMemberRole("user");
    setAddMemberSource(source);
    setTeamMembers([]);
    setIsAddMemberDialogOpen(true);

    if (source === "other") {
      return;
    }

    if (!teamId) {
      setAddMemberError("This channel has no associated team. Cannot load members.");
      return;
    }

    setIsFetchingTeamMembers(true);
    try {
      const response = await apiClient.get(TEAMS_MEMBERS(teamId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const raw = response.data;
      const members = Array.isArray(raw)
        ? raw
        : raw?.members || raw?.items || raw?.users || [];
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setAddMemberError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Failed to load team members."
      );
    } finally {
      setIsFetchingTeamMembers(false);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  React.useEffect(() => {
    if (!isAddMemberDialogOpen || addMemberSource !== "other") return;

    const query = memberSearchQuery.trim();
    setSelectedMemberIds(new Set());
    setAddMemberError("");

    if (query.length < 2) {
      setTeamMembers([]);
      return;
    }

    let isActive = true;
    const timeout = window.setTimeout(async () => {
      setIsFetchingTeamMembers(true);
      try {
        const response = await apiClient.get(USERS_SEARCH, {
          params: { query },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!isActive) return;

        const raw = response.data;
        const users = Array.isArray(raw) ? raw : raw?.users || raw?.items || raw?.results || [];
        setTeamMembers(users);
      } catch (error) {
        if (!isActive) return;
        console.error("Error searching users:", error);
        setTeamMembers([]);
        setAddMemberError(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to search users."
        );
      } finally {
        if (isActive) setIsFetchingTeamMembers(false);
      }
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [addMemberSource, isAddMemberDialogOpen, memberSearchQuery, token]);

  const handleAddMembers = async () => {
    if (!selectedChannel?.id || selectedMemberIds.size === 0) return;
    setIsAddingMember(true);
    setAddMemberError("");

    const ids = Array.from(selectedMemberIds);

    try {
      if (ids.length === 1) {
        // Single member — use individual endpoint
        await apiClient.post(
          CHANNEL_MEMBERS(selectedChannel.id),
          { user_id: ids[0], role: memberRole },
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      } else {
        // Multiple members — bulk endpoint expects a plain array of user ID strings
        await apiClient.post(
          CHANNEL_MEMBERS_BULK(selectedChannel.id),
          ids, // ["uuid1", "uuid2", ...]
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
      }

      setIsAddMemberDialogOpen(false);
      setSelectedMemberIds(new Set());
      setMemberRole("user");
      toast.success(
        ids.length === 1
          ? "Member added to channel successfully."
          : `${ids.length} members added to channel successfully.`
      );
    } catch (error) {
      console.error("Error adding members to channel:", error);
      const detail = error.response?.data?.detail;
      // FastAPI returns detail as an array of validation errors
      const message =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail)
          ? detail.map((d) => d?.msg || JSON.stringify(d)).join("; ")
          : error.response?.data?.message ||
            "Failed to add members to channel.";
      setAddMemberError(message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!selectedChannel?.id) return;
    setIsDeletingChannel(true);
    try {
      await apiClient.delete(CHANNELS_DELETE(selectedChannel.id), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setChannels(prev => prev.filter(c => c.id !== selectedChannel.id));
      setSelectedChannel(null);
      setIsDeleteDialogOpen(false);
      toast.success("Channel deleted.");
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to delete channel.");
    } finally {
      setIsDeletingChannel(false);
    }
  };

  // Open members panel and fetch channel members
  const openMembersPanel = async () => {
    if (!selectedChannel?.id) return;
    setChannelMembers([]);
    setIsMembersPanelOpen(true);
    setIsFetchingChannelMembers(true);
    try {
      console.debug("openMembersPanel: fetching members for channel", selectedChannel.id);
      // Fetch channel membership records (user_id + role only)
      const settled = await Promise.allSettled([
        apiClient.get(CHANNEL_MEMBERS(selectedChannel.id), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        selectedChannel.team_id
          ? apiClient.get(TEAMS_MEMBERS(selectedChannel.team_id), {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
          : Promise.resolve(null),
        apiClient.get(COMPANY_USERS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      const [membersResp, teamResp, usersResp] = settled || [];
      console.debug("openMembersPanel: fetch settled results", {
        membersRespStatus: membersResp?.status,
        teamRespStatus: teamResp?.status,
        usersRespStatus: usersResp?.status,
      });

      // Expose raw fetch results to window for easier debugging in the browser
      try {
        // Avoid circular refs by serializing only essential fields
        window.__lastMembersFetch = {
          membersResp: membersResp && membersResp.status === "fulfilled" ? membersResp.value?.data : membersResp,
          teamResp: teamResp && teamResp.status === "fulfilled" ? teamResp.value?.data : teamResp,
          usersResp: usersResp && usersResp.status === "fulfilled" ? usersResp.value?.data : usersResp,
        };
      } catch (e) {
        // ignore
      }

      let members = [];
      try {
        const rawMembers = membersResp && membersResp.status === "fulfilled" && membersResp.value ? membersResp.value.data : [];
        members = Array.isArray(rawMembers) ? rawMembers : rawMembers?.members || rawMembers?.items || [];
      } catch (e) {
        console.error("openMembersPanel: error parsing members response", e, membersResp);
        members = [];
      }

      console.debug("openMembersPanel: members count", members.length);

      // Build a lookup map from team members (which include full name/email)
      const userMap = {};
      try {
        if (teamResp && teamResp.status === "fulfilled" && teamResp.value) {
          const rawTeam = teamResp.value.data;
          const teamList = Array.isArray(rawTeam) ? rawTeam : rawTeam?.members || rawTeam?.items || [];
          console.debug("openMembersPanel: team list count", teamList.length);
          teamList.forEach((tm) => {
            try {
              const uid = getUserId(tm);
              if (uid) userMap[uid] = getUserRecord(tm);
            } catch (e) {
              console.warn("openMembersPanel: skipping team member due to parse error", e, tm);
            }
          });
        }
      } catch (e) {
        console.error("openMembersPanel: error processing team members", e, teamResp);
      }

      try {
        if (usersResp && usersResp.status === "fulfilled" && usersResp.value) {
          const rawUsers = usersResp.value.data;
          const companyUsers = Array.isArray(rawUsers) ? rawUsers : rawUsers?.users || rawUsers?.items || rawUsers?.results || [];
          console.debug("openMembersPanel: company users count", companyUsers.length);
          companyUsers.forEach((user) => {
            try {
              const uid = getUserId(user);
              if (uid) userMap[uid] = getUserRecord(user);
            } catch (e) {
              console.warn("openMembersPanel: skipping company user due to parse error", e, user);
            }
          });
        }
      } catch (e) {
        console.error("openMembersPanel: error processing company users", e, usersResp);
      }

      const enriched = [];
      for (const member of members) {
        try {
          const uid = getUserId(member);
          enriched.push({ ...member, _user: userMap[uid] || null });
        } catch (e) {
          console.warn("openMembersPanel: skipping member due to parse error", e, member);
        }
      }

      console.debug("openMembersPanel: enriched members computed", enriched.length);
      try { window.__lastMembersFetch.enriched = enriched; } catch (e) {}
      setChannelMembers(enriched);
    } catch (error) {
      console.error("Error fetching channel members:", error);
      const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || JSON.stringify(error);
      try { window.__lastMembersFetchError = { message: msg, raw: error?.response?.data || error }; } catch (e) {}
      // Show more helpful message in the toast so we can debug from the UI
      toast.error(msg || "Failed to load channel members.");
    } finally {
      setIsFetchingChannelMembers(false);
    }
  };

  // Open settings and pre-populate form with current channel values
  const openSettings = () => {
    if (!selectedChannel) return;
    setSettingsForm({
      name: selectedChannel.name || "",
      description: selectedChannel.description || "",
      topic: selectedChannel.topic || "",
      purpose: selectedChannel.purpose || "",
      visibility: selectedChannel.is_private ? "private" : "public",
      is_discoverable: selectedChannel.is_discoverable ?? true,
      max_members: selectedChannel.max_members || 100,
      message_retention_days: selectedChannel.message_retention_days || 365,
    });
    setIsSettingsOpen(true);
  };

  const handleUpdateChannel = async () => {
    if (!selectedChannel?.id) return;
    setIsSavingSettings(true);
    try {
      const payload = {
        ...settingsForm,
        is_private: settingsForm.visibility === "private",
      };
      const response = await apiClient.patch(CHANNEL_UPDATE(selectedChannel.id), payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const updated = response.data;
      setChannels(prev => prev.map(c => c.id === selectedChannel.id ? { ...c, ...updated } : c));
      setSelectedChannel(prev => ({ ...prev, ...updated }));
      setIsSettingsOpen(false);
      toast.success("Channel settings saved.");
    } catch (error) {
      console.error("Error updating channel:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Watch for slug generation
  const nameValue = watch("name");
  React.useEffect(() => {
    if (nameValue) {
      const slug = nameValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [nameValue, setValue]);

  // Sync is_private with visibility
  const visibilityValue = watch("visibility");
  React.useEffect(() => {
    setValue("is_private", visibilityValue === "private");
  }, [visibilityValue, setValue]);

  return (
    <AdminLayout showFloatingActions={false}>
      <div className="fixed top-20 bottom-0 left-0 lg:left-[292px] right-0 bg-white z-[20] flex flex-row overflow-hidden border-t md:border-t-0 border-brand-line">

        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div
            className="absolute inset-0 z-10 bg-brand-ink/10 backdrop-blur-[2px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Secondary Sidebar - Channels List */}
        <aside className={cn(
          "absolute inset-y-0 left-0 z-20 w-72 flex-col border-r border-brand-line bg-brand-soft transform transition-transform duration-300 md:relative md:translate-x-0 md:flex",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-brand-ink">Channels</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary">
                    <Plus className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl md:rounded-[40px] border-none bg-white p-0 shadow-2xl md:left-[60%]">
                  <DialogHeader className="px-6 md:px-12 pt-10 md:pt-14 pb-6">
                    <DialogTitle className="text-3xl md:text-4xl font-black tracking-tight text-brand-ink">Create a Channel</DialogTitle>
                    <DialogDescription className="text-base md:text-lg text-brand-secondary mt-2">
                      Channels are where your team communicates. They're best when organized around a topic.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit(onSubmit, onInvalidSubmit)} className="px-6 md:px-12 pb-12 space-y-12">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-brand-primary pl-3">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-brand-ink font-semibold">Team</Label>
                          <Controller
                            name="team_id"
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="rounded-xl border-brand-line h-12">
                                  <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="rounded-2xl border-brand-line p-1">
                                  {teams?.map?.((team) => (
                                    <SelectItem
                                      key={team.id}
                                      value={team.id}
                                      className="rounded-xl py-2.5 focus:bg-brand-soft focus:text-brand-primary"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="size-5 rounded-md bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                                          {team.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-brand-ink">{team.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.team_id && <p className="text-xs text-red-500 font-medium">{errors.team_id.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-brand-ink font-semibold">Channel Name</Label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                            <Input
                              id="name"
                              placeholder="e.g. engineering"
                              className="pl-9 rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                              {...register("name")}
                            />
                          </div>
                          {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                        </div>

                        {errors.company_id && (
                          <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                            {errors.company_id.message}
                          </div>
                        )}

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="slug" className="text-brand-ink font-semibold">URL Slug</Label>
                          <Input
                            id="slug"
                            placeholder="engineering-tech"
                            className="rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                            {...register("slug")}
                          />
                          {errors.slug && <p className="text-xs text-red-500 font-medium">{errors.slug.message}</p>}
                        </div>
                      </div>

                      {/* Visibility & Access */}
                      <div className="space-y-6">
                        <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">Visibility & Access</h3>

                        <div className="space-y-3">
                          <Label className="text-brand-ink font-semibold ml-1">Channel Visibility</Label>
                          <Controller
                            name="visibility"
                            control={control}
                            render={({ field }) => (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                  type="button"
                                  onClick={() => field.onChange("public")}
                                  className={cn(
                                    "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left",
                                    field.value === "public"
                                      ? "border-brand-primary bg-brand-primary/5 shadow-lg shadow-brand-primary/5"
                                      : "border-brand-line bg-white hover:border-brand-primary/30"
                                  )}
                                >
                                  <div className={cn("p-3 rounded-2xl transition-colors", field.value === "public" ? "bg-brand-primary text-white" : "bg-brand-soft text-brand-primary")}>
                                    <Globe className="size-6" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-base font-black text-brand-ink">Public Channel</p>
                                    <p className="text-xs text-brand-secondary">Open to everyone in the team</p>
                                  </div>
                                  <div className={cn("size-6 rounded-full border-2 flex items-center justify-center transition-all", field.value === "public" ? "border-brand-primary bg-brand-primary" : "border-brand-line")}>
                                    {field.value === "public" && <div className="size-2 rounded-full bg-white" />}
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => field.onChange("private")}
                                  className={cn(
                                    "flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left",
                                    field.value === "private"
                                      ? "border-amber-500 bg-amber-50 shadow-lg shadow-amber-500/5"
                                      : "border-brand-line bg-white hover:border-amber-500/30"
                                  )}
                                >
                                  <div className={cn("p-3 rounded-2xl transition-colors", field.value === "private" ? "bg-amber-500 text-white" : "bg-brand-soft text-amber-600")}>
                                    <Lock className="size-6" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-base font-black text-brand-ink">Private Channel</p>
                                    <p className="text-xs text-brand-secondary">Invite only access for members</p>
                                  </div>
                                  <div className={cn("size-6 rounded-full border-2 flex items-center justify-center transition-all", field.value === "private" ? "border-amber-500 bg-amber-500" : "border-brand-line")}>
                                    {field.value === "private" && <div className="size-2 rounded-full bg-white" />}
                                  </div>
                                </button>
                              </div>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-brand-ink font-semibold ml-1">Default Member Access</Label>
                            <Controller
                              name="default_access"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="rounded-xl border-brand-line h-12">
                                    <SelectValue placeholder="Select access" />
                                  </SelectTrigger>
                                  <SelectContent position="popper" sideOffset={5}>
                                    <SelectItem value="member">Member (Full Access)</SelectItem>
                                    <SelectItem value="guest">Guest (Limited Access)</SelectItem>
                                    <SelectItem value="admin">Admin (Manage Channel)</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-brand-ink font-semibold">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="What is this channel for? Helps people find the right place for discussions."
                          className="rounded-xl border-brand-line focus:ring-brand-primary/20 min-h-[80px] text-base p-4"
                          {...register("description")}
                        />
                      </div>
                    </div>

                    {/* Topic & Purpose */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-amber-400 pl-3">Context & Purpose</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="topic" className="text-brand-ink font-semibold">Topic</Label>
                          <Input
                            id="topic"
                            placeholder="e.g. Deployments & Infrastructure"
                            className="rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                            {...register("topic")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="purpose" className="text-brand-ink font-semibold">Long-term Purpose</Label>
                          <Input
                            id="purpose"
                            placeholder="e.g. Strategic alignment for DevOps"
                            className="rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                            {...register("purpose")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-purple-500 pl-3">Appearance</h3>

                      <div className="space-y-4">
                        <Label className="text-brand-ink font-semibold ml-1">Channel Avatar</Label>
                        <Controller
                          name="avatar_url"
                          control={control}
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-4">
                              {[
                                "https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?q=80&w=100", // Tech
                                "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=100", // Abstract
                                "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=100", // Gradient
                                "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=100", // Purple
                              ].map((url, i) => (
                                <button
                                  key={url}
                                  type="button"
                                  onClick={() => field.onChange(url)}
                                  className={cn(
                                    "size-16 rounded-2xl overflow-hidden border-4 transition-all hover:scale-105 active:scale-95 shadow-sm",
                                    field.value === url ? "border-brand-primary scale-110 shadow-lg shadow-brand-primary/20" : "border-transparent"
                                  )}
                                >
                                  <img src={url} className="size-full object-cover" alt={`Preset ${i + 1}`} />
                                </button>
                              ))}
                              <div className="flex-1 min-w-[200px]">
                                <Input
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Or paste custom image URL..."
                                  className="rounded-xl border-brand-line h-16 bg-brand-soft/5"
                                />
                              </div>
                            </div>
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="banner_url" className="text-brand-ink font-semibold ml-1">Banner URL (Optional)</Label>
                        <Input
                          id="banner_url"
                          placeholder="https://example.com/banner.jpg"
                          className="rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                          {...register("banner_url")}
                        />
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-3">Advanced Controls</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-brand-ink font-semibold">Message Retention (Days)</Label>
                          <Input
                            type="number"
                            className="rounded-xl border-brand-line h-12"
                            {...register("message_retention_days", { valueAsNumber: true })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-brand-ink font-semibold">Max Member Limit</Label>
                          <Input
                            type="number"
                            className="rounded-xl border-brand-line h-12"
                            {...register("max_members", { valueAsNumber: true })}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-brand-ink font-semibold ml-1">Default Notifications</Label>
                        <Controller
                          name="settings.notifications_default"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { value: "all", label: "All Messages", desc: "Every post" },
                                { value: "mentions", label: "Mentions Only", desc: "Stay focused" },
                                { value: "nothing", label: "Nothing", desc: "Stay quiet" },
                              ].map((opt) => (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => field.onChange(opt.value)}
                                  className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all p-4 text-center gap-1",
                                    field.value === opt.value
                                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                                      : "border-brand-line bg-white hover:border-brand-primary/20 text-brand-secondary"
                                  )}
                                >
                                  <span className="text-sm font-black">{opt.label}</span>
                                  <span className="text-[10px] opacity-70">{opt.desc}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* <div className="space-y-2">
                          <Label htmlFor="parent_channel_id" className="text-brand-ink font-semibold ml-1">Parent Channel ID (Optional)</Label>
                          <Input
                            id="parent_channel_id"
                            placeholder="UUID of parent channel"
                            className="rounded-xl border-brand-line focus:ring-brand-primary/20 h-12"
                            {...register("parent_channel_id")}
                          />
                        </div> */}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-5 rounded-3xl border-2 border-brand-line bg-brand-soft/5 hover:bg-white transition-all group">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-black text-brand-ink">Cross Team Channel</span>
                            <span className="text-[10px] text-brand-secondary">Accessible across different teams</span>
                          </div>
                          <Controller
                            name="is_cross_team"
                            control={control}
                            render={({ field }) => (
                              <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={cn(
                                  "w-10 h-6 rounded-full relative transition-colors duration-200",
                                  field.value ? "bg-brand-primary" : "bg-brand-line"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 size-4 rounded-full bg-white transition-all duration-200",
                                  field.value ? "left-5" : "left-1"
                                )} />
                              </button>
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between p-5 rounded-3xl border-2 border-brand-line bg-brand-soft/5 hover:bg-white transition-all group">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-black text-brand-ink">Discoverable</span>
                            <span className="text-[10px] text-brand-secondary">Show in channel browser</span>
                          </div>
                          <Controller
                            name="is_discoverable"
                            control={control}
                            render={({ field }) => (
                              <button
                                type="button"
                                onClick={() => field.onChange(!field.value)}
                                className={cn(
                                  "w-10 h-6 rounded-full relative transition-colors duration-200",
                                  field.value ? "bg-brand-primary" : "bg-brand-line"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 size-4 rounded-full bg-white transition-all duration-200",
                                  field.value ? "left-5" : "left-1"
                                )} />
                              </button>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-blue-600 pl-3">Permissions & Interaction</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: "settings.allow_mentions", label: "Allow @mentions", desc: "Notify users when mentioned", icon: <Hash className="size-5" /> },
                          { name: "settings.allow_file_uploads", label: "File Uploads", desc: "Members can attach files", icon: <ImageIcon className="size-5" /> },
                          { name: "settings.allow_link_previews", label: "Link Previews", desc: "Generate rich link previews", icon: <Globe className="size-5" /> },
                          { name: "settings.allow_bots", label: "Allow Bots", desc: "Integrations can post here", icon: <PlusCircle className="size-5" /> },
                          { name: "settings.allow_guest_access", label: "Guest Access", desc: "External guests can join", icon: <Users className="size-5" /> },
                        ].map((field) => (
                          <Controller
                            key={field.name}
                            name={field.name}
                            control={control}
                            render={({ field: switchField }) => (
                              <button
                                type="button"
                                onClick={() => switchField.onChange(!switchField.value)}
                                className={cn(
                                  "flex items-center justify-between p-5 rounded-3xl border-2 transition-all hover:shadow-lg hover:shadow-brand-ink/5 group",
                                  switchField.value
                                    ? "bg-white border-brand-primary"
                                    : "bg-brand-soft/5 border-brand-line"
                                )}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={cn("p-2 rounded-xl transition-colors", switchField.value ? "bg-brand-primary/10 text-brand-primary" : "bg-brand-soft text-brand-secondary")}>
                                    {field.icon}
                                  </div>
                                  <div className="flex flex-col gap-0.5 text-left">
                                    <span className="text-sm font-black text-brand-ink/80">{field.label}</span>
                                    <span className="text-[10px] text-brand-secondary">{field.desc}</span>
                                  </div>
                                </div>
                                <div className={cn(
                                  "w-10 h-6 rounded-full relative transition-colors duration-200",
                                  switchField.value ? "bg-brand-primary" : "bg-brand-line"
                                )}>
                                  <div className={cn(
                                    "absolute top-1 size-4 rounded-full bg-white transition-all duration-200",
                                    switchField.value ? "left-5" : "left-1"
                                  )} />
                                </div>
                              </button>
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="pt-8 gap-4 sm:gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="rounded-2xl h-14 px-8 text-base font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-2xl bg-brand-primary hover:bg-brand-primary/90 px-10 h-14 text-base font-black shadow-xl shadow-brand-primary/20 transition-all hover:-translate-y-0.5"
                      >
                        {isSubmitting ? "Creating..." : "Create Channel"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
              <input
                type="text"
                placeholder="Search channels..."
                className="w-full bg-white/50 border-brand-line/30 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-brand-primary/10 transition-all"
              />
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 pb-6">
            <div className="space-y-1">
              {channels?.map?.((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    selectedChannel?.id === channel.id
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                      : "text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {channel.is_private ? (
                      <Lock className={cn("size-4", selectedChannel?.id === channel.id ? "text-white/70" : "text-brand-secondary/40 group-hover:text-brand-primary/60")} />
                    ) : (
                      <Hash className={cn("size-4", selectedChannel?.id === channel.id ? "text-white/70" : "text-brand-secondary/40 group-hover:text-brand-primary/60")} />
                    )}
                    <span className="truncate">{channel.name}</span>
                  </div>
                  {selectedChannel?.id === channel.id && (
                    <div className="size-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-auto p-6 border-t border-brand-line/50">
            {/* <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40 mb-3 ml-2">Direct Messages</h3>
            <div className="space-y-1">
              {[
                { name: "Sarah J.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150", online: true },
                { name: "Marcus Wright", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150", online: true },
              ].map((user) => (
                <button key={user.name} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-primary/5 transition-colors text-left group">
                  <div className="relative">
                    <img src={user.avatar} className="size-8 rounded-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt={user.name} />
                    {user.online && <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
                  </div>
                  <span className="text-sm font-medium text-brand-secondary group-hover:text-brand-ink transition-colors">{user.name}</span>
                </button>
              ))}
            </div> */}

            <Button className="w-full mt-6 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-11 shadow-lg shadow-emerald-500/20">
              <PlusCircle className="mr-2 size-4" />
              New Message
            </Button>
          </div>
        </aside>

        {/* Content Area - Channel Message Center */}
        <main className="flex min-w-0 flex-1 flex-col bg-white">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-brand-line px-4 md:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <div className="size-5 flex flex-col justify-center gap-1">
                  <div className="h-0.5 w-full bg-brand-ink" />
                  <div className="h-0.5 w-full bg-brand-ink" />
                  <div className="h-0.5 w-full bg-brand-ink" />
                </div>
              </Button>
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-soft text-brand-primary">
                {selectedChannel?.is_private ? <Lock className="size-4" /> : <Hash className="size-4" />}
              </div>
              <div>
                <h3 className="font-bold text-brand-ink">{selectedChannel?.name || "Select a Channel"}</h3>
                <p className="text-[11px] text-brand-secondary truncate max-w-[300px]">
                  {selectedChannel?.description || "Pick a topic to start collaborating"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* People / Members icon */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-brand-secondary hover:text-brand-primary hover:bg-brand-primary/5"
                onClick={openMembersPanel}
                disabled={!selectedChannel}
                title="Channel Members"
              >
                <Users className="size-4" />
              </Button>

              {/* Delete icon */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-brand-secondary hover:text-red-500 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
                disabled={!selectedChannel}
                title="Delete Channel"
              >
                <Trash2 className="size-4" />
              </Button>

              {/* Settings icon */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-brand-secondary hover:text-brand-primary hover:bg-brand-primary/5"
                onClick={openSettings}
                disabled={!selectedChannel}
                title="Channel Settings"
              >
                <Settings className="size-4" />
              </Button>
            </div>
          </header>

          {/* Message Center */}
          <div className="min-h-0 flex-1 bg-white">
            {!selectedChannel ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-soft shadow-xl shadow-brand-ink/5">
                  <Hash className="size-10 text-brand-primary/20" />
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-brand-ink">Loading Channels...</h4>
                    <div className="flex gap-2 justify-center">
                      <div className="size-2 rounded-full bg-brand-primary/40 animate-bounce" />
                      <div className="size-2 rounded-full bg-brand-primary/40 animate-bounce delay-150" />
                      <div className="size-2 rounded-full bg-brand-primary/40 animate-bounce delay-300" />
                    </div>
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-bold text-brand-ink">No Channels Found</h4>
                    <p className="mt-2 max-w-md text-sm text-brand-secondary leading-relaxed mb-8">
                      There are no channels in the workspace yet. Start by creating the first one!
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="rounded-2xl bg-brand-primary hover:bg-brand-primary/90 px-8 h-12 text-base font-black shadow-xl shadow-brand-primary/20"
                    >
                      <Plus className="mr-2 size-5" />
                      Create First Channel
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-end px-5 py-8 md:px-10">
                  <div className="space-y-4" />
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Message Composer (compact) */}
          <div className="border-t border-brand-line bg-white px-4 py-4 md:px-8">
            <div className="mx-auto flex max-w-5xl items-center gap-3 rounded-full border border-brand-line bg-white px-4 py-3 shadow-sm">
              <Button variant="ghost" size="icon" className="size-10 shrink-0 rounded-full text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary">
                <Paperclip className="size-5" />
              </Button>

              <input
                type="text"
                placeholder={selectedChannel ? `Message #${selectedChannel.name}` : "Type a message"}
                disabled={!selectedChannel}
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-brand-secondary/50 disabled:cursor-not-allowed"
              />

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary">
                  <Smile className="size-5" />
                </Button>

                <Button variant="ghost" size="icon" className="rounded-full text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary">
                  <Plus className="size-5" />
                </Button>

                <Button
                  disabled={!selectedChannel}
                  className="size-11 rounded-full bg-emerald-200 p-0 text-white shadow-lg hover:scale-95 transition-transform disabled:opacity-50"
                >
                  <Send className="size-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </main>

        <>
          <AddMemberDialog
            open={isAddMemberDialogOpen}
            onOpenChange={setIsAddMemberDialogOpen}
            selectedChannel={selectedChannel}
            addMemberSource={addMemberSource}
            memberSearchQuery={memberSearchQuery}
            setMemberSearchQuery={setMemberSearchQuery}
            memberRole={memberRole}
            setMemberRole={setMemberRole}
            addMemberError={addMemberError}
            teamMembers={teamMembers}
            isFetchingTeamMembers={isFetchingTeamMembers}
            selectedMemberIds={selectedMemberIds}
            toggleMemberSelection={toggleMemberSelection}
            isAddingMember={isAddingMember}
            handleAddMembers={handleAddMembers}
          />

          <MembersDialog
            open={isMembersPanelOpen}
            onOpenChange={setIsMembersPanelOpen}
            selectedChannel={selectedChannel}
            isFetchingChannelMembers={isFetchingChannelMembers}
            channelMembers={channelMembers}
            onAddMember={() => {
              setIsMembersPanelOpen(false);
              openAddMemberDialog("team");
            }}
            onAddOtherTeamMember={() => {
              setIsMembersPanelOpen(false);
              openAddMemberDialog("other");
            }}
          />

          <DeleteChannelDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            selectedChannel={selectedChannel}
            isDeletingChannel={isDeletingChannel}
            onDelete={handleDeleteChannel}
          />

          <ChannelSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            selectedChannel={selectedChannel}
            settingsForm={settingsForm}
            setSettingsForm={setSettingsForm}
            isSavingSettings={isSavingSettings}
            onSave={handleUpdateChannel}
          />
        </>
      </div>
    </AdminLayout>
  );
}
