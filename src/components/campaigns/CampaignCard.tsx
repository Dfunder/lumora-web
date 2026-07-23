'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import type { Campaign } from '@/types/campaign';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(campaign.endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysRemaining(diffDays);
  }, [campaign.endDate]);

  const progress = campaign.goalAmount > 0
    ? Math.min(100, Math.round((campaign.raisedAmount / campaign.goalAmount) * 100))
    : 0;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 via-white to-purple-100">
        {campaign.coverImage ? (
          <img
            src={campaign.coverImage}
            alt={campaign.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-blue-400">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9A2.5 2.5 0 0118.5 19h-13A2.5 2.5 0 013 16.5v-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
            </svg>
          </div>
        )}
        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 shadow-sm">
            {daysRemaining} days left
          </div>
        )}
        {daysRemaining !== null && daysRemaining <= 0 && (
          <div className="absolute top-4 right-4 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800 shadow-sm">
            Ending soon
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Title and Verification Badge */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {campaign.title}
          </h2>
          {campaign.isVerified && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 20 20">
                <path
                  d="m5 10 3 3 7-7"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              Verified
            </div>
          )}
        </div>

        {/* Description */}
        <p className="mt-2 text-sm leading-6 text-gray-600 line-clamp-3">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-500">
            <span>
              {campaign.currency}
              {campaign.raisedAmount.toLocaleString()} raised
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{campaign.donorCount} donors</span>
          <span className="font-medium text-blue-600">View campaign</span>
        </div>
      </div>
    </Link>
  );
}

export function CampaignCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="space-y-3 p-6">
        <div className="h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
        <div className="mt-2 h-2 w-full rounded bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
