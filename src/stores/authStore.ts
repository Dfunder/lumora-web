import { create } from "zustand";
import { devtools } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

export type AuthStatus =
  | "idle"
  | "challenging"
  | "signing"
  | "verifying"
  | "authenticated"
  | "error";

// Refresh-token metadata kept only in the store (never serialised to cookies).
interface RefreshMeta {
  token: string;
  /** Sequence counter bumped on every rotation so stale tokens are detectable. */
  sequence: number;
  /** The token that was just used (to detect reuse after logout). */
  previousToken: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  /** Expose the current refresh token for the API layer. */
  refreshToken: string | null;
  isAuthenticated: boolean;
  status: AuthStatus;
  error: string | null;
  isReauthModalOpen: boolean;

  // -- Mutators --------------------------------------------------------------
  setAuth: (session: AuthSession) => void;
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  openReauthModal: () => void;
  closeReauthModal: () => void;
  /** Rotate the refresh token (called after a successful /auth/refresh). */
  rotateRefreshToken: (newRefreshToken: string) => void;
  clearAuth: () => void;
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

const STORAGE_KEY = "lumora_auth_session";

interface PersistedSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string | null;
  refreshSequence: number;
}

function persistSession(data: PersistedSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable — non-fatal
  }
}

function readPersistedSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedSession;
  } catch {
    return null;
  }
}

function removePersistedSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

function setAuthCookie(authenticated: boolean) {
  if (typeof document === "undefined") return;
  if (authenticated) {
    document.cookie = "lumora_auth=true; path=/; max-age=86400"; // 1 day
  } else {
    document.cookie =
      "lumora_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

// ---------------------------------------------------------------------------
// Internal state for refresh rotation (not exposed via the store)
// ---------------------------------------------------------------------------

let refreshMeta: RefreshMeta | null = null;

export function getRefreshToken(): string | null {
  return refreshMeta?.token ?? null;
}

export function getRefreshSequence(): number {
  return refreshMeta?.sequence ?? 0;
}

export function markRefreshUsed(oldToken: string): boolean {
  if (!refreshMeta || refreshMeta.token !== oldToken) return false;
  refreshMeta.previousToken = oldToken;
  return true;
}

export function applyRefreshRotation(
  newToken: string,
  newSequence?: number,
): boolean {
  if (!refreshMeta) return false;
  // Reject if the new token matches a previously-used token (reuse attack).
  if (
    refreshMeta.previousToken &&
    newToken === refreshMeta.previousToken
  ) {
    return false;
  }
  refreshMeta = {
    token: newToken,
    sequence: newSequence ?? refreshMeta.sequence + 1,
    previousToken: null,
  };
  return true;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => {
      // Attempt to restore session from localStorage on first access (SSR-safe).
      let restored: PersistedSession | null = null;
      if (typeof window !== "undefined") {
        restored = readPersistedSession();
      }

      if (restored) {
        refreshMeta = {
          token: restored.refreshToken ?? "",
          sequence: restored.refreshSequence ?? 0,
          previousToken: null,
        };
        // Defer cookie-setting to after React hydrates.
        queueMicrotask(() => setAuthCookie(true));
      }

      return {
        user: restored?.user ?? null,
        accessToken: restored?.accessToken ?? null,
        refreshToken: restored?.refreshToken ?? null,
        isAuthenticated: restored != null,
        status: restored != null ? "authenticated" : "idle",
        error: null,
        isReauthModalOpen: false,

        setAuth: ({ user, accessToken, refreshToken }) => {
          const seq = refreshMeta?.sequence ?? 0;
          refreshMeta = {
            token: refreshToken ?? "",
            sequence: seq,
            previousToken: null,
          };
          setAuthCookie(true);
          persistSession({
            user,
            accessToken,
            refreshToken: refreshToken ?? null,
            refreshSequence: seq,
          });
          set(
            {
              user,
              accessToken,
              refreshToken: refreshToken ?? null,
              isAuthenticated: true,
              status: "authenticated",
              error: null,
            },
            false,
            "auth/setAuth",
          );
        },

        setUser: (user) => set({ user }, false, "auth/setUser"),

        setStatus: (status) =>
          set({ status }, false, "auth/setStatus"),

        setError: (error) =>
          set({ error, status: "error" }, false, "auth/setError"),

        openReauthModal: () => {
          // Deduplicate: only open once even if multiple 401s fire.
          if (get().isReauthModalOpen) return;
          set({ isReauthModalOpen: true }, false, "auth/openReauthModal");
        },

        closeReauthModal: () =>
          set({ isReauthModalOpen: false }, false, "auth/closeReauthModal"),

        rotateRefreshToken: (newRefreshToken) => {
          const seq = (refreshMeta?.sequence ?? 0) + 1;
          refreshMeta = {
            token: newRefreshToken,
            sequence: seq,
            previousToken: refreshMeta?.token ?? null,
          };
          persistSession({
            user: get().user!,
            accessToken: get().accessToken!,
            refreshToken: newRefreshToken,
            refreshSequence: seq,
          });
          set({ refreshToken: newRefreshToken }, false, "auth/rotateRefreshToken");
        },

        clearAuth: () => {
          // Invalidate any outstanding refresh token so reuse is detectable.
          if (refreshMeta) {
            refreshMeta.previousToken = refreshMeta.token;
            refreshMeta = null;
          }
          setAuthCookie(false);
          removePersistedSession();
          set(
            {
              user: null,
              accessToken: null,
              refreshToken: null,
              isAuthenticated: false,
              status: "idle",
              error: null,
              isReauthModalOpen: false,
            },
            false,
            "auth/clearAuth",
          );
        },
      };
    },
    {
      name: "auth-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
