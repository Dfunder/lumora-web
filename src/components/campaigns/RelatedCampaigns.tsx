"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getRelatedCampaigns } from "@/lib/api";
import { CampaignCard, CampaignCardSkeleton } from "./CampaignCard";
import type { Campaign } from "@/types/campaign";

interface RelatedCampaignsProps {
  campaignId: string;
  category: string;
}

function mapApiCampaignToType(
  apiCampaign: Record<string, unknown>,
): Campaign {
  const creator = (apiCampaign.creator as Record<string, unknown>) || {};
  return {
    id: String(apiCampaign.id || ""),
    title: (apiCampaign.title as string) || "Related Campaign",
    description: (apiCampaign.description as string) || "",
    coverImage:
      (apiCampaign.coverImage as string) ||
      (apiCampaign.image as string) ||
      "",
    goalAmount:
      (apiCampaign.goalAmount as number) ||
      (apiCampaign.goal as number) ||
      0,
    raisedAmount:
      (apiCampaign.raisedAmount as number) ||
      (apiCampaign.raised as number) ||
      0,
    currency: (apiCampaign.currency as string) || "$",
    endDate:
      (apiCampaign.endDate as string) ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    donorCount: (apiCampaign.donorCount as number) || 0,
    creatorAddress:
      (apiCampaign.creatorAddress as string) ||
      (creator.address as string) ||
      "",
    creatorName:
      (apiCampaign.creatorName as string) ||
      (creator.name as string) ||
      "",
    isVerified: Boolean(apiCampaign.isVerified),
    category: (apiCampaign.category as string) || "general",
    status: (apiCampaign.status as "active" | "completed" | "draft") || "active",
    createdAt:
      (apiCampaign.createdAt as string) || new Date().toISOString(),
    shareCount: (apiCampaign.shareCount as number) || 0,
  };
}

export function RelatedCampaigns({
  campaignId,
  category,
}: RelatedCampaignsProps) {
  const { data: rawCampaigns = [], isLoading } = useQuery({
    queryKey: queryKeys.campaigns.recommendations(campaignId),
    queryFn: () => getRelatedCampaigns(campaignId, category),
    staleTime: 60_000,
  });

  const relatedCampaigns: Campaign[] = rawCampaigns
    .map(mapApiCampaignToType)
    .filter((c) => c.id !== campaignId)
    .slice(0, 3);

  if (isLoading) {
    return (
      <section className="mt-16 border-t border-gray-200 pt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Related Campaigns
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Discover more causes in {category || "this category"}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
          <CampaignCardSkeleton />
        </div>
      </section>
    );
  }

  if (relatedCampaigns.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Campaigns</h2>
        <p className="mt-1 text-sm text-gray-600">
          Discover more causes in {category || "this category"}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {relatedCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}
