"use client";

import { useId } from "react";

import { useCreatorKycStatus } from "@/hooks/useCreatorKycStatus";
import type { KycStatus } from "@/types/kyc";

export interface CreatorVerificationBadgeProps {
  creatorId: string;
  className?: string;
  surface?: "card" | "profile";
}

interface BadgePresentation {
  label: string;
  tooltip: string;
  classes: string;
  icon: "check" | "alert" | "loading" | "unknown";
}

const VERIFIED_TOOLTIP =
  "Lumora has confirmed this campaign creator's identity through KYC. Verification does not guarantee the campaign or its outcome.";

function getUnverifiedTooltip(status: KycStatus): string {
  if (status === "pending") {
    return "This campaign creator's KYC review is still pending. Lumora has not yet confirmed their identity.";
  }

  if (status === "expired") {
    return "This campaign creator's KYC verification has expired. Lumora does not currently consider their identity verified.";
  }

  return "Lumora has not confirmed this campaign creator's identity through KYC. Consider this when deciding whether to donate.";
}

function BadgeIcon({ icon }: { icon: BadgePresentation["icon"] }) {
  if (icon === "loading") {
    return (
      <span
        aria-hidden="true"
        className="h-3.5 w-3.5 animate-pulse rounded-full bg-current opacity-40"
      />
    );
  }

  if (icon === "check") {
    return (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          d="m5 10 3 3 7-7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (icon === "alert") {
    return (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 20 20"
      >
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.75" />
        <path d="M10 6.5v4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
        <circle cx="10" cy="13.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8.5 8a1.5 1.5 0 1 1 2.3 1.27c-.51.32-.8.64-.8 1.23" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <circle cx="10" cy="13.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function CreatorVerificationBadge({
  creatorId,
  className = "",
  surface = "card",
}: CreatorVerificationBadgeProps) {
  const tooltipId = useId();
  const { data, isPending, isError } = useCreatorKycStatus(creatorId);

  let presentation: BadgePresentation;

  if (isPending) {
    presentation = {
      label: "Checking verification",
      tooltip: "Lumora is checking this campaign creator's KYC status.",
      classes: "border-gray-200 bg-gray-50 text-gray-600",
      icon: "loading",
    };
  } else if (isError || !data) {
    presentation = {
      label: "Verification unavailable",
      tooltip:
        "Lumora could not retrieve this campaign creator's KYC status. Try again shortly.",
      classes: "border-gray-300 bg-gray-100 text-gray-700",
      icon: "unknown",
    };
  } else if (data.status === "passed") {
    presentation = {
      label: "KYC verified",
      tooltip: VERIFIED_TOOLTIP,
      classes: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: "check",
    };
  } else {
    presentation = {
      label: "Not KYC verified",
      tooltip: getUnverifiedTooltip(data.status),
      classes: "border-amber-200 bg-amber-50 text-amber-800",
      icon: "alert",
    };
  }

  const surfaceClasses =
    surface === "profile" ? "px-3 py-1.5 text-sm" : "px-2 py-1 text-xs";

  return (
    <span
      aria-live="polite"
      className={`group relative inline-flex max-w-full ${className}`}
      data-kyc-status={data?.status ?? (isError ? "unavailable" : "loading")}
    >
      <span
        aria-describedby={tooltipId}
        className={`inline-flex cursor-help items-center gap-1.5 rounded-full border font-semibold ${surfaceClasses} ${presentation.classes} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
        tabIndex={0}
      >
        <BadgeIcon icon={presentation.icon} />
        <span>{presentation.label}</span>
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-md bg-gray-950 px-3 py-2 text-left text-xs font-normal leading-5 text-white opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        {presentation.tooltip}
      </span>
    </span>
  );
}
