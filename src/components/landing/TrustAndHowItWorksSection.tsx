'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { formatMetricValue, normalizePlatformStats, type NormalizedPlatformStats } from '@/lib/platformStats';

const steps = [
  {
    title: 'Connect',
    description: 'Creators and supporters connect a Stellar wallet to join or launch a campaign instantly.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    title: 'Launch',
    description: 'A campaign is published with a transparent goal, milestone, and release logic on-chain.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
      </svg>
    ),
  },
  {
    title: 'Receive',
    description: 'Supporters send funds directly into the campaign contract, creating a public trail of contributions.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h18M7 12l4-4m0 0l4 4m-4-4v10" />
      </svg>
    ),
  },
  {
    title: 'Automated Release',
    description: 'Once milestones are met, the contract auto-releases funds without hidden intermediaries.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
];

function AnimatedMetric({
  label,
  value,
  isVisible,
  suffix = '',
}: {
  label: string;
  value: number;
  isVisible: boolean;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    let animationFrame = 0;
    let startTime: number | null = null;
    const duration = 1200;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(1, (timestamp - startTime) / duration);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + (endValue - startValue) * easedProgress));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
      }
    };

    animationFrame = window.requestAnimationFrame(step);

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isVisible, value]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
        {formatMetricValue(displayValue)}{suffix}
      </p>
    </div>
  );
}

export default function TrustAndHowItWorksSection() {
  const statsSectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const { data, isLoading } = useQuery<NormalizedPlatformStats>({
    queryKey: queryKeys.campaigns.list({ limit: 1 }),
    queryFn: async () => {
      const response = await api.get('/platform/stats');
      return normalizePlatformStats(response.data);
    },
    retry: 1,
    staleTime: 60_000,
  });

  useEffect(() => {
    const element = statsSectionRef.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = data ?? {
    totalTransactions: 0,
    xlmRaised: 0,
    contractsDeployed: 0,
  };

  return (
    <section className="bg-slate-950 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              See every step before you connect a wallet
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Lumora turns fundraising into a clear, auditable flow so visitors can understand the mechanics and trust the outcome.
            </p>

            <div className="mt-10 flex flex-col gap-4 lg:flex-row">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-black/20"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {step.icon}
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm font-semibold text-slate-400">
                    <span className="text-lg text-blue-400">0{index + 1}</span>
                    <span>{step.title}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <section
            ref={statsSectionRef}
            className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/30"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Trust</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  Live transparency stats
                </h3>
              </div>
              <a
                href="https://stellar.expert/explorer/public"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition hover:border-blue-400 hover:bg-blue-500/20"
              >
                Verify on Stellar Explorer
              </a>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              These numbers are pulled directly from the platform stats endpoint so supporters can inspect the flow before connecting a wallet.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {isLoading ? (
                <>
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-800/80" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-800/80" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-800/80" />
                </>
              ) : (
                <>
                  <AnimatedMetric label="Total transactions" value={stats.totalTransactions} isVisible={isVisible} />
                  <AnimatedMetric label="XLM raised" value={stats.xlmRaised} isVisible={isVisible} suffix="+" />
                  <AnimatedMetric label="Contracts deployed" value={stats.contractsDeployed} isVisible={isVisible} />
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
