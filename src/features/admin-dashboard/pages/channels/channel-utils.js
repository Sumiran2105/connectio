import * as z from "zod";

export const channelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric and dashes"),
  visibility: z.enum(["public", "private"]).default("public"),
  is_cross_team: z.boolean().default(false),
  description: z.string().optional(),
  company_id: z.string().uuid("Invalid Company ID"),
  team_id: z.string().uuid("Please select a team"),
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

export const DEFAULT_VALUES = {
  name: "",
  slug: "",
  visibility: "public",
  is_cross_team: false,
  description: "",
  company_id: "",
  team_id: "",
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

export const getTeamCompanyId = (team) =>
  team?.company_id ||
  team?.companyId ||
  team?.organization_id ||
  team?.organisation_id ||
  team?.tenant_id ||
  "";

export const getUserRecord = (record) =>
  record?.user ||
  record?.member ||
  record?.profile ||
  record?.account ||
  record;

export const getUserId = (record) => {
  const user = getUserRecord(record);
  return (
    record?.user_id ||
    record?.userId ||
    record?.member_id ||
    record?.memberId ||
    user?.id ||
    user?.user_id ||
    user?.uuid ||
    record?.id ||
    record?.uuid ||
    null
  );
};

export const getUserName = (record, fallbackId, role) => {
  const user = getUserRecord(record);
  return (
    user?.full_name ||
    user?.name ||
    user?.display_name ||
    user?.username ||
    user?.email ||
    record?.full_name ||
    record?.name ||
    record?.display_name ||
    record?.username ||
    record?.email ||
    (role?.toLowerCase?.() === "owner" ? "Channel admin" : null) ||
    (fallbackId ? `User ...${fallbackId.slice(-6)}` : "Unknown user")
  );
};

export const getUserEmail = (record) => {
  const user = getUserRecord(record);
  return user?.email || user?.mail || record?.email || record?.mail || "";
};

export const getUserAvatar = (record) => {
  const user = getUserRecord(record);
  return user?.avatar_url || user?.profile_picture || user?.image || record?.avatar_url || null;
};

export const getRoleLabel = (role) => {
  const normalized = String(role || "user").toLowerCase();
  if (normalized === "owner") return "Admin";
  return normalized.replace(/_/g, " ");
};
