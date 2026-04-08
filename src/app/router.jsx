import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminRoutes } from "@/features/admin-dashboard/routes";
import { LoginPage } from "@/features/auth/pages/login";
import { RegisterPage } from "@/features/auth/pages/register";
import { LandingPage } from "@/features/landing/pages/landing";
import { SuperAdminRoutes } from "@/features/super-admin-dashboard/routes";
import { UserRoutes } from "@/features/user-dashboard/routes";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {AdminRoutes}
        {UserRoutes}
        {SuperAdminRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
