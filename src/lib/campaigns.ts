import type { Campaign } from '@/types/campaign';

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return fallback;
}

/**
 * Normalize a single raw API campaign payload into the canonical `Campaign` shape.
 *
 * Handles legacy / alternative field names so that the UI remains stable
 * when the backend changes field names or omits optional attributes.
 */
export function normalizeCampaign(raw: UnknownRecord | null | undefined): Campaign {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      title: '',
      description: '',
      coverImage: '',
      goalAmount: 0,
      raisedAmount: 0,
      currency: '$',
      endDate: '',
      donorCount: 0,
      creatorAddress: '',
      creatorName: '',
      isVerified: false,
      category: 'general',
      status: 'active',
      createdAt: '',
    };
  }

  // Handle legacy "creator" object shape: { creator: { address, name } }
  const creator = (raw.creator ?? null) as UnknownRecord | null;

  return {
    id: asString(raw.id),
    title: asString(raw.title),
    description: asString(raw.description),
    coverImage: asString(raw.coverImage) || asString(raw.image),
    goalAmount: asNumber(raw.goalAmount) || asNumber(raw.goal),
    raisedAmount: asNumber(raw.raisedAmount) || asNumber(raw.raised),
    currency: asString(raw.currency, '$'),
    endDate:
      asString(raw.endDate) ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    donorCount: asNumber(raw.donorCount),
    creatorAddress:
      asString(raw.creatorAddress) ||
      asString(creator?.address),
    creatorName:
      asString(raw.creatorName) ||
      asString(creator?.name),
    isVerified: asBoolean(raw.isVerified),
    category: asString(raw.category, 'general'),
    status: (asString(raw.status, 'active') as Campaign['status']),
    createdAt: asString(raw.createdAt),
  };
}

/**
 * Normalize an array of raw API campaign payloads into canonical `Campaign[]`.
 * Filters out entries that cannot produce a valid campaign (missing id).
 */
export function normalizeCampaigns(
  items: unknown[] | null | undefined,
): Campaign[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizeCampaign(item as UnknownRecord))
    .filter((c) => c.id !== '');
}
