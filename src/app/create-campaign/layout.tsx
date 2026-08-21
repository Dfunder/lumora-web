"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreateCampaignLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // If someone visits the root of create-campaign, redirect to the first step
    if (window.location.pathname === "/create-campaign") {
      router.push("/create-campaign/basic");
    }
  }, [router]);

  return <>{children}</>;
}