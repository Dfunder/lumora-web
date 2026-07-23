'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Campaign } from '@/types/campaign';

const PAGE_SIZE = 12;

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.campaigns.list({ page, limit: PAGE_SIZE, status: 'active' }),
    queryFn: async () => {
      const res = await api.get('/campaigns', {
        params: { page, limit: PAGE_SIZE, status: 'active' },
      });

      return res.data as { data: Campaign[]; total: number };
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
      return 'No active campaigns yet';
    }

    return `Showing ${Math.min(campaigns.length, total)} of ${total} active campaigns`;
  }, [campaigns.length, total]);

  const handleLoadMore = () => {
    setPage((current) => current + 1);
  };

  if (isLoading && page === 1) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200" />
            <div className="h-4 w-72 rounded bg-gray-200" />
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }, (_, index) => ({ id: `campaign-skeleton-${index + 1}` })).map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <div className="h-48 bg-gray-200" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
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
      <main className="min-h-screen bg-gray-50 px-6 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
              </svg>
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-gray-900">No active campaigns right now</h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
              There are no active campaigns matching this view yet. Please check back soon or head home to explore the platform.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link href="/" className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Back home
              </Link>
              <Link href="/connect" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Connect wallet
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Campaigns</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Browse active causes to support
            </h1>
          </div>
          <p className="text-sm text-gray-600">{totalLabel}</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => {
            const progress = campaign.goal > 0
              ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100))
              : 0;

            return (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 via-white to-purple-100">
                  {campaign.image ? (
                    <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-blue-400">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {campaign.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600 line-clamp-3">{campaign.description}</p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
                      <span>${campaign.raised.toLocaleString()} raised</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{campaign.donorCount} donors</span>
                    <span className="font-medium text-blue-600">View campaign</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetching}
              className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isFetching ? 'Loading…' : 'Load More'}
            </button>
          </div>
        ) : (
          <div className="mt-10 text-center text-sm text-gray-500">
            You’ve reached the end of the active campaigns.
          </div>
        )}
      </div>
    </main>
  );
}
