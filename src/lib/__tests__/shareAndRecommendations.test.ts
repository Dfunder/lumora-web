import { describe, expect, it, vi, beforeEach } from "vitest";
import api, {
  getCampaignShares,
  incrementCampaignShare,
  getRelatedCampaigns,
} from "../api";

describe("Share and Recommendation API Helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getCampaignShares", () => {
    it("returns shareCount from backend response", async () => {
      vi.spyOn(api, "get").mockResolvedValueOnce({
        data: { shareCount: 42 },
      });

      const count = await getCampaignShares("camp-1");
      expect(count).toBe(42);
      expect(api.get).toHaveBeenCalledWith("/campaigns/camp-1/shares");
    });

    it("returns fallback 0 on error", async () => {
      vi.spyOn(api, "get").mockRejectedValueOnce(new Error("Network Error"));

      const count = await getCampaignShares("camp-1");
      expect(count).toBe(0);
    });
  });

  describe("incrementCampaignShare", () => {
    it("posts to endpoint and returns updated shareCount", async () => {
      vi.spyOn(api, "post").mockResolvedValueOnce({
        data: { shareCount: 43 },
      });

      const res = await incrementCampaignShare("camp-1");
      expect(res.shareCount).toBe(43);
      expect(api.post).toHaveBeenCalledWith("/campaigns/camp-1/share");
    });

    it("returns fallback shareCount on error", async () => {
      vi.spyOn(api, "post").mockRejectedValueOnce(new Error("Network Error"));

      const res = await incrementCampaignShare("camp-1");
      expect(res.shareCount).toBe(1);
    });
  });

  describe("getRelatedCampaigns", () => {
    it("returns array of recommendations from backend endpoint", async () => {
      const mockCampaigns = [
        { id: "2", title: "Related 1", category: "education" },
        { id: "3", title: "Related 2", category: "education" },
        { id: "4", title: "Related 3", category: "education" },
      ];

      vi.spyOn(api, "get").mockResolvedValueOnce({
        data: mockCampaigns,
      });

      const recommendations = await getRelatedCampaigns("1", "education");
      expect(recommendations).toEqual(mockCampaigns);
      expect(api.get).toHaveBeenCalledWith("/campaigns/1/recommendations");
    });

    it("falls back to fetching campaigns by category if recommendations endpoint fails", async () => {
      vi.spyOn(api, "get")
        .mockRejectedValueOnce(new Error("404 Not Found"))
        .mockResolvedValueOnce({
          data: {
            data: [
              { id: "1", title: "Current Campaign", category: "education" },
              { id: "2", title: "Related 1", category: "education" },
              { id: "3", title: "Related 2", category: "education" },
              { id: "4", title: "Related 3", category: "education" },
            ],
          },
        });

      const recommendations = await getRelatedCampaigns("1", "education");
      expect(recommendations).toHaveLength(3);
      expect(recommendations.some((c) => c.id === "1")).toBe(false);
    });
  });
});
