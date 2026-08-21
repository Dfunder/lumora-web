import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

import {
  useAuthStore,
  getRefreshToken,
  applyRefreshRotation,
} from "@/stores/authStore";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

type QueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

/**
 * Shared API Client configured with the backend Base URL.
 * Automatically handles JWT injection via request interceptors and
 * handles automatic token refresh rotation with re-auth queueing upon receiving 401s.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the current access token to every request.
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Refresh-token rotation helpers
// ---------------------------------------------------------------------------

/**
 * Expected backend behavior for `/auth/refresh` used by the response interceptor:
 *
 * - Endpoint: POST /auth/refresh
 * - Request: { refreshToken: string }
 * - Response (200): { accessToken: string, refreshToken?: string }
 *
 * Notes:
 * - The backend MUST rotate refresh tokens: each successful refresh returns a new
 *   refresh token and invalidates the previous one. The client calls
 *   `applyRefreshRotation(newRefresh)` to detect reuse.
 * - If a rotated (blacklisted) token is presented the backend should return 401
 *   and treat this as a theft/reuse event (force logout and token invalidation).
 */

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

/**
 * Processes the queue of pending requests that failed with 401 during token refresh.
 * Re-runs them with the new access token if refresh succeeded, or rejects them if failed.
 */
function processQueue(error: unknown, token: string | null = null) {
  const pending = [...failedQueue];
  failedQueue = [];
  pending.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token);
    }
  });
}

/** 
 * Called after a successful wallet re-auth completes.
 * Resolves all queued requests with the new access token.
 */
export function resolveReauthQueue(token: string) {
  isRefreshing = false;
  processQueue(null, token);
}

/** 
 * Called when re-auth fails so queued requests are rejected.
 * Rejects all pending requests in the queue.
 */
export function rejectReauthQueue(
  error: unknown = new Error("Re-authentication failed"),
) {
  isRefreshing = false;
  processQueue(error, null);
}

/**
 * Response-interceptor behavior and deduplication summary:
 *
 * - When a request receives a 401 the interceptor attempts a single refresh
 *   flow. Concurrent requests that also receive 401 are queued until the
 *   refresh completes.
 * - If refresh succeeds the new access token is injected and queued requests
 *   are retried. If refresh fails the queued requests are rejected and the
 *   app opens the re-auth modal via `useAuthStore.getState().openReauthModal()`.
 */

// Friendly messages for known status codes.
function friendlyMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please try again.";
    case 401:
      return "Your session has expired. Please reconnect your wallet.";
    case 403:
      return "You don't have permission to perform that action.";
    case 404:
      return "The requested resource was not found.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Something went wrong on our end. Please try again later.";
    default:
      return "Something went wrong. Please try again.";
  }
}

// ---------------------------------------------------------------------------
// Response interceptor
// ---------------------------------------------------------------------------

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | (NonNullable<typeof error.config> & { _retry?: boolean })
      | undefined;

    // ----- 401 handling with refresh rotation & queue deduplication --------
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Another request is already refreshing — queue this one.
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
            // Token is null → refresh failed; reject this request.
            return Promise.reject(error);
          })
          .catch((err) => Promise.reject(err));
      }

      // First request to hit 401 — attempt a refresh.
      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        // No refresh token at all → force logout.
        isRefreshing = false;
        processQueue(error, null);
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().openReauthModal();
        toast.error("Your session has expired. Please reconnect your wallet.", {
          id: "session-expired",
        });
        return Promise.reject(error);
      }

      try {
        const res = await axios.post<{
          accessToken: string;
          refreshToken?: string;
        }>(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });

        const {
          accessToken: newAccess,
          refreshToken: newRefresh,
        } = res.data;

        // Apply rotation — reject if the token was reused after logout.
        const rotated = applyRefreshRotation(
          newRefresh ?? currentRefreshToken,
        );
        if (!rotated) {
          throw new Error("Refresh token reuse detected");
        }

        // Persist new tokens in the store.
        useAuthStore.getState().setAuth({
          user: useAuthStore.getState().user!,
          accessToken: newAccess,
          refreshToken: newRefresh ?? currentRefreshToken,
        });

        // Retry the original request with the new access token.
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clean up and send user to re-auth.
        isRefreshing = false;
        processQueue(refreshError, null);
        useAuthStore.getState().clearAuth();
        useAuthStore.getState().openReauthModal();
        toast.error("Your session has expired. Please reconnect your wallet.", {
          id: "session-expired",
        });
        return Promise.reject(refreshError);
      }
    }

    // ----- All other errors (non-401) ------------------------------------
    if (
      typeof window !== "undefined" &&
      !axios.isCancel(error) &&
      error.response?.status !== 401
    ) {
      const status = error.response?.status ?? 0;
      const rawMessage =
        error.response?.data?.message ??
        error.response?.data?.error;
      const message = rawMessage && rawMessage.length < 120
        ? rawMessage
        : friendlyMessage(status);

      const request = error.config;
      const toastId = [
        "api-error",
        request?.method,
        request?.url,
        status,
        message,
      ].join(":");

      toast.error(message, { id: toastId });
    }

    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Expected response structure from the challenge generation endpoint.
 */
export type ChallengeResponse = {
  challenge: string; // The random cryptographic challenge string (nonce)
  expiresAt: string; // ISO timestamp when the challenge expires (typically 5 mins)
};

/**
 * Expected response structure from the signature verification endpoint.
 */
export type VerifyResponse = {
  accessToken: string; // JWT access token used in Authorization headers
  refreshToken?: string; // JWT refresh token used for token rotation
  user: {
    id: string;
    email: string;
    name?: string;
    walletAddress: string;
  };
};

/**
 * Initiates the wallet authentication flow by requesting a cryptographic challenge
 * from the backend for the given Stellar public key.
 * 
 * Endpoint: POST /auth/challenge
 * Request Payload: { address: string }
 * Response: ChallengeResponse
 */
export async function getAuthChallenge(
  address: string,
): Promise<ChallengeResponse> {
  try {
    const res = await api.post<ChallengeResponse>("/auth/challenge", {
      address,
    });
    return res.data;
  } catch (err) {
    throw new Error(
      "Could not start wallet authentication. Please check your connection and try again.",
    );
  }
}

/**
 * Example curl request for challenge generation:
 *
 * curl -X POST "$NEXT_PUBLIC_API_URL/auth/challenge" -H "Content-Type: application/json" \
 *  -d '{"address":"G..."}'
 *
 * Expected success response:
 * {
 *   "challenge": "Sign this random challenge to log in: ...",
 *   "expiresAt": "2026-08-21T14:05:00.000Z"
 * }
 */

/**
 * Verifies the signed cryptographic challenge against the user's public address on the backend.
 * Returns the access token, refresh token, and user session details.
 * 
 * Endpoint: POST /auth/verify
 * Request Payload: { address: string, signature: string }
 * Response: VerifyResponse
 */
export async function verifyWalletSignature(
  address: string,
  signature: string,
): Promise<VerifyResponse> {
  try {
    const res = await api.post<VerifyResponse>("/auth/verify", {
      address,
      signature,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new Error(
        "Signature verification failed. Please try connecting your wallet again.",
      );
    }
    throw new Error(
      "Could not verify your wallet signature. Please try again.",
    );
  }
}

/**
 * Example curl request to verify a signature:
 *
 * curl -X POST "$NEXT_PUBLIC_API_URL/auth/verify" -H "Content-Type: application/json" \
 *  -d '{"address":"G...","signature":"base64-signature"}'
 *
 * Expected success response:
 * {
 *   "accessToken": "eyJ...",
 *   "refreshToken": "eyJ...",
 *   "user": { "id":"usr-123","walletAddress":"G..." }
 * }
 */

export async function getCampaignShares(campaignId: string): Promise<number> {
  try {
    const res = await api.get<{ shareCount?: number; shares?: number }>(
      `/campaigns/${campaignId}/shares`,
    );
    return res.data?.shareCount ?? res.data?.shares ?? 0;
  } catch {
    return 0;
  }
}

export async function incrementCampaignShare(
  campaignId: string,
): Promise<{ shareCount: number }> {
  try {
    const res = await api.post<{ shareCount?: number; shares?: number }>(
      `/campaigns/${campaignId}/share`,
    );
    const shareCount = res.data?.shareCount ?? res.data?.shares ?? 1;
    return { shareCount };
  } catch {
    return { shareCount: 1 };
  }
}

export async function getRelatedCampaigns(
  campaignId: string,
  category?: string,
): Promise<Record<string, unknown>[]> {
  try {
    const res = await api.get(`/campaigns/${campaignId}/recommendations`);
    return Array.isArray(res.data)
      ? (res.data as Record<string, unknown>[])
      : Array.isArray(res.data?.data)
        ? (res.data.data as Record<string, unknown>[])
        : [];
  } catch {
    try {
      const fallbackRes = await api.get("/campaigns", {
        params: {
          category,
          limit: 4,
          status: "active",
        },
      });
      const items = Array.isArray(fallbackRes.data)
        ? (fallbackRes.data as Record<string, unknown>[])
        : Array.isArray(fallbackRes.data?.data)
          ? (fallbackRes.data.data as Record<string, unknown>[])
          : [];
      return items
        .filter((item) => String(item.id) !== String(campaignId))
        .slice(0, 3);
    } catch {
      return [];
    }
  }
}

export default api;
