import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { CHANNELS_MY_CHANNELS } from "@/config/api";
import { apiClient } from "@/lib/client";

function normalizeChannels(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.channels)) {
    return data.channels;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function buildChannelView(channel, index) {
  const name = channel?.name || channel?.channel_name || `channel-${index + 1}`;
  const description =
    channel?.description ||
    channel?.purpose ||
    channel?.topic ||
    "No channel description available yet.";
  const memberCount =
    channel?.members_count ||
    channel?.member_count ||
    channel?.members?.length ||
    0;
  const teamName =
    channel?.team_name || channel?.team?.name || channel?.workspace_name || "Workspace channel";
  const isPrivate = Boolean(channel?.private || channel?.is_private);

  return {
    id: channel?.id || channel?.channel_id || `${name}-${index}`,
    name,
    description,
    memberCount,
    isPrivate,
    teamName,
    visibilityLabel: isPrivate ? "Private" : "Public",
  };
}

export function useUserChannels({ accessToken }) {
  const [search, setSearch] = useState("");
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const channelsQuery = useQuery({
    queryKey: ["my-channels", accessToken],
    queryFn: async () => {
      const response = await apiClient.get(CHANNELS_MY_CHANNELS, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return normalizeChannels(response.data).map(buildChannelView);
    },
    enabled: Boolean(accessToken),
    staleTime: 30 * 1000,
  });

  const channels = channelsQuery.data || [];

  const filteredChannels = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) {
      return channels;
    }

    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query) ||
        channel.teamName.toLowerCase().includes(query)
    );
  }, [channels, deferredSearch]);

  const activeChannel =
    filteredChannels.find((channel) => channel.id === activeChannelId) ||
    channels.find((channel) => channel.id === activeChannelId) ||
    filteredChannels[0] ||
    channels[0] ||
    null;

  useEffect(() => {
    if (!activeChannelId && channels[0]) {
      setActiveChannelId(channels[0].id);
    }
  }, [activeChannelId, channels]);

  const openChannel = (channel) => {
    setActiveChannelId(channel.id);
    setIsMobilePanelOpen(true);
  };

  return {
    channelState: {
      filteredChannels,
      activeChannel,
      isLoading: channelsQuery.isLoading,
      isError: channelsQuery.isError,
    },
    sidebarState: {
      search,
      setSearch,
      isMobilePanelOpen,
      setIsMobilePanelOpen,
      openChannel,
    },
  };
}
