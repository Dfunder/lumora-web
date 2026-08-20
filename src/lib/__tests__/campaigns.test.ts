import { describe, expect, it } from 'vitest';

import { normalizeCampaign, normalizeCampaigns } from '../campaigns';

describe('normalizeCampaign', () => {
  const canonicalPayload = {
    id: 'camp-1',
    title: 'Clean Water Initiative',
    description: 'Provide clean water to rural communities.',
    coverImage: 'https://example.com/cover.jpg',
    goalAmount: 10000,
    raisedAmount: 4500,
    currency: 'USD',
    endDate: '2026-12-31T00:00:00.000Z',
    donorCount: 120,
    creatorAddress: 'GABC123',
    creatorName: 'Alice',
    isVerified: true,
    category: 'environment',
    status: 'active',
    createdAt: '2026-01-15T00:00:00.000Z',
  };

  it('maps a canonical payload without changes', () => {
    const campaign = normalizeCampaign(canonicalPayload);

    expect(campaign.id).toBe('camp-1');
    expect(campaign.title).toBe('Clean Water Initiative');
    expect(campaign.coverImage).toBe('https://example.com/cover.jpg');
    expect(campaign.goalAmount).toBe(10000);
    expect(campaign.raisedAmount).toBe(4500);
    expect(campaign.currency).toBe('USD');
    expect(campaign.endDate).toBe('2026-12-31T00:00:00.000Z');
    expect(campaign.donorCount).toBe(120);
    expect(campaign.creatorAddress).toBe('GABC123');
    expect(campaign.creatorName).toBe('Alice');
    expect(campaign.isVerified).toBe(true);
    expect(campaign.category).toBe('environment');
    expect(campaign.status).toBe('active');
    expect(campaign.createdAt).toBe('2026-01-15T00:00:00.000Z');
  });

  it('falls back to legacy field names (image, goal, raised)', () => {
    const legacyPayload = {
      ...canonicalPayload,
      coverImage: undefined,
      image: 'https://example.com/legacy.jpg',
      goalAmount: undefined,
      goal: 5000,
      raisedAmount: undefined,
      raised: 2000,
    };

    const campaign = normalizeCampaign(legacyPayload);

    expect(campaign.coverImage).toBe('https://example.com/legacy.jpg');
    expect(campaign.goalAmount).toBe(5000);
    expect(campaign.raisedAmount).toBe(2000);
  });

  it('falls back to legacy nested creator object', () => {
    const legacyCreatorPayload = {
      ...canonicalPayload,
      creatorAddress: undefined,
      creatorName: undefined,
      creator: { address: 'GDEF456', name: 'Bob' },
    };

    const campaign = normalizeCampaign(legacyCreatorPayload);

    expect(campaign.creatorAddress).toBe('GDEF456');
    expect(campaign.creatorName).toBe('Bob');
  });

  it('provides safe defaults for null/undefined fields in partial payloads', () => {
    const partialPayload = {
      id: 'camp-2',
      title: 'Partial Campaign',
    };

    const campaign = normalizeCampaign(partialPayload);

    expect(campaign.id).toBe('camp-2');
    expect(campaign.title).toBe('Partial Campaign');
    expect(campaign.description).toBe('');
    expect(campaign.coverImage).toBe('');
    expect(campaign.goalAmount).toBe(0);
    expect(campaign.raisedAmount).toBe(0);
    expect(campaign.currency).toBe('$');
    expect(campaign.endDate).not.toBe(''); // auto-generated date
    expect(campaign.donorCount).toBe(0);
    expect(campaign.creatorAddress).toBe('');
    expect(campaign.creatorName).toBe('');
    expect(campaign.isVerified).toBe(false);
    expect(campaign.category).toBe('general');
    expect(campaign.status).toBe('active');
  });

  it('handles a completely null or undefined input', () => {
    expect(normalizeCampaign(null).id).toBe('');
    expect(normalizeCampaign(undefined).id).toBe('');
    expect(normalizeCampaign('not-an-object' as unknown as Record<string, unknown>).id).toBe('');
  });

  it('handles string-typed booleans and numbers', () => {
    const payload = {
      id: 'camp-3',
      title: 'Coerced types',
      goalAmount: '7500',
      raisedAmount: '3000',
      isVerified: 'true',
      donorCount: '42',
    };

    const campaign = normalizeCampaign(payload);

    expect(campaign.goalAmount).toBe(7500);
    expect(campaign.raisedAmount).toBe(3000);
    expect(campaign.isVerified).toBe(true);
    expect(campaign.donorCount).toBe(42);
  });

  it('produces a valid empty campaign for a malformed object', () => {
    const campaign = normalizeCampaign({ foo: 'bar', nested: { a: 1 } });

    expect(campaign.id).toBe('');
    expect(campaign.title).toBe('');
    expect(campaign.goalAmount).toBe(0);
  });
});

describe('normalizeCampaigns', () => {
  it('returns an empty array for non-array input', () => {
    expect(normalizeCampaigns(null)).toEqual([]);
    expect(normalizeCampaigns(undefined)).toEqual([]);
    expect(normalizeCampaigns('oops' as unknown as unknown[])).toEqual([]);
  });

  it('filters out entries without an id', () => {
    const items = [
      { id: 'c1', title: 'Good' },
      { title: 'No ID' },
      { id: 'c2', title: 'Also good' },
    ];

    const result = normalizeCampaigns(items);

    expect(result).toHaveLength(2);
    expect(result.map((c) => c.id)).toEqual(['c1', 'c2']);
  });

  it('normalizes a mixed array of canonical and legacy payloads', () => {
    const items = [
      {
        id: 'c1',
        title: 'Canonical',
        coverImage: 'img-a.jpg',
        goalAmount: 1000,
      },
      {
        id: 'c2',
        title: 'Legacy',
        image: 'img-b.jpg',
        goal: 2000,
        raised: 500,
        creator: { address: 'G123', name: 'Creator' },
      },
    ];

    const result = normalizeCampaigns(items);

    expect(result[0].coverImage).toBe('img-a.jpg');
    expect(result[0].goalAmount).toBe(1000);
    expect(result[1].coverImage).toBe('img-b.jpg');
    expect(result[1].goalAmount).toBe(2000);
    expect(result[1].raisedAmount).toBe(500);
    expect(result[1].creatorAddress).toBe('G123');
    expect(result[1].creatorName).toBe('Creator');
  });
});
