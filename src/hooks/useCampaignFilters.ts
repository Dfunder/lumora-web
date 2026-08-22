"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useDebounce } from "@/hooks/useDebounce";
import {
  DEFAULT_CAMPAIGN_SORT,
  readCampaignFilters,
  serializeCampaignFilters,
  type CampaignSort,
  type CampaignUrlFilters,
} from "@/lib/campaignFilters";

/**
 * Route-driven campaign list filters.
 *
 * The URL search params are the single source of truth for search, category,
 * sort and page — so browser back/forward, hard reloads and shared links all
 * render the same list. The hook exposes the parsed values plus small updaters
 * that push new params to the URL (and reset pagination when filters change).
 *
 * The search input is the one exception: it keeps a local uncontrolled value
 * so typing stays snappy, and the debounced result is committed to the URL.
 */
export function useCampaignFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = readCampaignFilters(searchParams);

  // Immediate input state for the search box; committed to the URL after the
  // debounce fires. Kept in sync when the URL changes externally (back/forward,
  // shared links) via the render-phase adjustment pattern.
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  const [prevSearch, setPrevSearch] = useState(filters.search);
  if (prevSearch !== filters.search) {
    setPrevSearch(filters.search);
    setSearchInput(filters.search);
  }

  // Commit the debounced search to the URL (reset pagination to page 1).
  // The `debouncedSearch === searchInput` guard ensures only user-typed changes
  // are committed: after an external URL change (back/forward, shared link) the
  // input is synced to the URL, so the still-pending debounced value is ignored
  // instead of fighting the navigation by re-pushing the old search.
  useEffect(() => {
    if (debouncedSearch === filters.search) return;
    if (debouncedSearch !== searchInput) return;

    router.push(
      `${pathname}?${serializeCampaignFilters(
        { search: debouncedSearch, page: 1 },
        searchParams,
      )}`,
      { scroll: false },
    );
  }, [debouncedSearch, filters.search, searchInput, pathname, router, searchParams]);

  const updateUrl = (patch: Partial<CampaignUrlFilters>) => {
    router.push(
      `${pathname}?${serializeCampaignFilters(patch, searchParams)}`,
      { scroll: false },
    );
  };

  const toggleCategory = (slug: string) => {
    const next = filters.categories.includes(slug)
      ? filters.categories.filter((c) => c !== slug)
      : [...filters.categories, slug];
    updateUrl({ categories: next, page: 1 });
  };

  const setSort = (sort: CampaignSort) => updateUrl({ sort, page: 1 });

  const setPage = (page: number) => updateUrl({ page });

  const clearFilters = () =>
    updateUrl({
      search: "",
      categories: [],
      sort: DEFAULT_CAMPAIGN_SORT,
      page: 1,
    });

  const isFiltering =
    filters.search !== "" ||
    filters.categories.length > 0 ||
    filters.sort !== DEFAULT_CAMPAIGN_SORT;

  return {
    ...filters,
    searchInput,
    setSearchInput,
    debouncedSearch,
    toggleCategory,
    setSort,
    setPage,
    clearFilters,
    isFiltering,
  };
}
