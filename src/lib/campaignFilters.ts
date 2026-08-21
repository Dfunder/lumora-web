import { isCategorySlug } from "@/lib/categories";
import type { CampaignQueryFilters } from "@/lib/queryKeys";

// ---------------------------------------------------------------------------
// Sort & pagination primitives
// ---------------------------------------------------------------------------

export const CAMPAIGN_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "most-funded", label: "Most Funded" },
  { value: "ending-soon", label: "Ending Soon" },
  { value: "most-donors", label: "Most Donors" },
] as const;

export type CampaignSort = (typeof CAMPAIGN_SORT_OPTIONS)[number]["value"];

export const DEFAULT_CAMPAIGN_SORT: CampaignSort = "newest";
export const DEFAULT_CAMPAIGN_PAGE = 1;

export function isCampaignSort(value: string | null | undefined): value is CampaignSort {
  return (
    typeof value === "string" &&
    (CAMPAIGN_SORT_OPTIONS as readonly { value: string }[]).some(
      (option) => option.value === value,
    )
  );
}

export function parseCampaignSort(value: string | null | undefined): CampaignSort {
  return isCampaignSort(value) ? value : DEFAULT_CAMPAIGN_SORT;
}

export function parseCampaignPage(value: string | null | undefined): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_CAMPAIGN_PAGE;
}

// ---------------------------------------------------------------------------
// URL search params <-> filters
//
// The URL is the single source of truth for campaign list filters. These
// helpers keep reading and writing the search params consistent so the page,
// the hook, and browser back/forward can never drift apart.
// ---------------------------------------------------------------------------

export interface CampaignUrlFilters {
  search: string;
  categories: string[];
  sort: CampaignSort;
  page: number;
}

export function readCampaignFilters(searchParams: URLSearchParams): CampaignUrlFilters {
  return {
    search: searchParams.get("search") ?? "",
    categories: searchParams.getAll("category").filter(isCategorySlug),
    sort: parseCampaignSort(searchParams.get("sort")),
    page: parseCampaignPage(searchParams.get("page")),
  };
}

/**
 * Serialize a patch of filter values into a query string, preserving any
 * params that were not touched (e.g. unrelated params on the same route).
 */
export function serializeCampaignFilters(
  patch: Partial<CampaignUrlFilters>,
  current: URLSearchParams,
): string {
  const params = new URLSearchParams(current.toString());

  if (patch.search !== undefined) {
    if (patch.search) {
      params.set("search", patch.search);
    } else {
      params.delete("search");
    }
  }

  if (patch.categories !== undefined) {
    params.delete("category");
    patch.categories.forEach((slug) => params.append("category", slug));
  }

  if (patch.sort !== undefined) {
    if (patch.sort === DEFAULT_CAMPAIGN_SORT) {
      params.delete("sort");
    } else {
      params.set("sort", patch.sort);
    }
  }

  if (patch.page !== undefined) {
    if (patch.page === DEFAULT_CAMPAIGN_PAGE) {
      params.delete("page");
    } else {
      params.set("page", String(patch.page));
    }
  }

  return params.toString();
}

// ---------------------------------------------------------------------------
// API query builder
// ---------------------------------------------------------------------------

export interface CampaignListQueryOptions {
  limit: number;
  status?: string;
}

/**
 * Build the params object shared by the API request and the React Query key so
 * the two can never disagree about what is being fetched.
 */
export function buildCampaignListQuery(
  filters: CampaignUrlFilters,
  options: CampaignListQueryOptions,
): CampaignQueryFilters {
  return {
    page: filters.page,
    limit: options.limit,
    status: options.status ?? "active",
    search: filters.search || undefined,
    category: filters.categories.length > 0 ? filters.categories : undefined,
    sort: filters.sort,
  };
}
