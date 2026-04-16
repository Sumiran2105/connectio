export const AUTH_LOGIN = "/auth/login";
export const AUTH_LOGIN_MFA = "/auth/login/mfa";
export const AUTH_MFA_SETUP = "/auth/mfa/setup";
export const AUTH_MFA_VERIFY = "/auth/mfa/verify";
export const AUTH_ADMIN_REGISTER = "/auth/admin-register";
export const AUTH_REGISTER = "/auth/register";
export const AUTH_VERIFY_OTP = (companyId) => `/auth/verify-otp/${companyId}`;
export const AUTH_RESEND_OTP = (companyId) => `/auth/resend-otp/${companyId}`;

export const SUPERADMIN_CREATE_COMPANY = "/superadmin/create-company";
export const SUPERADMIN_VERIFY_COMPANY_OTP = (companyId) => `/superadmin/verify-otp/${companyId}`;
export const SUPERADMIN_RESEND_COMPANY_OTP = (companyId) => `/superadmin/resend-otp/${companyId}`;
export const SUPERADMIN_APPROVE_COMPANY = (companyId) =>
  `/superadmin/companies/${companyId}/approve`;
export const SUPERADMIN_ACTIVATE_COMPANY_ADMIN = "/superadmin/activate";
export const SUPERADMIN_COMPANIES = "/superadmin/companies";
export const SUPERADMIN_PENDING_COMPANIES = "/superadmin/companies/pending";
export const SUPERADMIN_REJECT_COMPANY = (companyId) => `/superadmin/companies/${companyId}/reject`;
export const SUPERADMIN_DASHBOARD_OVERVIEW = "/superadmin/dashboard";

export const COMPANY_PENDING_USERS = "/company/users/pending";
export const COMPANY_USERS = "/company/users";
export const COMPANY_INVITE_USER = "/company/users/invite";
export const COMPANY_APPROVE_USER = (userId) => `/company/users/${userId}/approve`;
export const COMPANY_REJECT_USER = (userId) => `/company/users/${userId}/reject`;

export const TEAMS_CREATE = "/teams/";
export const TEAMS_LIST = "/teams/";
export const USERS_SEARCH = "/api/v1/dm/users/search";
export const TEAMS_MEMBERS = (teamId) => `/teams/${teamId}/members`;
export const TEAMS_ADD_MEMBER = (teamId) => `/teams/${teamId}/members`;
export const TEAMS_ASSIGN_LEAD = (teamId) => `/teams/${teamId}/assign-admin`;
export const TEAMS_REMOVE_MEMBER = (teamId, userId) => `/teams/${teamId}/members/${userId}`;

export const PRESENCE_OPTIONS = "/api/v1/presence/options";
export const PRESENCE_ME = "/api/v1/presence/me";
export const PRESENCE_STATUS = "/api/v1/presence/status";
export const PRESENCE_CUSTOM_STATUS = "/api/v1/presence/custom-status";

export const DM_USERS_SEARCH = "/api/v1/dm/users/search";
export const DM_SEND_MESSAGE = (targetUserId) => `/api/v1/dm/${targetUserId}`;

export const CHANNEL_MESSAGES = (channelId) => `/api/v1/channels/${channelId}/messages`;
export const CHANNEL_MESSAGE = (channelId, messageId) =>
  `/api/v1/channels/${channelId}/messages/${messageId}`;

export function CHAT_WEBSOCKET(channelId) {
  if (!channelId) {
    return null;
  }

  const explicitWsBase = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, "");

  if (explicitWsBase) {
    return `${explicitWsBase}/ws/chat/${channelId}`;
  }

  if (import.meta.env.DEV && typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/backend-ws/chat/${channelId}`;
  }

  const apiBase =
    (import.meta.env.VITE_API_BASE_URL || "https://collabration-teams.onrender.com").replace(/\/$/, "");

  return `${apiBase.replace(/^http/, "ws")}/ws/chat/${channelId}`;
}
