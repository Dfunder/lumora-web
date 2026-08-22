import { describe, expect, it } from 'vitest';

import { computeServerOffset, splitRemaining, toEndTimeMs } from '../countdown';

describe('computeServerOffset', () => {
  it('returns how far the server clock is ahead of the client', () => {
    expect(computeServerOffset(2000, 1000)).toBe(1000);
    expect(computeServerOffset(500, 1500)).toBe(-1000);
    expect(computeServerOffset(1000, 1000)).toBe(0);
  });
});

describe('toEndTimeMs', () => {
  it('parses ISO strings and dates', () => {
    expect(toEndTimeMs('2026-12-31T00:00:00.000Z')).toBe(
      Date.UTC(2026, 11, 31),
    );
    expect(toEndTimeMs(new Date(Date.UTC(2027, 0, 1)))).toBe(
      Date.UTC(2027, 0, 1),
    );
  });

  it('returns null for unparseable dates', () => {
    expect(toEndTimeMs('not-a-date')).toBeNull();
    expect(toEndTimeMs('')).toBeNull();
  });
});

describe('splitRemaining', () => {
  const end = Date.UTC(2026, 5, 15, 12, 30, 45);

  it('splits remaining time into days, hours, minutes and seconds', () => {
    // Exactly 1 day, 2 hours, 3 minutes and 4 seconds before the end.
    const now = end - ((1 * 24 + 2) * 60 + 3) * 60 * 1000 - 4 * 1000;

    expect(splitRemaining(end, now)).toEqual({
      ended: false,
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
  });

  it('reports ended once expiry passes', () => {
    const parts = splitRemaining(end, end + 1);
    expect(parts.ended).toBe(true);
    expect(parts).toEqual({
      ended: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('treats the exact expiry moment as ended', () => {
    expect(splitRemaining(end, end).ended).toBe(true);
  });
});
