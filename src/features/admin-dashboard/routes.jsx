import { Route, Navigate } from "react-router-dom";
import { AdminDashboardPage } from "./pages/admin-dashboard-page";
import { ChannelsPage } from "./pages/channels-page";
import { MeetingsPage } from "./pages/meetings-page";
import { TeamsPage } from "./pages/teams-page";
import { CompanyApprovals } from "./pages/company-approvals";
import { CompanyUsers } from "./pages/company-users";
import { InviteUser } from "./pages/invite-user";
import { SettingsPage } from "./pages/settings-page";
import { ChatPage } from "@/chat/pages/chat-page";
import { AdminMfaSetupPage } from "@/features/admin-auth/pages/admin-mfa-setup-page";
import { AdminMfaVerifyPage } from "@/features/admin-auth/pages/admin-mfa-verify-page";
import { useAuthStore } from "@/store/auth-store";

function ProtectedAdminRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (
    !session?.accessToken ||
    session?.role === "SUPER_ADMIN" ||
    session?.role === "USER"
  ) {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
}

function PendingMfaRoute({ children }) {
  const pendingMfaSession = useAuthStore((state) => state.pendingMfaSession);

  if (!pendingMfaSession?.mfaToken && !pendingMfaSession?.userId) {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
}

export const AdminRoutes = (
  <>
    <Route path="/admin/auth" element={<Navigate to="/login?mode=workspace" replace />} />
    <Route
      path="/admin/mfa/setup"
      element={
        <PendingMfaRoute>
          <AdminMfaSetupPage />
        </PendingMfaRoute>
      }
    />
    <Route
      path="/admin/mfa/verify"
      element={
        <PendingMfaRoute>
          <AdminMfaVerifyPage />
        </PendingMfaRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedAdminRoute>
          <AdminDashboardPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/users"
      element={
        <ProtectedAdminRoute>
          <CompanyUsers />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/approvals"
      element={
        <ProtectedAdminRoute>
          <CompanyApprovals />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/invite"
      element={
        <ProtectedAdminRoute>
          <InviteUser />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/chat"
      element={
        <ProtectedAdminRoute>
          <ChatPage layout="admin" />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/channels"
      element={
        <ProtectedAdminRoute>
          <ChannelsPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/teams"
      element={
        <ProtectedAdminRoute>
          <TeamsPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/meetings"
      element={
        <ProtectedAdminRoute>
          <MeetingsPage />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="/admin/dashboard/settings"
      element={
        <ProtectedAdminRoute>
          <SettingsPage />
        </ProtectedAdminRoute>
      }
    />
  </>
);
