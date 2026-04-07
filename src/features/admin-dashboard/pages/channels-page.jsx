import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  MoreHorizontal
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

// Schema based on user input
const channelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and dashes"),
  visibility: z.string().default("public"),
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
  default_access: z.string().default("member"),
  settings: z.object({
    notifications_default: z.string().default("all"),
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
  const [channels, setChannels] = useState([
    { id: 1, name: "general", description: "Company-wide discussions and updates", is_private: false },
    { id: 2, name: "engineering", description: "All things tech and code", is_private: false },
    { id: 3, name: "marketing-ops", description: "Marketing operations and campaigns", is_private: true },
    { id: 4, name: "design-system", description: "UI/UX consistency and documentation", is_private: false },
  ]);

  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = (data) => {
    console.log("Creating channel:", data);
    const newChannel = {
      id: channels.length + 1,
      name: data.name,
      description: data.description,
      is_private: data.is_private,
    };
    setChannels([...channels, newChannel]);
    setIsDialogOpen(false);
    reset();
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

        {/* Secondary Sidebar - Channels List */}
        <aside className={cn(
          "absolute inset-y-0 left-0 z-20 w-72 flex-col border-r border-brand-line bg-brand-soft transform transition-transform duration-300 md:relative md:translate-x-0 md:flex",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-brand-ink">Channels</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-xl hover:bg-brand-primary/10 hover:text-brand-primary">
                    <Plus className="size-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border-none bg-white p-0 shadow-2xl">
                  <DialogHeader className="px-8 pt-8 pb-4">
                    <DialogTitle className="text-2xl font-bold text-brand-ink">Create a Channel</DialogTitle>
                    <DialogDescription className="text-brand-secondary">
                      Channels are where your team communicates. They're best when organized around a topic.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit(onSubmit)} className="px-8 pb-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-brand-ink font-semibold">Name</Label>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                          <Input
                            id="name"
                            placeholder="e.g. marketing"
                            className="pl-9 rounded-xl border-brand-line focus:ring-brand-primary/20"
                            {...register("name")}
                          />
                        </div>
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug" className="text-brand-ink font-semibold">Slug</Label>
                        <Input
                          id="slug"
                          placeholder="marketing-ops"
                          className="rounded-xl border-brand-line focus:ring-brand-primary/20"
                          {...register("slug")}
                        />
                        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-brand-ink font-semibold">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="What is this channel about?"
                        className="rounded-xl border-brand-line focus:ring-brand-primary/20 min-h-[80px]"
                        {...register("description")}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="topic" className="text-brand-ink font-semibold">Topic</Label>
                        <Input
                          id="topic"
                          placeholder="Brief topic"
                          className="rounded-xl border-brand-line focus:ring-brand-primary/20"
                          {...register("topic")}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purpose" className="text-brand-ink font-semibold">Purpose</Label>
                        <Input
                          id="purpose"
                          placeholder="Long-term purpose"
                          className="rounded-xl border-brand-line focus:ring-brand-primary/20"
                          {...register("purpose")}
                        />
                      </div>
                    </div>

                    <Separator className="bg-brand-line/50" />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-brand-line bg-brand-soft/10">
                        <div className={cn("p-2 rounded-lg", watch("is_private") ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600")}>
                          {watch("is_private") ? <Lock className="size-4" /> : <Globe className="size-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-brand-ink">Private Channel</p>
                          <p className="text-[10px] text-brand-secondary">Invite only access</p>
                        </div>
                        <input
                          type="checkbox"
                          className="size-5 rounded-md border-brand-line text-brand-primary focus:ring-brand-primary/20"
                          {...register("is_private")}
                        />
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-2xl border border-brand-line bg-brand-soft/10">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                          <Users className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-brand-ink">Cross Team</p>
                          <p className="text-[10px] text-brand-secondary">Allow shared access</p>
                        </div>
                        <input
                          type="checkbox"
                          className="size-5 rounded-md border-brand-line text-brand-primary focus:ring-brand-primary/20"
                          {...register("is_cross_team")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-brand-ink font-semibold">Retention (Days)</Label>
                        <Input
                          type="number"
                          className="rounded-xl border-brand-line"
                          {...register("message_retention_days", { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-brand-ink font-semibold">Max Members</Label>
                        <Input
                          type="number"
                          className="rounded-xl border-brand-line"
                          {...register("max_members", { valueAsNumber: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-brand-ink uppercase tracking-wider">Channel Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: "settings.allow_mentions", label: "Allow @mentions" },
                          { name: "settings.allow_file_uploads", label: "File Uploads" },
                          { name: "settings.allow_link_previews", label: "Link Previews" },
                          { name: "settings.allow_bots", label: "Allow Bots" },
                        ].map((field) => (
                          <div key={field.name} className="flex items-center justify-between p-3 rounded-xl bg-brand-soft/5 border border-brand-line/50">
                            <span className="text-sm text-brand-ink/80">{field.label}</span>
                            <input
                              type="checkbox"
                              className="size-4 rounded border-brand-line text-brand-primary"
                              {...register(field.name)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsDialogOpen(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="rounded-xl bg-brand-primary hover:bg-brand-primary/90 px-8"
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
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    selectedChannel.id === channel.id
                      ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20"
                      : "text-brand-secondary hover:bg-brand-primary/5 hover:text-brand-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {channel.is_private ? (
                      <Lock className={cn("size-4", selectedChannel.id === channel.id ? "text-white/70" : "text-brand-secondary/40 group-hover:text-brand-primary/60")} />
                    ) : (
                      <Hash className={cn("size-4", selectedChannel.id === channel.id ? "text-white/70" : "text-brand-secondary/40 group-hover:text-brand-primary/60")} />
                    )}
                    <span className="truncate">{channel.name}</span>
                  </div>
                  {selectedChannel.id === channel.id && (
                    <div className="size-1.5 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-auto p-6 border-t border-brand-line/50">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-secondary/40 mb-3 ml-2">Direct Messages</h3>
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
            </div>

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
                {selectedChannel.is_private ? <Lock className="size-4" /> : <Hash className="size-4" />}
              </div>
              <div>
                <h3 className="font-bold text-brand-ink">{selectedChannel.name}</h3>
                <p className="text-[11px] text-brand-secondary truncate max-w-[300px]">
                  {selectedChannel.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-brand-secondary">
                <Users className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-brand-secondary">
                <Settings className="size-4" />
              </Button>
            </div>
          </header>

          {/* Messages Area / Welcome Screen */}
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-brand-soft/5">
            <div className="size-20 rounded-3xl bg-white shadow-xl shadow-brand-ink/5 flex items-center justify-center mb-6">
              <MessageSquare className="size-10 text-brand-primary/40" />
            </div>
            <h4 className="text-xl font-bold text-brand-ink">Welcome to #{selectedChannel.name}</h4>
            <p className="mt-2 max-w-md text-sm text-brand-secondary leading-relaxed">
              This is the very beginning of the <span className="font-semibold text-brand-primary">#{selectedChannel.name}</span> channel.
              {selectedChannel.is_private && " This is a private channel, only invited members can see this."}
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
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

          {/* Message Input Bottom Bar */}
          <div className="p-4 md:p-6 border-t border-brand-line bg-white/50 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl relative group">
              <div className="flex flex-col rounded-3xl border-2 border-brand-line/40 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.04)] focus-within:border-brand-primary/30 focus-within:shadow-[0_12px_48px_rgba(68,83,74,0.08)] transition-all duration-300">

                {/* Main Textarea */}
                <Textarea
                  placeholder={`Message #${selectedChannel.name}`}
                  className="min-h-[100px] w-full border-none bg-transparent px-6 py-5 text-base focus-visible:ring-0 resize-none placeholder:text-brand-ink/20"
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

