'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { CampaignCard, CampaignCardSkeleton } from '@/components/campaigns/CampaignCard';
import type { Campaign } from '@/types/campaign';
import { normalizeCampaigns } from '@/lib/campaigns';
import { useDebounce } from '@/hooks/useDebounce';
import { CATEGORY_LIST } from '@/lib/categories';

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'most-funded', label: 'Most Funded' },
  { value: 'ending-soon', label: 'Ending Soon' },
  { value: 'most-donors', label: 'Most Donors' },
];

function CampaignsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const initialSearch = searchParams.get('search') || '';
  const initialCategories = searchParams.getAll('category');
  const initialSort = searchParams.get('sort') || 'newest';

  // Local state for UI
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }

    params.delete('category');
    selectedCategories.forEach(cat => params.append('category', cat));

    if (selectedSort !== 'newest') {
      params.set('sort', selectedSort);
    } else {
      params.delete('sort');
    }

    const newQueryString = params.toString();
    // Only push if changed
    if (newQueryString !== searchParams.toString()) {
      router.push(`${pathname}?${newQueryString}`, { scroll: false });
      // Reset page on filter change
      setPage(1);
    }
  }, [debouncedSearch, selectedCategories, selectedSort, pathname, router, searchParams]);

  // Data fetching state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const queryParams = {
    page,
    limit: PAGE_SIZE,
    status: 'active',
    search: debouncedSearch || undefined,
    category: selectedCategories.length > 0 ? selectedCategories : undefined,
    sort: selectedSort,
  };

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: queryKeys.campaigns.list(queryParams),
    queryFn: async () => {
      const res = await api.get('/campaigns', {
        params: queryParams,
      });

      return { data: normalizeCampaigns(res.data.data), total: res.data.total };
    },
    retry: 1,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!data) return;

    setCampaigns((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
    setTotal(data.total);
    setHasMore(page * PAGE_SIZE < data.total);
  }, [data, page]);

  const totalLabel = useMemo(() => {
    if (total === 0) return 'No active campaigns found';
    return `Showing ${Math.min(campaigns.length, total)} of ${total} active campaigns`;
  }, [campaigns.length, total]);

  const handleLoadMore = () => setPage((current) => current + 1);

  const handleCategoryToggle = (slug: string) => {
    setSelectedCategories(prev => 
      prev.includes(slug) ? prev.filter(c => c !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedCategories([]);
    setSelectedSort('newest');
  };

  const isFiltering = debouncedSearch !== '' || selectedCategories.length > 0 || selectedSort !== 'newest';

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Campaigns</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Browse active causes to support
          </h1>
        </div>
        <p className="text-sm text-gray-600">{totalLabel}</p>
      </div>

      {/* Filters Section */}
      <div className="mb-10 space-y-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 border outline-none"
            />
          </div>
          
          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-11 border px-3 outline-none bg-white"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Categories</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_LIST.map((category) => {
              const isSelected = selectedCategories.includes(category.slug);
              return (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryToggle(category.slug)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                    isSelected 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {category.name}
                  {isSelected && (
                    <svg className="ml-1.5 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading && page === 1 ? (
        <div className="animate-pulse space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <CampaignCardSkeleton key={`campaign-skeleton-${index + 1}`} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900">We couldn’t load the campaigns</h2>
          <p className="mt-3 text-gray-600">
            {(error as Error)?.message ?? 'Please try again in a moment.'}
          </p>
          <button onClick={() => window.location.reload()} className="mt-6 inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Try again
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-semibold text-gray-900">No campaigns found</h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-600">
            {isFiltering 
              ? "We couldn't find any campaigns matching your current filters. Try adjusting them or clearing your search."
              : "There are no active campaigns right now. Please check back soon."}
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {isFiltering && (
              <button onClick={clearFilters} className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                Clear all filters
              </button>
            )}
            <Link href="/" className="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Back home
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} searchQuery={debouncedSearch} />
            ))}
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
              You’ve reached the end of the results.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-24 sm:px-8 lg:px-10">
      <Suspense fallback={
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
        </div>
      }>
        <CampaignsContent />
      </Suspense>
    </main>
  );
}
