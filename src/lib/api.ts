import axios, { type AxiosError } from "axios";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/authStore";

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

interface QueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const resolveReauthQueue = (token: string) => {
  isRefreshing = false;
  processQueue(null, token);
};

export const rejectReauthQueue = (
  error: unknown = new Error("Re-authentication failed"),
) => {
  isRefreshing = false;
  processQueue(error, null);
};

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as
      | (NonNullable<typeof error.config> & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Trigger re-auth modal
      useAuthStore.getState().setReauthModalOpen(true);
      toast.error("Session expired. Please reconnect your wallet.", {
        id: "session-expired",
      });

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    if (
      typeof window !== "undefined" &&
      !axios.isCancel(error) &&
      error.response?.status !== 401
    ) {
      const message =
        error.response?.data?.message ??
        error.response?.data?.error ??
        error.message ??
        "Something went wrong. Please try again.";
      const request = error.config;
      const toastId = [
        "api-error",
        request?.method,
        request?.url,
        error.response?.status,
        message,
      ].join(":");

      toast.error(message, { id: toastId });
    }

    return Promise.reject(error);
  },
);

export type ChallengeResponse = {
  challenge: string;
  expiresAt: string;
};

export type VerifyResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    walletAddress: string;
  };
};

export async function getAuthChallenge(
  address: string,
): Promise<ChallengeResponse> {
  const res = await api.post<ChallengeResponse>("/auth/challenge", { address });
  return res.data;
}

export async function verifyWalletSignature(
  address: string,
  signature: string,
): Promise<VerifyResponse> {
  const res = await api.post<VerifyResponse>("/auth/verify", {
    address,
    signature,
  });
  return res.data;
}

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
