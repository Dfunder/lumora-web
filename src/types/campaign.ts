export interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  goal: number;
  raised: number;
  donorCount: number;
  status: 'active' | 'completed' | 'draft';
  creator: { name: string; address: string };
  createdAt: string;
}

export interface PlatformStats {
  totalRaised: number;
  activeCampaigns: number;
  totalDonors: number;
}
