"use client";

import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaignStore";

export default function CampaignDetailsPage() {
  const router = useRouter();
  const { creationData, updateCreationData, setCreationStep } = useCampaignStore();

  const handlePrevious = () => {
    setCreationStep(1);
    router.push("/create-campaign/basic");
  };

  const handleNext = () => {
    setCreationStep(3);
    router.push("/create-campaign/milestones");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Campaign Details</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="goalAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Goal Amount
              </label>
              <input
                type="number"
                id="goalAmount"
                value={creationData.goalAmount || ""}
                onChange={(e) => updateCreationData({ goalAmount: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={creationData.endDate || ""}
                onChange={(e) => updateCreationData({ endDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Description
              </label>
              <textarea
                id="description"
                rows={6}
                value={creationData.description || ""}
                onChange={(e) => updateCreationData({ description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                value={creationData.coverImage || ""}
                onChange={(e) => updateCreationData({ coverImage: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={handlePrevious}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next: Milestones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}