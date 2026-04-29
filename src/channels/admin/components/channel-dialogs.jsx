import {
  Globe,
  Hash,
  Loader2,
  Lock,
  Archive,
  ArchiveRestore,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  getRoleLabel,
  getUserAvatar,
  getUserEmail,
  getUserId,
  getUserName,
} from "@/channels/utils/channel-utils";

function UserAvatar({ avatar, name }) {
  if (avatar) {
    return <img src={avatar} alt={name} className="size-9 rounded-full object-cover flex-shrink-0" />;
  }

  return (
    <div className="size-9 rounded-full bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-brand-primary">{name.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export function AddMemberDialog({
  open,
  onOpenChange,
  selectedChannel,
  addMemberSource,
  memberSearchQuery,
  setMemberSearchQuery,
  memberRole,
  setMemberRole,
  addMemberError,
  teamMembers,
  isFetchingTeamMembers,
  selectedMemberIds,
  toggleMemberSelection,
  isAddingMember,
  handleAddMembers,
}) {
  const filteredMembers = teamMembers.filter((member) => {
    const query = memberSearchQuery.trim().toLowerCase();
    const name = getUserName(member, getUserId(member), member?.role).toLowerCase();
    const email = getUserEmail(member).toLowerCase();
    return !query || name.includes(query) || email.includes(query);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 md:px-8 pt-8 pb-4">
          <DialogTitle className="text-2xl font-black tracking-tight text-brand-ink">
            {addMemberSource === "other" ? "Add other team member" : "Add member"} to{" "}
            {selectedChannel?.name ? `#${selectedChannel.name}` : "channel"}
          </DialogTitle>
          <DialogDescription className="text-sm text-brand-secondary">
            {addMemberSource === "other"
              ? "Search across workspace users and add the right person to this channel."
              : "Select users from this channel team and add them to this channel."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 md:px-8 pb-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-4">
            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">
                {addMemberSource === "other" ? "Search workspace users" : "Search members"}
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                <Input
                  value={memberSearchQuery}
                  onChange={(event) => setMemberSearchQuery(event.target.value)}
                  placeholder={addMemberSource === "other" ? "Type at least 2 letters..." : "Filter by name or email..."}
                  className="pl-9 rounded-xl border-brand-line h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">Role</Label>
              <Select value={memberRole} onValueChange={setMemberRole}>
                <SelectTrigger className="rounded-xl border-brand-line h-12">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {addMemberError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {addMemberError}
            </div>
          ) : null}

          <div className="rounded-3xl border border-brand-line bg-brand-soft/20 overflow-hidden">
            <ScrollArea className="max-h-[320px]">
              <div className="p-3 space-y-2">
                {isFetchingTeamMembers ? (
                  <div className="flex items-center justify-center gap-2 py-12 text-sm text-brand-secondary">
                    <Loader2 className="size-4 animate-spin" />
                    Loading team members...
                  </div>
                ) : teamMembers.length === 0 && !addMemberError ? (
                  <div className="py-12 text-center text-sm text-brand-secondary">
                    {addMemberSource === "other"
                      ? "Search for a user to add from another team."
                      : "No team members found."}
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="py-12 text-center text-sm text-brand-secondary">
                    No members match your search.
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const userId = getUserId(member);
                    if (!userId) return null;

                    const userName = getUserName(member, userId, member?.role);
                    const userEmail = getUserEmail(member);
                    const avatar = getUserAvatar(member);
                    const isSelected = selectedMemberIds.has(userId);

                    return (
                      <button
                        key={userId}
                        type="button"
                        onClick={() => toggleMemberSelection(userId)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-150",
                          isSelected
                            ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                            : "border-transparent bg-white hover:border-brand-line"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 size-5 rounded-md border-2 flex items-center justify-center transition-all",
                            isSelected ? "border-brand-primary bg-brand-primary" : "border-brand-line"
                          )}
                        >
                          {isSelected ? (
                            <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : null}
                        </div>

                        <UserAvatar avatar={avatar} name={userName} />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-brand-ink">{userName}</p>
                          {userEmail ? <p className="truncate text-xs text-brand-secondary">{userEmail}</p> : null}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-brand-secondary">
              {selectedMemberIds.size > 0 ? (
                <span className="font-semibold text-brand-ink">{selectedMemberIds.size} selected</span>
              ) : (
                "Select people to add"
              )}
            </span>
            <Button
              type="button"
              disabled={selectedMemberIds.size === 0 || isAddingMember}
              onClick={handleAddMembers}
              className="rounded-2xl bg-brand-primary hover:bg-brand-primary/90 px-6 h-11 font-bold shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {isAddingMember ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 size-4" />
                  {selectedMemberIds.size > 1
                    ? `Add ${selectedMemberIds.size} People`
                    : selectedMemberIds.size === 1
                      ? "Add 1 Person"
                      : addMemberSource === "other"
                        ? "Add Other Team Member"
                        : "Add Member"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MembersDialog({
  open,
  onOpenChange,
  selectedChannel,
  isFetchingChannelMembers,
  channelMembers,
  onAddMember,
  onAddOtherTeamMember,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-7 pb-4">
          <DialogTitle className="text-xl font-black text-brand-ink">
            Members of #{selectedChannel?.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-brand-secondary">
            People currently in this channel.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6 space-y-4">
          <ScrollArea className="max-h-[380px] rounded-2xl border border-brand-line bg-brand-soft/10">
            <div className="p-3 space-y-2">
              {isFetchingChannelMembers ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-secondary">
                  <Loader2 className="size-4 animate-spin" /> Loading members...
                </div>
              ) : channelMembers.length === 0 ? (
                <div className="py-10 text-center text-sm text-brand-secondary">No members yet.</div>
              ) : (
                channelMembers.map((member, index) => {
                  const userId = getUserId(member);
                  const profile = member?._user || member;
                  const role = member?.role || "user";
                  const name = getUserName(profile, userId, role);
                  const email = getUserEmail(profile);
                  const avatar = getUserAvatar(profile);
                  const roleLabel = getRoleLabel(role);

                  return (
                    <div
                      key={member?.id || userId || index}
                      className="flex items-center gap-3 rounded-2xl bg-white border border-brand-line px-4 py-3"
                    >
                      <UserAvatar avatar={avatar} name={name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-ink truncate">{name}</p>
                        {email ? <p className="text-xs text-brand-secondary truncate">{email}</p> : null}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg bg-brand-soft text-brand-secondary">
                        {roleLabel}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              className="rounded-2xl bg-brand-primary hover:bg-brand-primary/90 h-11 font-bold shadow-lg shadow-brand-primary/20"
              onClick={onAddMember}
            >
              <UserPlus className="mr-2 size-4" /> Add Member
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl border-brand-line bg-white h-11 font-bold text-brand-ink hover:bg-brand-soft"
              onClick={onAddOtherTeamMember}
            >
              <Users className="mr-2 size-4" /> Add Other Team Member
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteChannelDialog({
  open,
  onOpenChange,
  selectedChannel,
  isDeletingChannel,
  onDelete,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-8 pb-4">
          <DialogTitle className="text-xl font-black text-brand-ink">Delete Channel?</DialogTitle>
          <DialogDescription className="text-sm text-brand-secondary">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-brand-ink">#{selectedChannel?.name}</span>? This action{" "}
            <span className="font-semibold text-red-500">cannot be undone</span> and all messages will be
            permanently lost.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-7 flex gap-3 justify-end">
          <Button
            variant="ghost"
            className="rounded-2xl h-11 px-6"
            onClick={() => onOpenChange(false)}
            disabled={isDeletingChannel}
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl h-11 px-6 bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/20"
            onClick={onDelete}
            disabled={isDeletingChannel}
          >
            {isDeletingChannel ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" /> Delete Channel
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ChannelSettingsDialog({
  open,
  onOpenChange,
  selectedChannel,
  settingsForm,
  setSettingsForm,
  isSavingSettings,
  isArchivingChannel,
  onSave,
  onArchive,
  onUnarchive,
}) {
  const updateSettings = (patch) => setSettingsForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-3xl border-none bg-white p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-8 pb-4">
          <DialogTitle className="text-xl font-black text-brand-ink">Channel Settings</DialogTitle>
          <DialogDescription className="text-sm text-brand-secondary">
            Update the settings for <span className="font-semibold text-brand-ink">#{selectedChannel?.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-4 space-y-5">
            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">Channel Name</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-secondary/40" />
                <Input
                  value={settingsForm.name || ""}
                  onChange={(event) => updateSettings({ name: event.target.value })}
                  className="pl-9 rounded-xl border-brand-line h-11"
                  placeholder="channel-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">Description</Label>
              <Textarea
                value={settingsForm.description || ""}
                onChange={(event) => updateSettings({ description: event.target.value })}
                className="rounded-xl border-brand-line min-h-[72px]"
                placeholder="What is this channel for?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-brand-ink font-semibold">Topic</Label>
                <Input
                  value={settingsForm.topic || ""}
                  onChange={(event) => updateSettings({ topic: event.target.value })}
                  className="rounded-xl border-brand-line h-11"
                  placeholder="e.g. Deployments"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-ink font-semibold">Purpose</Label>
                <Input
                  value={settingsForm.purpose || ""}
                  onChange={(event) => updateSettings({ purpose: event.target.value })}
                  className="rounded-xl border-brand-line h-11"
                  placeholder="Long-term goal"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-ink font-semibold">Visibility</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "public", label: "Public", icon: <Globe className="size-4" /> },
                  { value: "private", label: "Private", icon: <Lock className="size-4" /> },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateSettings({ visibility: option.value })}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all",
                      settingsForm.visibility === option.value
                        ? "border-brand-primary bg-brand-primary/5"
                        : "border-brand-line hover:border-brand-primary/30"
                    )}
                  >
                    <div
                      className={cn(
                        "p-1.5 rounded-lg",
                        settingsForm.visibility === option.value
                          ? "bg-brand-primary text-white"
                          : "bg-brand-soft text-brand-secondary"
                      )}
                    >
                      {option.icon}
                    </div>
                    <span className="text-sm font-bold text-brand-ink">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-brand-ink font-semibold">Max Members</Label>
                <Input
                  type="number"
                  value={settingsForm.max_members || ""}
                  onChange={(event) => updateSettings({ max_members: Number(event.target.value) })}
                  className="rounded-xl border-brand-line h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-brand-ink font-semibold">Retention (Days)</Label>
                <Input
                  type="number"
                  value={settingsForm.message_retention_days || ""}
                  onChange={(event) => updateSettings({ message_retention_days: Number(event.target.value) })}
                  className="rounded-xl border-brand-line h-11"
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl border border-brand-line">
              <div>
                <p className="text-sm font-bold text-brand-ink">Discoverable</p>
                <p className="text-xs text-brand-secondary">Show in channel browser</p>
              </div>
              <button
                type="button"
                onClick={() => updateSettings({ is_discoverable: !settingsForm.is_discoverable })}
                className={cn(
                  "w-10 h-6 rounded-full relative transition-colors duration-200",
                  settingsForm.is_discoverable ? "bg-brand-primary" : "bg-brand-line"
                )}
              >
                <div
                  className={cn(
                    "absolute top-1 size-4 rounded-full bg-white transition-all duration-200",
                    settingsForm.is_discoverable ? "left-5" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        </ScrollArea>
        <div className="px-6 py-5 border-t border-brand-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-2xl h-11 border-brand-line bg-white px-5 font-bold text-brand-ink hover:bg-brand-soft"
            onClick={selectedChannel?.is_archived ? onUnarchive : onArchive}
            disabled={isSavingSettings || isArchivingChannel}
          >
            {isArchivingChannel ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Updating...
              </>
            ) : selectedChannel?.is_archived ? (
              <>
                <ArchiveRestore className="mr-2 size-4" /> Unarchive
              </>
            ) : (
              <>
                <Archive className="mr-2 size-4" /> Archive
              </>
            )}
          </Button>
          <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            className="rounded-2xl h-11 px-6"
            onClick={() => onOpenChange(false)}
            disabled={isSavingSettings}
          >
            Cancel
          </Button>
          <Button
            className="rounded-2xl h-11 px-8 bg-brand-primary hover:bg-brand-primary/90 font-bold shadow-lg shadow-brand-primary/20"
            onClick={onSave}
            disabled={isSavingSettings}
          >
            {isSavingSettings ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Settings className="mr-2 size-4" /> Save Changes
              </>
            )}
          </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
