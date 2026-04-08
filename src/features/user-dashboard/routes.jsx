import { Navigate, Route } from "react-router-dom";

import { useAuthStore } from "@/store/auth-store";
import { UserDashboardPage } from "./pages/user-dashboard-page";
import { UserPlaceholderPage } from "./pages/user-placeholder-page";

function ProtectedUserRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (!session?.accessToken || session?.role !== "USER") {
    return <Navigate to="/login?mode=workspace" replace />;
  }

  return children;
}

export const UserRoutes = (
  <>
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
          <UserPlaceholderPage
            title="Chat"
            description="This page is ready for the upcoming chat workspace."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/meet"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="Meet"
            description="This page is ready for meetings and video collaboration."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/channels"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="Channels"
            description="This page is ready for user channel participation."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/teams"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="Teams"
            description="This page is ready for user team collaboration."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/files"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="Files"
            description="This page is ready for file browsing and sharing."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/calendar"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="Calendar"
            description="This page is ready for schedules and calendar events."
          />
        </ProtectedUserRoute>
      }
    />
    <Route
      path="/user/dashboard/ai"
      element={
        <ProtectedUserRoute>
          <UserPlaceholderPage
            title="AI"
            description="This page is ready for AI summaries, prompts, and assistance."
          />
        </ProtectedUserRoute>
      }
    />
  </>
);
