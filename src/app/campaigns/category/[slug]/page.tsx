'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { CampaignCard, CampaignCardSkeleton } from '@/components/campaigns/CampaignCard';
import type { Campaign } from '@/types/campaign';

const PAGE_SIZE = 12;

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

function getCategoryInfo(slug: string) {
  const categories: Record<string, { name: string; description: string; color: string }> = {
    'education': { name: 'Education', description: 'Support campaigns that help students access quality education.', color: 'from-blue-500 to-indigo-600' },
    'health': { name: 'Health', description: 'Help provide medical care, supplies, and support to those in need.', color: 'from-green-500 to-emerald-600' },
    'environment': { name: 'Environment', description: 'Protect our planet with campaigns focused on sustainability and conservation.', color: 'from-teal-500 to-cyan-600' },
    'disaster-relief': { name: 'Disaster Relief', description: 'Support communities affected by natural disasters and emergencies.', color: 'from-orange-500 to-red-600' },
    'animal-welfare': { name: 'Animal Welfare', description: 'Help protect and care for animals in need.', color: 'from-pink-500 to-rose-600' },
    'general': { name: 'General', description: 'Browse all campaigns making a difference.', color: 'from-purple-500 to-violet-600' },
  };

  return categories[slug] || categories['general'];
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const categoryInfo = getCategoryInfo(slug);
  const [page, setPage] = useState(1);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.campaigns.list({ page, limit: PAGE_SIZE, status: 'active', category: slug }),
    queryFn: async () => {
      const res = await api.get('/campaigns', {
        params: { page, limit: PAGE_SIZE, status: 'active', category: slug },
      });

      const apiCampaigns = res.data.data as any[];
      const mappedCampaigns = apiCampaigns.map(mapApiCampaignToType);
      return { data: mappedCampaigns, total: res.data.total };
    },
    retry: 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setCampaigns((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
    setTotal(data.total);
    setHasMore(page * PAGE_SIZE < data.total);
  }, [data, page]);

  const totalLabel = useMemo(() => {
    if (total === 0) {
      return `No active campaigns in ${categoryInfo.name}`;
    }

    return `Showing ${Math.min(campaigns.length, total)} of ${total} campaigns in ${categoryInfo.name}`;
  }, [campaigns.length, total, categoryInfo.name]);

  const handleLoadMore = () => {
    setPage((current) => current + 1);
  };

  if (isLoading && page === 1) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className={`bg-gradient-to-r ${categoryInfo.color} px-6 py-16 sm:px-8 lg:px-10`}>
          <div className="mx-auto max-w-7xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 rounded bg-white/30" />
              <div className="h-5 w-full max-w-2xl rounded bg-white/30" />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <CampaignCardSkeleton key={`campaign-skeleton-${index + 1}`} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">We couldn’t load the campaigns</h1>
          <p className="mt-3 text-gray-600">
            {(error as Error)?.message ?? 'Please try again in a moment.'}
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  if (!isLoading && campaigns.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className={`bg-gradient-to-r ${categoryInfo.color} px-6 py-16 sm:px-8 lg:px-10`}>
          <div className="mx-auto max-w-7xl">
            <h1 className="text-4xl font-bold text-white">{categoryInfo.name}</h1>
            <p className="mt-3 text-lg text-white/90">{categoryInfo.description}</p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl px-6 py-24 sm:px-8 lg:px-10">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-gray-900">No campaigns in this category yet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
              Be the first to start a campaign in {categoryInfo.name}!
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/campaigns" className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Browse all campaigns
              </Link>
              <Link href="/" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Back home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className={`bg-gradient-to-r ${categoryInfo.color} px-6 py-16 sm:px-8 lg:px-10`}>
        <div className="mx-auto max-w-7xl">
          <Link href="/campaigns" className="inline-flex items-center text-sm font-semibold text-white/90 hover:text-white mb-4">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all campaigns
          </Link>
          <h1 className="text-4xl font-bold text-white">{categoryInfo.name}</h1>
          <p className="mt-3 text-lg text-white/90">{categoryInfo.description}</p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-sm text-gray-600">{totalLabel}</p>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>

        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetching}
              className={`rounded-md bg-gradient-to-r ${categoryInfo.color} px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {isFetching ? 'Loading…' : 'Load More'}
            </button>
          </div>
        ) : (
          <div className="mt-10 text-center text-sm text-gray-500">
            You’ve reached the end of the campaigns in {categoryInfo.name}.
          </div>
        )}
      </div>
    </main>
  );
}
