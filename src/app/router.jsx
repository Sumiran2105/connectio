import { useEffect, useRef } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AdminRoutes } from "@/features/admin-dashboard/routes";
import { LoginPage } from "@/features/auth/pages/login";
import { RegisterPage } from "@/features/auth/pages/register";
import { LandingPage } from "@/features/landing/pages/landing";
import { SuperAdminRoutes } from "@/features/super-admin-dashboard/routes";
import { UserRoutes } from "@/features/user-dashboard/routes";
import { useAuthStore } from "@/store/auth-store";

function SessionExpiryHandler() {
  const navigate = useNavigate();
  const session = useAuthStore((state) => state.session);
  const clearSession = useAuthStore((state) => state.clearSession);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!session?.accessToken) {
      return undefined;
    }

    if (!session?.expiresAt) {
      return undefined;
    }

    const msRemaining = session.expiresAt - Date.now();

    const redirectToLogin = () => {
      clearSession();
      toast.error("Your session has expired. Please sign in again.");
      navigate(
        session.role === "SUPER_ADMIN" ? "/login?mode=super-admin" : "/login?mode=workspace",
        { replace: true }
      );
    };

    if (msRemaining <= 0) {
      redirectToLogin();
      return undefined;
    }

    timeoutRef.current = window.setTimeout(() => {
      redirectToLogin();
    }, msRemaining);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [clearSession, navigate, session]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionExpiryHandler />
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
