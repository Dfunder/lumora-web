export interface Campaign {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  goalAmount: number;
  raisedAmount: number;
  currency: string;
  endDate: string;
  donorCount: number;
  creatorAddress: string;
  creatorName: string;
  isVerified: boolean;
  category: string;
  status: 'active' | 'completed' | 'draft';
  createdAt: string;
}

export interface PlatformStats {
  totalRaised: number;
  activeCampaigns: number;
  totalDonors: number;
}
