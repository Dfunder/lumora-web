'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Campaign } from '@/types/campaign';

export default function FeaturedCampaigns() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.list({ limit: 6, status: 'active' }),
    queryFn: async () => {
      const res = await api.get('/campaigns', {
        params: { limit: 6, status: 'active' },
      });
      return res.data as { data: Campaign[]; total: number };
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
              <div key={i} className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-full" />
                </div>
              </div>
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
          {campaigns.slice(0, 6).map((campaign) => {
            const progress = campaign.goal > 0
              ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
              : 0;

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  {campaign.image ? (
                    <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-500 mb-1">
                      <span>${campaign.raised.toLocaleString()} raised</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-400">{campaign.donorCount} donors</p>
                </div>
              </Link>
            );
          })}
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
