import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { usePresenceHeartbeat } from "@/features/user-dashboard/hooks/use-presence-heartbeat";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function PresenceHeartbeat() {
  usePresenceHeartbeat();
  return null;
}

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PresenceHeartbeat />
      {children}
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
