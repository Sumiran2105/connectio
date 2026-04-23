import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { apiClient } from "@/lib/client";
import {
  CHANNEL_MEMBERS,
  CHANNEL_MEMBERS_BULK,
  CHANNEL_UPDATE,
  CHANNELS_CREATE,
  CHANNELS_DELETE,
  CHANNELS_LIST,
  COMPANY_USERS,
  TEAMS_LIST,
  TEAMS_MEMBERS,
  USERS_SEARCH,
} from "@/config/api";
import {
  DEFAULT_VALUES,
  channelSchema,
  getChannelId,
  getTeamCompanyId,
  getUserId,
  getUserRecord,
  normalizeChannel,
} from "./channel-utils";

function getArrayPayload(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
}

function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useAdminChannels({ session }) {
  const token = session?.accessToken;
  const headers = useMemo(() => getAuthHeaders(token), [token]);

  const [teams, setTeams] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isFetchingTeamMembers, setIsFetchingTeamMembers] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [memberRole, setMemberRole] = useState("member");
  const [addMemberSource, setAddMemberSource] = useState("team");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [channelMembers, setChannelMembers] = useState([]);
  const [isFetchingChannelMembers, setIsFetchingChannelMembers] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeletingChannel, setIsDeletingChannel] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const form = useForm({
    resolver: zodResolver(channelSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset, setValue, watch } = form;
  const selectedTeamId = watch("team_id");
  const selectedTeam = teams.find((team) => team.id === selectedTeamId);

  useEffect(() => {
    if (!token) return;

    const loadTeams = async () => {
      try {
        const response = await apiClient.get(TEAMS_LIST, { headers });
        const rawTeams = getArrayPayload(response.data, ["departments", "items"]);
        const normalizedTeams = rawTeams.map((team) => ({
          ...team,
          id: team.id || team.team_id || team.uuid || team.department_id,
          name: team.name || team.department_name || "Unnamed Team",
        }));

        setTeams(normalizedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
        toast.error("Failed to load teams.");
      }
    };

    loadTeams();
  }, [headers, token]);

  useEffect(() => {
    if (!token) return;

    const loadChannels = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(CHANNELS_LIST, { headers });
        const channelData = getArrayPayload(response.data, ["items", "channels"])
          .map(normalizeChannel)
          .filter((channel) => channel.id);

        setChannels(channelData);
        setSelectedChannel((current) => {
          const currentId = getChannelId(current);
          if (currentId && channelData.some((channel) => channel.id === currentId)) {
            return normalizeChannel(current);
          }
          return channelData[0] || null;
        });
      } catch (error) {
        console.error("Error fetching channels:", error);
        toast.error("Failed to load channels.");
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, [headers, token]);

  useEffect(() => {
    const companyId = session?.company_id || getTeamCompanyId(selectedTeam);
    if (companyId) {
      setValue("company_id", companyId, { shouldValidate: true });
    }
  }, [selectedTeam, session?.company_id, setValue]);

  useEffect(() => {
    if (teams.length && !selectedTeamId) {
      setValue("team_id", teams[0].id, { shouldValidate: true });
    }
  }, [selectedTeamId, setValue, teams]);

  useEffect(() => {
    if (!isCreateOpen) return;

    reset({
      ...DEFAULT_VALUES,
      company_id: session?.company_id || getTeamCompanyId(teams[0]) || "",
      team_id: teams[0]?.id || "",
    });
  }, [isCreateOpen, reset, session?.company_id, teams]);

  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName !== "name") return;

      const slug = String(value.name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setValue("slug", slug);
    });

    return () => subscription.unsubscribe();
  }, [form, setValue]);

  useEffect(() => {
    const subscription = form.watch((value, { name: fieldName }) => {
      if (fieldName === "visibility") {
        setValue("is_private", value.visibility === "private");
      }
    });

    return () => subscription.unsubscribe();
  }, [form, setValue]);

  useEffect(() => {
    if (!isAddMemberOpen || addMemberSource !== "other") return;

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
          headers,
        });

        if (isActive) {
          setTeamMembers(getArrayPayload(response.data, ["users", "items", "results"]));
        }
      } catch (error) {
        if (!isActive) return;
        console.error("Error searching users:", error);
        setTeamMembers([]);
        setAddMemberError("Failed to search workspace users.");
      } finally {
        if (isActive) setIsFetchingTeamMembers(false);
      }
    }, 300);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [addMemberSource, headers, isAddMemberOpen, memberSearchQuery]);

  const handleCreateChannel = async (data) => {
    try {
      const payload = {
        ...data,
        is_private: data.visibility === "private",
        parent_channel_id: data.parent_channel_id || null,
      };

      const response = await apiClient.post(CHANNELS_CREATE, payload, { headers });
      const newChannel = normalizeChannel(response.data);

      setChannels((current) => [...current, newChannel]);
      setSelectedChannel(newChannel);
      setIsCreateOpen(false);
      toast.success("Channel created successfully.");
    } catch (error) {
      console.error("Error creating channel:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to create channel.");
    }
  };

  const handleInvalidCreate = (errors) => {
    toast.error(
      errors.team_id?.message ||
        errors.company_id?.message ||
        errors.name?.message ||
        errors.slug?.message ||
        "Please fill all required channel details."
    );
  };

  const openAddMemberDialog = async (source = "team") => {
    if (!selectedChannel) return;

    if (source === "other" && !selectedChannel.is_cross_team) {
      toast.error("Enable cross-functional access before adding users from other teams.");
      return;
    }

    setAddMemberError("");
    setMemberSearchQuery("");
    setSelectedMemberIds(new Set());
    setMemberRole("member");
    setAddMemberSource(source);
    setTeamMembers([]);
    setIsAddMemberOpen(true);

    if (source === "other") return;

    if (!selectedChannel.team_id) {
      setAddMemberError("This channel is not linked to a team.");
      return;
    }

    setIsFetchingTeamMembers(true);
    try {
      const response = await apiClient.get(TEAMS_MEMBERS(selectedChannel.team_id), { headers });
      setTeamMembers(getArrayPayload(response.data, ["members", "items", "users"]));
    } catch (error) {
      console.error("Error fetching team members:", error);
      setAddMemberError("Failed to load team members.");
    } finally {
      setIsFetchingTeamMembers(false);
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleAddMembers = async () => {
    const channelId = getChannelId(selectedChannel);
    const userIds = Array.from(selectedMemberIds);
    if (!channelId || userIds.length === 0) return;

    setIsAddingMember(true);
    setAddMemberError("");

    try {
      if (userIds.length === 1) {
        await apiClient.post(
          CHANNEL_MEMBERS(channelId),
          { user_id: userIds[0], role: memberRole },
          { headers }
        );
      } else {
        await apiClient.post(CHANNEL_MEMBERS_BULK(channelId), userIds, { headers });
      }

      setIsAddMemberOpen(false);
      setSelectedMemberIds(new Set());
      toast.success(userIds.length === 1 ? "Member added." : `${userIds.length} members added.`);
    } catch (error) {
      console.error("Error adding members:", error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item?.msg || JSON.stringify(item)).join("; ")
        : detail || error.response?.data?.message || "Failed to add members.";
      setAddMemberError(message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const openMembersPanel = async () => {
    const channelId = getChannelId(selectedChannel);
    if (!channelId) return;

    setChannelMembers([]);
    setIsMembersOpen(true);
    setIsFetchingChannelMembers(true);

    try {
      const [membersResponse, teamResponse, usersResponse] = await Promise.allSettled([
        apiClient.get(CHANNEL_MEMBERS(channelId), { headers }),
        selectedChannel.team_id
          ? apiClient.get(TEAMS_MEMBERS(selectedChannel.team_id), { headers })
          : Promise.resolve({ data: [] }),
        apiClient.get(COMPANY_USERS, { headers }),
      ]);

      const memberships = getArrayPayload(membersResponse.value?.data, ["members", "items"]);
      const sameTeamUsers = getArrayPayload(teamResponse.value?.data, ["members", "items", "users"]);
      const companyUsers = getArrayPayload(usersResponse.value?.data, ["users", "items", "results"]);
      const userMap = {};

      [...sameTeamUsers, ...companyUsers].forEach((user) => {
        const userId = getUserId(user);
        if (userId) userMap[userId] = getUserRecord(user);
      });

      setChannelMembers(
        memberships.map((member) => ({
          ...member,
          _user: userMap[getUserId(member)] || null,
        }))
      );
    } catch (error) {
      console.error("Error fetching channel members:", error);
      toast.error("Failed to load channel members.");
    } finally {
      setIsFetchingChannelMembers(false);
    }
  };

  const handleDeleteChannel = async () => {
    const channelId = getChannelId(selectedChannel);
    if (!channelId) {
      toast.error("Unable to delete this channel because its id is missing.");
      return;
    }

    setIsDeletingChannel(true);
    try {
      await apiClient.delete(CHANNELS_DELETE(channelId), { headers });
      setChannels((current) => {
        const nextChannels = current.filter((channel) => getChannelId(channel) !== channelId);
        setSelectedChannel(nextChannels[0] || null);
        return nextChannels;
      });
      setIsDeleteOpen(false);
      toast.success("Channel deleted.");
    } catch (error) {
      console.error("Error deleting channel:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to delete channel.");
    } finally {
      setIsDeletingChannel(false);
    }
  };

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
    const channelId = getChannelId(selectedChannel);
    if (!channelId) return;

    setIsSavingSettings(true);
    try {
      const payload = {
        ...settingsForm,
        is_private: settingsForm.visibility === "private",
      };
      const response = await apiClient.patch(CHANNEL_UPDATE(channelId), payload, { headers });
      const updatedChannel = normalizeChannel(response.data);

      setChannels((current) =>
        current.map((channel) =>
          getChannelId(channel) === channelId ? { ...channel, ...updatedChannel } : channel
        )
      );
      setSelectedChannel((current) => ({ ...current, ...updatedChannel }));
      setIsSettingsOpen(false);
      toast.success("Channel settings saved.");
    } catch (error) {
      console.error("Error updating channel:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  return {
    channelState: {
      channels,
      selectedChannel,
      isLoading,
    },
    sidebarState: {
      isSidebarOpen,
      setIsSidebarOpen,
      createDialog: {
        open: isCreateOpen,
        onOpenChange: setIsCreateOpen,
        teams,
        form,
        onSubmit: handleCreateChannel,
        onInvalidSubmit: handleInvalidCreate,
      },
    },
    memberDialog: {
      open: isAddMemberOpen,
      onOpenChange: setIsAddMemberOpen,
      teamMembers,
      isFetchingTeamMembers,
      memberSearchQuery,
      setMemberSearchQuery,
      selectedMemberIds,
      memberRole,
      setMemberRole,
      addMemberSource,
      isAddingMember,
      addMemberError,
      toggleMemberSelection,
      handleAddMembers,
    },
    membersDialog: {
      open: isMembersOpen,
      onOpenChange: setIsMembersOpen,
      channelMembers,
      isFetchingChannelMembers,
    },
    deleteDialog: {
      open: isDeleteOpen,
      onOpenChange: setIsDeleteOpen,
      isDeletingChannel,
      onDelete: handleDeleteChannel,
    },
    settingsDialog: {
      open: isSettingsOpen,
      onOpenChange: setIsSettingsOpen,
      settingsForm,
      setSettingsForm,
      isSavingSettings,
      onSave: handleUpdateChannel,
    },
    actions: {
      setSelectedChannel,
      openAddMemberDialog,
      openMembersPanel,
      openSettings,
    },
  };
}
