'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { CampaignCard, CampaignCardSkeleton } from '@/components/campaigns/CampaignCard';
import type { Campaign } from '@/types/campaign';

// Helper to map API campaign data to our type
function mapApiCampaignToType(apiCampaign: any): Campaign {
  return {
    id: apiCampaign.id,
    title: apiCampaign.title,
    description: apiCampaign.description,
    coverImage: apiCampaign.coverImage || apiCampaign.image,
    goalAmount: apiCampaign.goalAmount || apiCampaign.goal,
    raisedAmount: apiCampaign.raisedAmount || apiCampaign.raised,
    currency: apiCampaign.currency || '$',
    endDate: apiCampaign.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    donorCount: apiCampaign.donorCount,
    creatorAddress: apiCampaign.creatorAddress || apiCampaign.creator?.address || '',
    creatorName: apiCampaign.creatorName || apiCampaign.creator?.name || '',
    isVerified: apiCampaign.isVerified || false,
    category: apiCampaign.category || 'general',
    status: apiCampaign.status,
    createdAt: apiCampaign.createdAt,
  };
}

export default function FeaturedCampaigns() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.list({ limit: 6, status: 'active' }),
    queryFn: async () => {
      const res = await api.get('/campaigns', {
        params: { limit: 6, status: 'active' },
      });
      const apiCampaigns = res.data.data as any[];
      const mappedCampaigns = apiCampaigns.map(mapApiCampaignToType);
      return { data: mappedCampaigns, total: res.data.total };
    },
    retry: 1,
    staleTime: 30_000,
  });

  const campaigns = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mx-auto" />
            <div className="mt-4 h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto" />
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) return null;

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Featured Campaigns</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Causes that need your support
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Discover campaigns making a real impact. Every contribution brings us closer to a better world.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.slice(0, 6).map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/campaigns"
            className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            View All Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
