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
export const SUPERADMIN_COMPANY_ADMINS = "/superadmin/Company Admins";
export const SUPERADMIN_PENDING_COMPANIES = "/superadmin/companies/pending";
export const SUPERADMIN_REJECT_COMPANY = (companyId) => `/superadmin/companies/${companyId}/reject`;
export const SUPERADMIN_DASHBOARD_OVERVIEW = "/superadmin/dashboard";

export const COMPANY_PENDING_USERS = "/company/users/pending";
export const COMPANY_USERS = "/company/users";
export const COMPANY_INVITE_USER = "/company/users/invite";
export const COMPANY_APPROVE_USER = (userId) => `/company/users/${userId}/approve`;
export const COMPANY_REJECT_USER = (userId) => `/company/users/${userId}/reject`;
