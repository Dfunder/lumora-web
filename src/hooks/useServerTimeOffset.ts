"use client";

import { useEffect, useState } from "react";

import { computeServerOffset } from "@/lib/countdown";

interface ServerTimeResponse {
  serverTime: number;
}

const SYNC_URL = "/api/time";
const RETRY_DELAY_MS = 3000;

/**
 * Syncs to server time once per mount and returns the client→server clock
 * offset in milliseconds. Countdown math must use
 * `Date.now() + offset`, never the raw client clock.
 */
export function useServerTimeOffset(): {
  /** Offset such that `Date.now() + offset` approximates server time. */
  offsetMs: number | null;
} {
  const [offsetMs, setOffsetMs] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const sync = async () => {
      try {
        const response = await fetch(SYNC_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as ServerTimeResponse;
        if (cancelled) return;
        setOffsetMs(computeServerOffset(data.serverTime, Date.now()));
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to sync server time", error);
        retryTimeout = setTimeout(sync, RETRY_DELAY_MS);
      }
    };

    sync();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, []);

  return { offsetMs };
}
