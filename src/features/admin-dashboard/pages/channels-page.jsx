import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Hash,
  Plus,
  Search,
  Settings,
  Users,
  Shield,
  MessageSquare,
  ChevronRight,
  Globe,
  Lock,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Smile,
  Image as ImageIcon,
  Paperclip,
  FileText,
  Send,
  MoreHorizontal,
  Trash2
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/client";
import { CHANNELS_CREATE, CHANNELS_LIST, CHANNELS_DELETE, TEAMS_LIST } from "@/config/api";
import { useAuthStore } from "@/store/auth-store";



// Schema based on user input
const channelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and dashes"),
  visibility: z.enum(["public", "private"]).default("public"),
  is_cross_team: z.boolean().default(false),
  description: z.string().optional(),
  company_id: z.string().uuid("Invalid Company ID"),
  team_id: z.string().uuid("Invalid Team ID"),
  is_private: z.boolean().default(false),
  avatar_url: z.string().optional(),
  banner_url: z.string().optional(),
  topic: z.string().optional(),
  purpose: z.string().optional(),
  parent_channel_id: z.string().uuid().optional().nullable(),
  is_discoverable: z.boolean().default(true),
  message_retention_days: z.number().min(1).default(365),
  max_members: z.number().min(1).default(100),
  default_access: z.enum(["member", "guest", "admin"]).default("member"),
  settings: z.object({
    notifications_default: z.enum(["all", "mentions", "nothing"]).default("all"),
    allow_mentions: z.boolean().default(true),
    allow_file_uploads: z.boolean().default(true),
    allow_link_previews: z.boolean().default(true),
    allow_bots: z.boolean().default(true),
    allow_guest_access: z.boolean().default(false),
    moderation_settings: z.object({}).optional(),
  }),
  moderation_settings: z.object({}).optional(),
});

const DEFAULT_VALUES = {
  name: "",
  slug: "",
  visibility: "public",
  is_cross_team: false,
  description: "",
  company_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Placeholder from schema
  team_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",    // Placeholder from schema
  is_private: false,
  avatar_url: "",
  banner_url: "",
  topic: "",
  purpose: "",
  parent_channel_id: null,
  is_discoverable: true,
  message_retention_days: 365,
  max_members: 100,
  default_access: "member",
  settings: {
    notifications_default: "all",
    allow_mentions: true,
    allow_file_uploads: true,
    allow_link_previews: true,
    allow_bots: true,
    allow_guest_access: false,
    moderation_settings: {},
  },
  moderation_settings: {},
};

export function ChannelsPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const session = useAuthStore((state) => state.session);
  const token = session?.accessToken;

  // Fetch teams first
  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await apiClient.get(TEAMS_LIST, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const rawData = response.data;
        // Handle various response structures (array, departments, items)
        const teamDataRaw = Array.isArray(rawData) ? rawData : (rawData?.departments || rawData?.items || []);

        // Transform to ensure uniform id and name fields
        const transformedTeams = teamDataRaw.map(team => ({
          ...team,
          id: team.id || team.team_id || team.uuid || team.department_id,
          name: team.name || team.department_name || "Unnamed Team"
        }));

        setTeams(transformedTeams);
        // Removed auto-selection of first team to allow "Select Team" placeholder to show
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    if (token) fetchTeams();
  }, [token]);

  // Fetch all channels on mount
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
      team_id: selectedTeamId || DEFAULT_VALUES.team_id,
    },
  });

  // Sync team_id in form when selectedTeamId changes
  React.useEffect(() => {
    if (selectedTeamId) {
      setValue("team_id", selectedTeamId);
    }
  }, [selectedTeamId, setValue]);

  // Sync company_id in form when session changes
  React.useEffect(() => {
    if (session?.company_id) {
      setValue("company_id", session.company_id);
    }
  }, [session, setValue]);

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
        team_id: selectedTeamId,
      });
    } catch (error) {
      console.error("Critical error in channel creation:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Failed to create channel. Please check your inputs and try again.";
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDeleteChannel = async (channelId) => {
    if (!window.confirm("Are you sure you want to delete this channel? This action cannot be undone.")) return;

    try {
      await apiClient.delete(CHANNELS_DELETE(channelId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setChannels(prev => prev.filter(c => c.id !== channelId));
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || "Failed to delete channel.";
      alert(`Error: ${errorMessage}`);
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
    <AdminLayout>
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
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-secondary/70 ml-1">Active Team</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full bg-white border-brand-line rounded-xl h-12 shadow-sm focus:ring-brand-primary/10">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent position="popper" className="rounded-2xl border-brand-line p-1">
                  {teams?.map?.((team) => (
                    <SelectItem key={team.id} value={team.id} className="rounded-xl py-2.5 focus:bg-brand-soft focus:text-brand-primary">
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
            </div>

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

                  <form onSubmit={handleSubmit(onSubmit)} className="px-6 md:px-12 pb-12 space-y-12">
                    {/* Basic Information */}
                    <div className="space-y-6">
                      <h3 className="text-sm font-black text-brand-secondary uppercase tracking-[0.2em] border-l-4 border-brand-primary pl-3">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <div className="space-y-2">
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

        {/* Content Area - Chat Simulation / Selected Channel Info */}
        <main className="flex flex-1 flex-col bg-white">
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
              <Button variant="ghost" size="icon" className="rounded-xl text-brand-secondary">
                <Users className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-brand-secondary hover:text-red-500 hover:bg-red-50"
                onClick={() => handleDeleteChannel(selectedChannel?.id)}
                disabled={!selectedChannel}
              >
                <Trash2 className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-brand-secondary">
                <Settings className="size-4" />
              </Button>
            </div>
          </header>

          {/* Messages Area / Welcome Screen */}
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-brand-soft/5">
            {!selectedChannel ? (
              <div className="flex flex-col items-center animate-in fade-in duration-500">
                <div className="size-20 rounded-3xl bg-white shadow-xl shadow-brand-ink/5 flex items-center justify-center mb-6">
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
              <div className="animate-in slide-in-from-bottom-4 duration-500">
                <div className="size-20 rounded-3xl bg-white shadow-xl shadow-brand-ink/5 flex items-center justify-center mb-6 mx-auto">
                  <MessageSquare className="size-10 text-brand-primary/40" />
                </div>
                <h4 className="text-xl font-bold text-brand-ink">Welcome to #{selectedChannel.name}</h4>
                <p className="mt-2 max-w-md text-sm text-brand-secondary leading-relaxed mb-8">
                  This is the very beginning of the <span className="font-semibold text-brand-primary">#{selectedChannel.name}</span> channel.
                  {selectedChannel.is_private && " This is a private channel, only invited members can see this."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
                  <button className="flex items-center gap-3 p-4 rounded-2xl border border-brand-line bg-white hover:border-brand-primary/30 transition-colors text-left group">
                    <div className="p-2 rounded-xl bg-brand-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      <PlusCircle className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">Add People</p>
                      <p className="text-[10px] text-brand-secondary">Invite team members</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 p-4 rounded-2xl border border-brand-line bg-white hover:border-brand-primary/30 transition-colors text-left group">
                    <div className="p-2 rounded-xl bg-brand-soft text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                      <Settings className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-ink">Channel Settings</p>
                      <p className="text-[10px] text-brand-secondary">Manage permissions</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message Input Bottom Bar */}
          <div className="p-4 md:p-6 border-t border-brand-line bg-white/50 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl relative group">
              <div className="flex flex-col rounded-3xl border-2 border-brand-line/40 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] focus-within:border-brand-primary/30 focus-within:shadow-[0_12px_48px_rgba(68,83,74,0.08)] transition-all duration-300">

                {/* Main Textarea */}
                <Textarea
                  placeholder={selectedChannel ? `Message #${selectedChannel.name}` : "Select a channel to chat"}
                  disabled={!selectedChannel}
                  className="min-h-[100px] w-full border-none bg-transparent px-6 py-5 text-base focus-visible:ring-0 resize-none placeholder:text-brand-ink/20 disabled:cursor-not-allowed"
                />

                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-brand-line/30 bg-brand-soft/5">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full size-9 text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors">
                      <Smile className="size-[20px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full size-9 text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors">
                      <ImageIcon className="size-[20px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full size-9 text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors">
                      <Paperclip className="size-[20px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hidden sm:flex rounded-full size-9 text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors">
                      <FileText className="size-[20px]" />
                    </Button>
                    <div className="h-6 w-px bg-brand-line/50 mx-1 md:mx-2" />
                    <Button variant="ghost" size="icon" className="rounded-full size-9 text-brand-secondary/60 hover:text-brand-primary hover:bg-brand-primary/5 transition-colors">
                      <Plus className="size-[22px]" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block h-6 w-px bg-brand-line/50 mr-2" />
                    <Button className="rounded-2xl bg-brand-primary hover:bg-brand-primary/90 text-white px-6 h-10 shadow-lg shadow-brand-primary/20 transition-all active:scale-95 group">
                      <span className="font-bold mr-2 text-sm">Send</span>
                      <Send className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-center text-brand-secondary/40 font-bold uppercase tracking-[0.2em] opacity-0 group-focus-within:opacity-100 transition-opacity">
              Hold <kbd className="px-1.5 py-0.5 rounded border border-brand-line bg-white font-sans mx-1">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded border border-brand-line bg-white font-sans mx-1">Enter</kbd> for a new line
            </p>
          </div>
        </main>
      </div>
    </AdminLayout>
  );
}

