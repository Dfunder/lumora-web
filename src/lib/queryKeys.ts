export interface WalletQueryFilters {
  ownerId?: string;
  currency?: string;
}

export interface CampaignQueryFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  category?: string | string[];
  sort?: string;
}

const authKey = ["auth"] as const;
const sessionKey = ["session"] as const;
const walletKey = ["wallets"] as const;
const campaignKey = ["campaigns"] as const;
const kycKey = ["kyc"] as const;

export const queryKeys = {
  auth: {
    all: authKey,
    currentUser: () => [...authKey, "current-user"] as const,
  },
  session: {
    all: sessionKey,
    current: () => [...sessionKey, "current"] as const,
    refresh: () => [...sessionKey, "refresh"] as const,
  },
  wallets: {
    all: walletKey,
    lists: () => [...walletKey, "list"] as const,
    list: (filters: WalletQueryFilters = {}) =>
      [...walletKey, "list", filters] as const,
    detail: (walletId: string) => [...walletKey, "detail", walletId] as const,
  },
  campaigns: {
    all: campaignKey,
    lists: () => [...campaignKey, "list"] as const,
    list: (filters: CampaignQueryFilters = {}) =>
      [...campaignKey, "list", filters] as const,
    detail: (campaignId: string) =>
      [...campaignKey, "detail", campaignId] as const,
    recommendations: (campaignId: string) =>
      [...campaignKey, "recommendations", campaignId] as const,
    shares: (campaignId: string) =>
      [...campaignKey, "shares", campaignId] as const,
  },
  kyc: {
    all: kycKey,
    creatorStatus: (creatorId: string) =>
      [...kycKey, "creator-status", creatorId] as const,
  },
} as const;
