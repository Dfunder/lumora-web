import { describe, expect, it } from 'vitest';

import {
  buildCampaignListQuery,
  CAMPAIGN_SORT_OPTIONS,
  DEFAULT_CAMPAIGN_PAGE,
  DEFAULT_CAMPAIGN_SORT,
  parseCampaignPage,
  parseCampaignSort,
  readCampaignFilters,
  serializeCampaignFilters,
} from '../campaignFilters';
import { isCategorySlug } from '../categories';

describe('parseCampaignSort', () => {
  it('returns the value for a known sort', () => {
    expect(parseCampaignSort('most-funded')).toBe('most-funded');
    expect(parseCampaignSort('ending-soon')).toBe('ending-soon');
  });

  it('falls back to the default for unknown or missing values', () => {
    expect(parseCampaignSort('bogus')).toBe(DEFAULT_CAMPAIGN_SORT);
    expect(parseCampaignSort(null)).toBe(DEFAULT_CAMPAIGN_SORT);
    expect(parseCampaignSort(undefined)).toBe(DEFAULT_CAMPAIGN_SORT);
  });

  it('exposes the sort options used by the UI', () => {
    expect(CAMPAIGN_SORT_OPTIONS.map((o) => o.value)).toContain('newest');
    expect(CAMPAIGN_SORT_OPTIONS.map((o) => o.label)).toContain('Most Funded');
  });
});

describe('parseCampaignPage', () => {
  it('parses positive integers', () => {
    expect(parseCampaignPage('2')).toBe(2);
    expect(parseCampaignPage('10')).toBe(10);
  });

  it('falls back to the default page for invalid values', () => {
    expect(parseCampaignPage('0')).toBe(DEFAULT_CAMPAIGN_PAGE);
    expect(parseCampaignPage('-3')).toBe(DEFAULT_CAMPAIGN_PAGE);
    expect(parseCampaignPage('abc')).toBe(DEFAULT_CAMPAIGN_PAGE);
    expect(parseCampaignPage('1.5')).toBe(DEFAULT_CAMPAIGN_PAGE);
    expect(parseCampaignPage(null)).toBe(DEFAULT_CAMPAIGN_PAGE);
  });
});

describe('isCategorySlug', () => {
  it('accepts known slugs only', () => {
    expect(isCategorySlug('education')).toBe(true);
    expect(isCategorySlug('general')).toBe(true);
    expect(isCategorySlug('not-a-slug')).toBe(false);
    expect(isCategorySlug('')).toBe(false);
    expect(isCategorySlug(null)).toBe(false);
    expect(isCategorySlug(undefined)).toBe(false);
  });
});

describe('readCampaignFilters', () => {
  it('reads search, categories, sort and page from the URL', () => {
    const params = new URLSearchParams(
      'search=water&category=education&category=health&sort=most-funded&page=3',
    );

    expect(readCampaignFilters(params)).toEqual({
      search: 'water',
      categories: ['education', 'health'],
      sort: 'most-funded',
      page: 3,
    });
  });

  it('drops unknown categories/sorts and invalid pages', () => {
    const params = new URLSearchParams(
      'category=bogus&category=environment&sort=random&page=not-a-number',
    );

    expect(readCampaignFilters(params)).toEqual({
      search: '',
      categories: ['environment'],
      sort: DEFAULT_CAMPAIGN_SORT,
      page: DEFAULT_CAMPAIGN_PAGE,
    });
  });

  it('returns defaults for an empty URL', () => {
    expect(readCampaignFilters(new URLSearchParams(''))).toEqual({
      search: '',
      categories: [],
      sort: DEFAULT_CAMPAIGN_SORT,
      page: DEFAULT_CAMPAIGN_PAGE,
    });
  });
});

describe('serializeCampaignFilters', () => {
  it('sets, updates and deletes search', () => {
    const base = new URLSearchParams('');

    expect(serializeCampaignFilters({ search: 'water' }, base)).toBe(
      'search=water',
    );
    expect(serializeCampaignFilters({ search: '' }, base)).toBe('');
  });

  it('supports multiple categories and removes them when cleared', () => {
    const base = new URLSearchParams('');

    expect(
      serializeCampaignFilters(
        { categories: ['education', 'health'] },
        base,
      ),
    ).toBe('category=education&category=health');

    expect(
      serializeCampaignFilters({ categories: [] }, base),
    ).toBe('');
  });

  it('omits default sort and page from the query string', () => {
    const base = new URLSearchParams('');

    expect(serializeCampaignFilters({ sort: DEFAULT_CAMPAIGN_SORT }, base)).toBe(
      '',
    );
    expect(serializeCampaignFilters({ page: DEFAULT_CAMPAIGN_PAGE }, base)).toBe(
      '',
    );
    expect(serializeCampaignFilters({ sort: 'ending-soon' }, base)).toBe(
      'sort=ending-soon',
    );
    expect(serializeCampaignFilters({ page: 4 }, base)).toBe('page=4');
  });

  it('preserves unrelated params and untouched filter values', () => {
    const base = new URLSearchParams('utm_source=email&page=2');

    expect(
      serializeCampaignFilters({ categories: ['education'] }, base),
    ).toBe('utm_source=email&page=2&category=education');
  });
});

describe('buildCampaignListQuery', () => {
  it('builds the params shared by the API request and query key', () => {
    const query = buildCampaignListQuery(
      {
        search: 'water',
        categories: ['education'],
        sort: 'most-funded',
        page: 2,
      },
      { limit: 12 },
    );

    expect(query).toEqual({
      page: 2,
      limit: 12,
      status: 'active',
      search: 'water',
      category: ['education'],
      sort: 'most-funded',
    });
  });

  it('omits empty search and category and allows a custom status', () => {
    const query = buildCampaignListQuery(
      {
        search: '',
        categories: [],
        sort: DEFAULT_CAMPAIGN_SORT,
        page: 1,
      },
      { limit: 12, status: 'draft' },
    );

    expect(query.search).toBeUndefined();
    expect(query.category).toBeUndefined();
    expect(query.status).toBe('draft');
    expect(query.sort).toBe(DEFAULT_CAMPAIGN_SORT);
  });
});
