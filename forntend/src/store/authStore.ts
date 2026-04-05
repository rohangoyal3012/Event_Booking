import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ORGANIZER" | "ADMIN";
  avatarUrl?: string | null;
  isVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, accessToken: string) => void;
  updateUser: (data: Partial<AuthUser>) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  isOrganizer: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),

      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      clearAuth: () => set({ user: null, accessToken: null }),

      isAuthenticated: () => !!get().accessToken && !!get().user,

      isAdmin: () => get().user?.role === "ADMIN",

      isOrganizer: () =>
        get().user?.role === "ORGANIZER" || get().user?.role === "ADMIN",
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
      // accessToken intentionally NOT persisted — stays in memory for security
    },
  ),
);
