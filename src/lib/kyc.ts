import api from "@/lib/api";
import type { CreatorKycStatus } from "@/types/kyc";

export async function getCreatorKycStatus(
  creatorId: string,
): Promise<CreatorKycStatus> {
  const encodedCreatorId = encodeURIComponent(creatorId);
  const { data } = await api.get<CreatorKycStatus>(
    `/users/${encodedCreatorId}/kyc-status`,
  );

  return data;
}
