// @vitest-environment jsdom
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Countdown } from '../Countdown';

const T0 = Date.UTC(2026, 0, 1, 0, 0, 0);

function stubServerTimeFetch(serverTime: number) {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ serverTime }),
      }),
    ),
  );
}

async function flushSync() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('Countdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(T0));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('shows a syncing placeholder until the server time arrives', async () => {
    stubServerTimeFetch(T0);

    render(<Countdown endDate={new Date(T0 + 60_000).toISOString()} />);

    expect(screen.getByTestId('countdown-syncing')).toBeInTheDocument();

    await flushSync();

    expect(screen.queryByTestId('countdown-syncing')).not.toBeInTheDocument();
  });

  it('renders days/hours/minutes/seconds from the server clock, not the client clock', async () => {
    // Server is 5 hours ahead of the (wrong) client clock.
    const SERVER_OFFSET_MS = 5 * 60 * 60 * 1000;
    stubServerTimeFetch(T0 + SERVER_OFFSET_MS);

    // Campaign ends in exactly 2 days by server time.
    render(<Countdown endDate={new Date(T0 + 2 * 24 * 60 * 60 * 1000).toISOString()} />);
    await flushSync();

    const countdown = screen.getByTestId('countdown');
    // A client-only computation would show 2 days; the server sync shows
    // 1 day + 19 hours because the server is already 5 hours further along.
    expect(countdown).toHaveTextContent('Days');
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getAllByText('00')).toHaveLength(2);
  });

  it('ticks down every second', async () => {
    stubServerTimeFetch(T0);
    const end = T0 + ((2 * 60 + 3) * 60 + 10) * 1000;

    render(<Countdown endDate={new Date(end).toISOString()} />);
    await flushSync();

    expect(screen.getByText('02')).toBeInTheDocument(); // hours
    expect(screen.getByText('03')).toBeInTheDocument(); // minutes
    expect(screen.getByText('10')).toBeInTheDocument(); // seconds

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('09')).toBeInTheDocument(); // seconds decremented
  });

  it('shows the ended state once expiry passes while ticking', async () => {
    stubServerTimeFetch(T0);
    // Ends 3 server-seconds after mount.
    render(<Countdown endDate={new Date(T0 + 3_000).toISOString()} />);
    await flushSync();

    expect(screen.queryByTestId('countdown-ended')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4_000);
    });

    expect(screen.getByTestId('countdown-ended')).toHaveTextContent(
      'Campaign Ended',
    );
    expect(screen.getByText(/no longer accepting donations/i)).toBeInTheDocument();
  });

  it('shows the ended state immediately for an already-expired campaign', async () => {
    stubServerTimeFetch(T0);

    render(<Countdown endDate={new Date(T0 - 1000).toISOString()} />);
    await flushSync();

    expect(screen.getByTestId('countdown-ended')).toHaveTextContent(
      'Campaign Ended',
    );
  });
});
