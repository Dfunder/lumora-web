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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (typeof window !== "undefined" && !axios.isCancel(error)) {
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

export async function getAuthChallenge(address: string): Promise<ChallengeResponse> {
  const res = await api.post<ChallengeResponse>("/auth/challenge", { address });
  return res.data;
}

export async function verifyWalletSignature(
  address: string,
  signature: string,
): Promise<VerifyResponse> {
  const res = await api.post<VerifyResponse>("/auth/verify", { address, signature });
  return res.data;
}

export default api;
