import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Campaign } from "@/types/campaign";

// Campaign creation state for multi-step flow
export interface CampaignCreationData extends Omit<Campaign, 'id' | 'raisedAmount' | 'donorCount' | 'createdAt' | 'isVerified'> {
  // Additional fields that might be collected during creation
  termsAccepted: boolean;
  milestones: Array<{ title: string; description: string; amount: number; dueDate: string }>;
  updates: Array<{ title: string; content: string; createdAt: string }>;
}

export type DeploymentStatus = 
  | "idle"
  | "signing"
  | "deploying"
  | "success"
  | "error";

export interface CampaignState {
  // Campaign creation state
  creationStep: number;
  creationData: Partial<CampaignCreationData>;
  deploymentStatus: DeploymentStatus;
  deploymentError: string | null;
  deployedCampaignId: string | null;
  // Actions
  setCreationStep: (step: number) => void;
  updateCreationData: (data: Partial<CampaignCreationData>) => void;
  resetCreationData: () => void;
  setDeploymentStatus: (status: DeploymentStatus, error?: string | null, campaignId?: string | null) => void;
  resetCampaign: () => void;
}

const initialCreationData: Partial<CampaignCreationData> = {
  title: "",
  description: "",
  coverImage: "",
  goalAmount: 0,
  currency: "$",
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  creatorAddress: "",
  creatorName: "",
  category: "general",
  status: "draft",
  termsAccepted: false,
  milestones: [],
  updates: [],
};

const initialCampaignState = {
  creationStep: 1,
  creationData: initialCreationData,
  deploymentStatus: "idle" as DeploymentStatus,
  deploymentError: null,
  deployedCampaignId: null,
};

export const useCampaignStore = create<CampaignState>()(
  devtools(
    (set) => ({
      ...initialCampaignState,
      setCreationStep: (creationStep) => set({ creationStep }, false, "campaign/setCreationStep"),
      updateCreationData: (data) => 
        set(
          (state) => ({ creationData: { ...state.creationData, ...data } }),
          false,
          "campaign/updateCreationData"
        ),
      resetCreationData: () => 
        set(
          { creationData: initialCreationData, creationStep: 1, deploymentStatus: "idle", deploymentError: null, deployedCampaignId: null },
          false,
          "campaign/resetCreationData"
        ),
      setDeploymentStatus: (deploymentStatus, error = null, campaignId = null) => 
        set(
          { deploymentStatus, deploymentError: error, deployedCampaignId: campaignId },
          false,
          "campaign/setDeploymentStatus"
        ),
      resetCampaign: () =>
        set(initialCampaignState, false, "campaign/resetCampaign"),
    }),
    {
      name: "campaign-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);