export interface WalletQueryFilters {
  ownerId?: string;
  currency?: string;
}

export interface CampaignQueryFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

const authKey = ["auth"] as const;
const walletKey = ["wallets"] as const;
const campaignKey = ["campaigns"] as const;

export const queryKeys = {
  auth: {
    all: authKey,
    currentUser: () => [...authKey, "current-user"] as const,
  },
  wallets: {
    all: walletKey,
    lists: () => [...walletKey, "list"] as const,
    list: (filters: WalletQueryFilters = {}) =>
      [...walletKey, "list", filters] as const,
    detail: (walletId: string) =>
      [...walletKey, "detail", walletId] as const,
  },
  campaigns: {
    all: campaignKey,
    lists: () => [...campaignKey, "list"] as const,
    list: (filters: CampaignQueryFilters = {}) =>
      [...campaignKey, "list", filters] as const,
    detail: (campaignId: string) =>
      [...campaignKey, "detail", campaignId] as const,
  },
} as const;
