import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  walletAddress?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
}

export type AuthStatus = "idle" | "challenging" | "signing" | "verifying" | "authenticated" | "error";

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
  isReauthModalOpen: boolean;
  setAuth: (session: AuthSession) => void;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  setReauthModalOpen: (isOpen: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      status: "idle",
      error: null,
      isReauthModalOpen: false,
      setAuth: ({ user, accessToken }) => {
        if (typeof document !== "undefined") {
          document.cookie = "lumora_auth=true; path=/; max-age=86400"; // 1 day
        }
        set(
          { user, accessToken, isAuthenticated: true, status: "authenticated", error: null },
          false,
          "auth/setAuth",
        );
      },
      setUser: (user) => set({ user }, false, "auth/setUser"),
      setStatus: (status) => set({ status }, false, "auth/setStatus"),
      setError: (error) => set({ error, status: "error" }, false, "auth/setError"),
      setReauthModalOpen: (isReauthModalOpen) => set({ isReauthModalOpen }, false, "auth/setReauthModalOpen"),
      clearAuth: () => {
        if (typeof document !== "undefined") {
          document.cookie = "lumora_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set(
          { user: null, accessToken: null, isAuthenticated: false, status: "idle", error: null },
          false,
          "auth/clearAuth",
        );
      },
    }),
    {
      name: "auth-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
