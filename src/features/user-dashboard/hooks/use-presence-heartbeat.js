import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { PRESENCE_HEARTBEAT } from "@/config/api";
import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/store/auth-store";

const HEARTBEAT_INTERVAL_MS = 60 * 1000;

function isPlatformVisible() {
  return typeof document === "undefined" || document.visibilityState === "visible";
}

export function usePresenceHeartbeat() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.session?.accessToken);
  const role = useAuthStore((state) => state.session?.role);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!accessToken || role === "SUPER_ADMIN") {
      return undefined;
    }

    let disposed = false;

    async function sendHeartbeat() {
      if (disposed || inFlightRef.current || !isPlatformVisible()) {
        return;
      }

      inFlightRef.current = true;

      try {
        await apiClient.post(PRESENCE_HEARTBEAT, null, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        queryClient.invalidateQueries({ queryKey: ["presence-me"] });
      } catch {
        // Presence should never interrupt the user's current workflow.
      } finally {
        inFlightRef.current = false;
      }
    }

    void sendHeartbeat();

    const heartbeatTimer = window.setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (isPlatformVisible()) {
        void sendHeartbeat();
      }
    };

    window.addEventListener("focus", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(heartbeatTimer);
      window.removeEventListener("focus", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accessToken, queryClient, role]);
}
