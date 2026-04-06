import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AddCompanyAdminPage } from "@/features/super-admin-dashboard/pages/add-company-admin-page";
import { CreateCompanyPage } from "@/features/super-admin-dashboard/pages/create-company-page";
import { AdminDashboardPage } from "@/features/admin-dashboard/pages/admin-dashboard-page";
import { AdminLoginPage } from "@/features/admin-auth/pages/admin-login-page";
import { AdminMfaSetupPage } from "@/features/admin-auth/pages/admin-mfa-setup-page";
import { AdminMfaVerifyPage } from "@/features/admin-auth/pages/admin-mfa-verify-page";
import { SuperAdminAuthPage } from "@/features/super-admin-auth/pages/super-admin-auth-page";
import { SuperAdminDashboardPage } from "@/features/super-admin-dashboard/pages/super-admin-dashboard-page";
import { useAuthStore } from "@/store/auth-store";

function ProtectedSuperAdminRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (!session?.accessToken) {
    return <Navigate to="/super-admin/auth" replace />;
  }

  return children;
}

function ProtectedAdminRoute({ children }) {
  const session = useAuthStore((state) => state.session);

  if (!session?.accessToken || session?.role === "SUPER_ADMIN") {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
}

function PendingMfaRoute({ children }) {
  const pendingMfaSession = useAuthStore((state) => state.pendingMfaSession);

  if (!pendingMfaSession?.accessToken) {
    return <Navigate to="/admin/auth" replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
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
        <Route path="/super-admin/auth" element={<SuperAdminAuthPage />} />
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedSuperAdminRoute>
              <SuperAdminDashboardPage />
            </ProtectedSuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/dashboard/companies/create"
          element={
            <ProtectedSuperAdminRoute>
              <CreateCompanyPage />
            </ProtectedSuperAdminRoute>
          }
        />
        <Route
          path="/super-admin/dashboard/admins/create"
          element={
            <ProtectedSuperAdminRoute>
              <AddCompanyAdminPage />
            </ProtectedSuperAdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
