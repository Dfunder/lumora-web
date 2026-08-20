"use client";

import { useQuery } from "@tanstack/react-query";

import { getCreatorKycStatus } from "@/lib/kyc";
import { queryKeys } from "@/lib/queryKeys";

export const KYC_STATUS_REFRESH_INTERVAL_MS = 5 * 60 * 1_000;

export function useCreatorKycStatus(creatorId: string) {
  return useQuery({
    queryKey: queryKeys.kyc.creatorStatus(creatorId),
    queryFn: () => getCreatorKycStatus(creatorId),
    enabled: creatorId.length > 0,
    staleTime: KYC_STATUS_REFRESH_INTERVAL_MS,
    refetchInterval: KYC_STATUS_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: "always",
  });
}
