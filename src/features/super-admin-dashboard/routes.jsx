import { Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AddCompanyPage } from "./pages/add-company";
import { CompaniesPage } from "./pages/companies";
import { CompanyAdminsPage } from "./pages/company-admins";
import { PendingCompaniesPage } from "./pages/pending-companies";
import { SuperAdminDashboardPage } from "./pages/super-admin-dashboard-page";
import { SendNotificationsPage } from "./pages/send-notifications-page";
import { AnalyticsPage } from "./pages/analytics-page";
import { SettingsPage } from "./pages/settings-page";
import { BillingPage } from "./pages/billing";
import { ActivateAdminPage } from "./pages/activate-admin";
import { useAuthStore } from "@/store/auth-store";

function ProtectedSuperAdminRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (!session?.accessToken) {
    return <Navigate to="/super-admin/auth" replace />;
  }

  return children;
}

export const SuperAdminRoutes = (
  <>
    <Route path="/super-admin/auth" element={<Navigate to="/login?mode=super-admin" replace />} />
    <Route path="/auth/activate" element={<ActivateAdminPage />} />
    <Route
      path="/super-admin/dashboard"
      element={
        <ProtectedSuperAdminRoute>
          <SuperAdminDashboardPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/pending-companies"
      element={
        <ProtectedSuperAdminRoute>
          <PendingCompaniesPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/companies"
      element={
        <ProtectedSuperAdminRoute>
          <CompaniesPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/companies/create"
      element={
        <ProtectedSuperAdminRoute>
          <AddCompanyPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/admins"
      element={
        <ProtectedSuperAdminRoute>
          <CompanyAdminsPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/billing"
      element={
        <ProtectedSuperAdminRoute>
          <BillingPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/notifications"
      element={
        <ProtectedSuperAdminRoute>
          <SendNotificationsPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/analytics"
      element={
        <ProtectedSuperAdminRoute>
          <AnalyticsPage />
        </ProtectedSuperAdminRoute>
      }
    />
    <Route
      path="/super-admin/dashboard/settings"
      element={
        <ProtectedSuperAdminRoute>
          <SettingsPage />
        </ProtectedSuperAdminRoute>
      }
    />
  </>
);
