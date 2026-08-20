import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type CampaignStatusFilter =
  | "all"
  | "draft"
  | "active"
  | "completed";

export interface CampaignFilters {
  search: string;
  status: CampaignStatusFilter;
}

export interface CampaignState {
  selectedCampaignId: string | null;
  filters: CampaignFilters;
  selectCampaign: (campaignId: string | null) => void;
  setFilters: (filters: Partial<CampaignFilters>) => void;
  resetCampaignState: () => void;
}

const initialCampaignState = {
  selectedCampaignId: null,
  filters: {
    search: "",
    status: "all" as CampaignStatusFilter,
  },
};

export const useCampaignStore = create<CampaignState>()(
  devtools(
    (set) => ({
      ...initialCampaignState,
      selectCampaign: (selectedCampaignId) =>
        set({ selectedCampaignId }, false, "campaign/selectCampaign"),
      setFilters: (filters) =>
        set(
          (state) => ({ filters: { ...state.filters, ...filters } }),
          false,
          "campaign/setFilters",
        ),
      resetCampaignState: () =>
        set(initialCampaignState, false, "campaign/resetCampaignState"),
    }),
    {
      name: "campaign-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
