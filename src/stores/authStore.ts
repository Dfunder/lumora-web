import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (session: AuthSession) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        setAuth: ({ user, accessToken }) =>
          set(
            { user, accessToken, isAuthenticated: true },
            false,
            "auth/setAuth",
          ),
        setUser: (user) => set({ user }, false, "auth/setUser"),
        clearAuth: () =>
          set(
            { user: null, accessToken: null, isAuthenticated: false },
            false,
            "auth/clearAuth",
          ),
      }),
      {
        name: "lumora-auth",
        partialize: ({ user, accessToken, isAuthenticated }) => ({
          user,
          accessToken,
          isAuthenticated,
        }),
      },
    ),
    {
      name: "auth-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
