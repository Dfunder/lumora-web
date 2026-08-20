import { describe, expect, it } from 'vitest';

import { formatMetricValue, normalizePlatformStats } from '../platformStats';

describe('normalizePlatformStats', () => {
  it('maps backend values into trust metrics with sensible defaults', () => {
    const stats = normalizePlatformStats({
      totalTransactions: 1280,
      totalRaisedXlm: 24600,
      contractsDeployed: 17,
    });

    expect(stats.totalTransactions).toBe(1280);
    expect(stats.xlmRaised).toBe(24600);
    expect(stats.contractsDeployed).toBe(17);
  });

  it('falls back gracefully when the payload uses alternative field names', () => {
    const stats = normalizePlatformStats({
      totalRaised: 1024,
      activeCampaigns: 4,
      totalDonors: 88,
    });

    expect(stats.xlmRaised).toBe(1024);
    expect(stats.activeCampaigns).toBe(4);
    expect(stats.totalDonors).toBe(88);
  });
});

describe('formatMetricValue', () => {
  it('uses compact notation for larger values', () => {
    expect(formatMetricValue(12500)).toBe('12.5K');
  });

  it('returns a plain number for small values', () => {
    expect(formatMetricValue(42)).toBe('42');
  });
});
