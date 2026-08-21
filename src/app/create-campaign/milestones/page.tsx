"use client";

import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaignStore";
import { useState } from "react";

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

export default function MilestonesPage() {
  const router = useRouter();
  const { creationData, updateCreationData, setCreationStep } = useCampaignStore();
  const [milestones, setMilestones] = useState<Milestone[]>(creationData.milestones || []);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: "",
    description: "",
    amount: 0,
    dueDate: "",
  });

  const handlePrevious = () => {
    setCreationStep(2);
    router.push("/create-campaign/details");
  };

  const handleReview = () => {
    updateCreationData({ milestones });
    setCreationStep(4);
    router.push("/create-campaign");
  };

  const addMilestone = () => {
    if (newMilestone.title && newMilestone.amount > 0) {
      setMilestones([...milestones, newMilestone]);
      setNewMilestone({ title: "", description: "", amount: 0, dueDate: "" });
    }
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    setMilestones(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Milestones</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {/* Existing Milestones */}
          {milestones.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Milestones</h3>
              <ul className="space-y-4">
                {milestones.map((milestone, index) => (
                  <li key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Amount: ${milestone.amount.toLocaleString()} | Due: {milestone.dueDate}
                        </p>
                      </div>
                      <button
                        onClick={() => removeMilestone(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add New Milestone */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Milestone</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="milestoneTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="milestoneTitle"
                    value={newMilestone.title}
                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="milestoneAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="milestoneAmount"
                    value={newMilestone.amount || ""}
                    onChange={(e) => setNewMilestone({ ...newMilestone, amount: Number(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="milestoneDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="milestoneDescription"
                  rows={3}
                  value={newMilestone.description}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="milestoneDueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  id="milestoneDueDate"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-text-sm"
                />
              </div>
              <button
                onClick={addMilestone}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Milestone
              </button>
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
              onClick={handleReview}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Review & Deploy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}