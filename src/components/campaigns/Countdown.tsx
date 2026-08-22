"use client";

import { useEffect, useMemo, useState } from "react";

import { splitRemaining, toEndTimeMs } from "@/lib/countdown";
import { useServerTimeOffset } from "@/hooks/useServerTimeOffset";

type CountdownProps = {
  /** Campaign end date (ISO string, epoch ms or Date). */
  endDate: string | number | Date;
};

const UNIT_CONTAINER_CLASS =
  "flex min-w-[4.5rem] flex-col items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm";
const UNIT_VALUE_CLASS = "text-2xl font-bold tabular-nums text-gray-900";
const UNIT_LABEL_CLASS = "text-xs font-medium uppercase tracking-wide text-gray-500";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * Live countdown synced to server time. The remaining time is always
 * computed as `endDate - (Date.now() + serverOffset)` so a client with a
 * wrong clock still shows the correct countdown.
 */
export function Countdown({ endDate }: CountdownProps) {
  const { offsetMs } = useServerTimeOffset();
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const endTimeMs = toEndTimeMs(endDate);
  const parts = useMemo(
    () =>
      endTimeMs === null
        ? null
        : splitRemaining(endTimeMs, nowMs + (offsetMs ?? 0)),
    [endTimeMs, nowMs, offsetMs],
  );

  if (!endTimeMs || !parts) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Invalid campaign end date.
      </div>
    );
  }

  if (offsetMs === null) {
    return (
      <div
        data-testid="countdown-syncing"
        className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500"
        role="status"
      >
        Syncing time…
      </div>
    );
  }

  if (parts.ended) {
    return (
      <div
        data-testid="countdown-ended"
        className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center"
        role="status"
      >
        <p className="text-lg font-semibold text-gray-700">Campaign Ended</p>
        <p className="mt-1 text-sm text-gray-500">
          This campaign is no longer accepting donations.
        </p>
      </div>
    );
  }

  const units = [
    { label: "Days", value: parts.days.toString() },
    { label: "Hours", value: pad(parts.hours) },
    { label: "Minutes", value: pad(parts.minutes) },
    { label: "Seconds", value: pad(parts.seconds) },
  ];

  return (
    <div data-testid="countdown" aria-label="Time remaining in this campaign">
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div key={unit.label} className={UNIT_CONTAINER_CLASS}>
            <span className={UNIT_VALUE_CLASS}>{unit.value}</span>
            <span className={UNIT_LABEL_CLASS}>{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Countdown;
