import { Navigate, Route } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";
import { UserDashboardPage } from "./pages/user-dashboard-page";
import { UserPlaceholderPage } from "./pages/user-placeholder-page";
import { FilesPage } from "./pages/files-page";
import { ChatPage } from "@/chat/pages/chat-page";
import { MeetPage } from "./pages/meet-page";
import { CalendarPage } from "./pages/calendar-page";
import { AiPage } from "./pages/ai-page";
import { TeamsPage } from "./pages/teams-page";
import { ChannelsPage } from "./pages/channels-page";
import { SettingsPage } from "./pages/settings-page";
import { AdminMfaSetupPage } from "@/features/admin-auth/pages/admin-mfa-setup-page";
import { AdminMfaVerifyPage } from "@/features/admin-auth/pages/admin-mfa-verify-page";

function ProtectedUserRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (!session?.accessToken || session?.role !== "USER") {
    return <Navigate to="/login?mode=workspace" replace />;
  }

  return children;
}

function PendingMfaRoute({ children }) {
  const pendingMfaSession = useAuthStore((state) => state.pendingMfaSession);

  if (!pendingMfaSession?.mfaToken && !pendingMfaSession?.userId) {
    return <Navigate to="/login?mode=workspace" replace />;
  }

  return children;
}

export const UserRoutes = (
  <>
    <Route
      path="/user/mfa/setup"
      element={
        <PendingMfaRoute>
          <AdminMfaSetupPage />
        </PendingMfaRoute>
      }
    />
    <Route
      path="/user/mfa/verify"
      element={
        <PendingMfaRoute>
          <AdminMfaVerifyPage />
        </PendingMfaRoute>
      }
    />
    <Route
      path="/user/dashboard"
      element={
        <ProtectedUserRoute>
          <UserDashboardPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/chat"
      element={
        <ProtectedUserRoute>
          <ChatPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/meet"
      element={
        <ProtectedUserRoute>
          <MeetPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/channels"
      element={
        <ProtectedUserRoute>
          <ChannelsPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/teams"
      element={
        <ProtectedUserRoute>
          <TeamsPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/files"
      element={
        <ProtectedUserRoute>
          <FilesPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/calendar"
      element={
        <ProtectedUserRoute>
          <CalendarPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/ai"
      element={
        <ProtectedUserRoute>
          <AiPage />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/settings"
      element={
        <ProtectedUserRoute>
          <SettingsPage />
        </ProtectedUserRoute>
      }
    />
  </>
);
