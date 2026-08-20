'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { PlatformStats } from '@/types/campaign';

export default function HeroSection() {
  const { data: stats } = useQuery<PlatformStats>({
    queryKey: queryKeys.campaigns.list({ limit: 1 }),
    queryFn: async () => {
      const res = await api.get('/platform/stats');
      return res.data;
    },
    retry: 1,
    staleTime: 60_000,
  });

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8">
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-purple-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-pulse"
          style={{ animationDuration: '6s' }}
        />
      </div>

      <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Empower Change with{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Blockchain Fundraising
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create, fund, and manage campaigns with complete transparency and trust.
            Built on Ethereum for a decentralized future of fundraising.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/create"
              className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              Launch a Campaign
            </Link>
            <Link
              href="/campaigns"
              className="rounded-md px-6 py-3 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:ring-blue-600 hover:text-blue-600 transition-all duration-200"
            >
              Explore Campaigns
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats ? `${(stats.totalRaised / 1000).toFixed(0)}K+` : '---'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Total Raised</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats ? stats.activeCampaigns : '---'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Active Campaigns</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {stats ? `${stats.totalDonors.toLocaleString()}+` : '---'}
              </p>
              <p className="mt-1 text-sm text-gray-500">Donors</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-600 to-purple-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-pulse"
          style={{ animationDuration: '8s' }}
        />
      </div>
    </div>
  );
}
