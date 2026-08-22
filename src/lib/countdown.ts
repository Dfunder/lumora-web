export interface CountdownParts {
  ended: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Offset between server and client clocks in milliseconds.
 * `serverTimeMs - clientNowMs` so that `clientNow + offset` approximates
 * the server's current time even when the client clock is wrong.
 */
export function computeServerOffset(
  serverTimeMs: number,
  clientNowMs: number,
): number {
  return serverTimeMs - clientNowMs;
}

/** Convert a campaign end date to epoch ms, returning null when unparseable. */
export function toEndTimeMs(endDate: string | number | Date): number | null {
  const time = new Date(endDate).getTime();
  return Number.isFinite(time) ? time : null;
}

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * Split the remaining time until `endTimeMs` into calendar units, computed
 * from a server-derived "now". Never pass a raw client clock value here —
 * add the server offset first (`Date.now() + offset`).
 */
export function splitRemaining(
  endTimeMs: number,
  serverNowMs: number,
): CountdownParts {
  const diff = endTimeMs - serverNowMs;

  if (diff <= 0) {
    return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    ended: false,
    days: Math.floor(diff / MS_PER_DAY),
    hours: Math.floor((diff % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((diff % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((diff % MS_PER_MINUTE) / MS_PER_SECOND),
  };
}
