"use client";

import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaignStore";

export default function BasicInformationPage() {
  const router = useRouter();
  const { creationData, updateCreationData, setCreationStep } = useCampaignStore();

  const handleNext = () => {
    setCreationStep(2);
    router.push("/create-campaign/details");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Basic Information</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Campaign Title
              </label>
              <input
                type="text"
                id="title"
                value={creationData.title || ""}
                onChange={(e) => updateCreationData({ title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <input
                type="text"
                id="creatorName"
                value={creationData.creatorName || ""}
                onChange={(e) => updateCreationData({ creatorName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                value={creationData.category || "general"}
                onChange={(e) => updateCreationData({ category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="general">General</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="technology">Technology</option>
                <option value="community">Community</option>
                <option value="arts">Arts & Culture</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next: Campaign Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}