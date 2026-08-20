export type KycStatus =
  | "not_started"
  | "pending"
  | "passed"
  | "failed"
  | "expired";

export interface CreatorKycStatus {
  status: KycStatus;
  updatedAt: string;
}
