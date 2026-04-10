import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      session: null,
      pendingMfaSession: null,
      setSession: (session) =>
        set({
          session: session
            ? {
                ...session,
                expiresAt:
                  session.expiresAt ||
                  (session.expiresIn
                    ? Date.now() + Number(session.expiresIn) * 1000
                    : null),
              }
            : null,
        }),
      setPendingMfaSession: (pendingMfaSession) =>
        set((state) => ({
          pendingMfaSession: {
            ...state.pendingMfaSession,
            ...pendingMfaSession,
          },
        })),
      clearPendingMfaSession: () => set({ pendingMfaSession: null }),
      clearSession: () => set({ session: null, pendingMfaSession: null }),
    }),
    {
      name: "conectio-auth",
      partialize: (state) => ({
        session: state.session,
        pendingMfaSession: state.pendingMfaSession,
      }),
    }
  )
);
