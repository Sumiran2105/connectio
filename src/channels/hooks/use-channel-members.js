import { useEffect, useState } from "react";
import { CHANNEL_MEMBERS, COMPANY_USERS } from "@/config/api";
import { apiClient } from "@/lib/client";
import { getUserName, getUserEmail, getUserId, getUserAvatar, getUserRecord } from "@/channels/utils/channel-utils";

function getArrayPayload(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
}

/**
 * Normalize member data to ensure consistent structure
 * Extracts name, email, id, and avatar from various API response formats
 */
function normalizeMember(member, userMap = {}, index) {
  const id = getUserId(member);
  
  // First try to get enriched user data from the map
  const enrichedUserData = userMap[id];
  const profile = enrichedUserData || member;
  
  const name = getUserName(profile, id);
  const email = getUserEmail(profile);
  const avatar = getUserAvatar(profile);

  return {
    id: id || `member-${index}`,
    name: name || "Unknown User",
    email,
    avatar,
    raw: member, // Keep original data for reference
  };
}

/**
 * Hook to fetch and normalize channel members for mention suggestions
 */
export function useChannelMembers(channelId, options = {}) {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const accessToken = options.accessToken;

  useEffect(() => {
    if (!channelId || !accessToken) {
      setMembers([]);
      setError(null);
      return;
    }

    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };

        // Fetch channel members and company users in parallel
        const [membersResponse, usersResponse] = await Promise.allSettled([
          apiClient.get(CHANNEL_MEMBERS(channelId), { headers }),
          apiClient.get(COMPANY_USERS, { headers }),
        ]);

        // Extract members list from response
        let membersList = [];
        if (membersResponse.status === "fulfilled") {
          const data = membersResponse.value.data;
          if (Array.isArray(data)) {
            membersList = data;
          } else if (Array.isArray(data?.members)) {
            membersList = data.members;
          } else if (Array.isArray(data?.data)) {
            membersList = data.data;
          } else if (data?.data?.members && Array.isArray(data.data.members)) {
            membersList = data.data.members;
          }
        }

        // Build user map from company users for enrichment
        const userMap = {};
        if (usersResponse.status === "fulfilled") {
          const companyUsers = getArrayPayload(usersResponse.value.data, ["users", "items", "results"]);
          
          companyUsers.forEach((user) => {
            const userId = getUserId(user);
            if (userId) {
              userMap[userId] = getUserRecord(user);
            }
          });
        }

        // Normalize each member with enriched user data
        const normalizedMembers = membersList.map((member, index) =>
          normalizeMember(member, userMap, index)
        );

        setMembers(normalizedMembers);
      } catch (err) {
        console.error("Failed to fetch channel members:", err);
        setError(err.message || "Failed to fetch channel members");
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [channelId, accessToken]);

  return {
    members,
    isLoading,
    error,
  };
}
