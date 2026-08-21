"use client";

import { useRouter } from "next/navigation";
import { useCampaignStore } from "@/stores/campaignStore";
import { useWalletSession } from "@/stores/walletStore";
import { useState } from "react";
import { toast } from "sonner";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import type { Campaign } from "@/types/campaign";

// Define the steps in the campaign creation flow with their names and paths
// Stable fallback end date for the donor-facing preview (computed once at
// module scope so rendering stays pure).
const DEFAULT_END_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000,
).toISOString();

const CREATION_STEPS = [
  { id: 1, name: "Basic Information", path: "/create-campaign/basic" },
  { id: 2, name: "Campaign Details", path: "/create-campaign/details" },
  { id: 3, name: "Milestones", path: "/create-campaign/milestones" },
  { id: 4, name: "Review & Deploy", path: "/create-campaign" },
];

export default function ReviewAndDeployPage() {
  const router = useRouter();
  const { 
    creationData, 
    updateCreationData, 
    setDeploymentStatus, 
    deploymentStatus, 
    deploymentError,
    setCreationStep
  } = useCampaignStore();
  const { address, isConnected } = useWalletSession();
  
  const [showPreview, setShowPreview] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Estimated network fees (mock value - would be calculated from actual blockchain data)
  const estimatedFee = 0.002; // ETH
  const currency = creationData.currency || "$";

  // Prepare campaign data for preview
  const previewCampaign: Campaign = {
    id: "preview-campaign-id",
    title: creationData.title || "Untitled Campaign",
    description: creationData.description || "No description provided",
    coverImage: creationData.coverImage || "https://picsum.photos/800/400",
    goalAmount: creationData.goalAmount || 0,
    raisedAmount: 0,
    currency: currency,
    endDate: creationData.endDate || DEFAULT_END_DATE,
    donorCount: 0,
    creatorAddress: address || "0x0000000000000000000000000000000000000000",
    creatorName: creationData.creatorName || "Anonymous Creator",
    isVerified: false,
    category: creationData.category || "general",
    status: "active",
    createdAt: new Date().toISOString(),
  };

  // Handle terms checkbox change
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
    updateCreationData({ termsAccepted: e.target.checked });
  };

  // Handle editing a specific step
  const handleEditStep = (stepId: number, path: string) => {
    setCreationStep(stepId);
    router.push(path);
  };

  // Handle campaign deployment
  const handleDeploy = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions to proceed");
      return;
    }

    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      // Set status to signing (wallet interaction phase)
      setDeploymentStatus("signing");
      
      // In a real implementation, this would trigger the wallet to sign the transaction
      // For now, we'll simulate the signing and deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate deployment phase
      setDeploymentStatus("deploying");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful deployment
      const newCampaignId = `campaign-${Date.now()}`;
      setDeploymentStatus("success", null, newCampaignId);
      toast.success("Campaign deployed successfully!");
      
      // Redirect to the new campaign page after a short delay
      setTimeout(() => {
        router.push(`/campaigns/${newCampaignId}`);
      }, 1500);
    } catch (error) {
      // Handle deployment failure
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during deployment";
      setDeploymentStatus("error", errorMessage);
      toast.error(`Deployment failed: ${errorMessage}`);
    }
  };

  // Handle retry after failure
  const handleRetry = () => {
    setDeploymentStatus("idle");
  };

  // Check if all required fields are filled
  const isFormComplete = creationData.title && creationData.description && (creationData.goalAmount ?? 0) > 0 && termsAccepted;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Review & Deploy Your Campaign</h1>

        {/* Preview Toggle */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showPreview ? "Hide Preview" : "Show Donor-Facing Preview"}
          </button>
        </div>

        {/* Donor-facing Preview Mode */}
        {showPreview && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Donor-Facing Preview</h2>
            <CampaignCard campaign={previewCampaign} />
          </div>
        )}

        {/* Full Campaign Data Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Campaign Summary</h2>
          </div>

          {/* Render each section with edit links */}
          {CREATION_STEPS.slice(0, -1).map((step) => (
            <div key={step.id} className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{step.name}</h3>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {step.id === 1 && (
                      <ul className="space-y-1">
                        <li><span className="font-medium">Title:</span> {creationData.title || "Not provided"}</li>
                        <li><span className="font-medium">Creator Name:</span> {creationData.creatorName || "Not provided"}</li>
                        <li><span className="font-medium">Category:</span> {creationData.category || "Not provided"}</li>
                      </ul>
                    )}
                    {step.id === 2 && (
                      <ul className="space-y-1">
                        <li><span className="font-medium">Goal Amount:</span> {currency}{creationData.goalAmount?.toLocaleString() || "0"}</li>
                        <li><span className="font-medium">End Date:</span> {creationData.endDate || "Not provided"}</li>
                        <li><span className="font-medium">Description:</span> {creationData.description?.substring(0, 100) || "Not provided"}{creationData.description && creationData.description.length > 100 ? "..." : ""}</li>
                      </ul>
                    )}
                    {step.id === 3 && (
                      <ul className="space-y-1">
                        <li><span className="font-medium">Milestones:</span> {creationData.milestones?.length || 0} milestones defined</li>
                        {creationData.milestones?.map((milestone, idx) => (
                          <li key={idx} className="ml-4">• {milestone.title} ({currency}{milestone.amount.toLocaleString()})</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEditStep(step.id, step.path)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Terms & Conditions Checkbox */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                I agree to the terms and conditions
              </label>
              <p className="text-gray-500 dark:text-gray-400">
                I understand that deploying this campaign will create a transaction on the blockchain, and all funds raised will be handled according to the smart contract terms.
              </p>
            </div>
          </div>
        </div>

        {/* Parameter & Estimated Fee Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Deployment Details</h2>
          </div>
          <div className="px-6 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Address</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{address || "Not connected"}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Network</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">Ethereum Mainnet</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Gas Fee</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">~{estimatedFee} ETH</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Campaign Goal</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{currency}{creationData.goalAmount?.toLocaleString() || "0"}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Deployment Error Message */}
        {deploymentStatus === "error" && deploymentError && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Deployment Failed</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{deploymentError}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry Deployment
            </button>
          </div>
        )}

        {/* Deploy Button with Loading States */}
        <div className="flex justify-end">
          <button
            onClick={handleDeploy}
            disabled={!isFormComplete || deploymentStatus === "signing" || deploymentStatus === "deploying"}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isFormComplete && deploymentStatus !== "signing" && deploymentStatus !== "deploying"
                ? "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {(deploymentStatus === "signing" || deploymentStatus === "deploying") && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 016 12H2c0 2.983 1.234 5.686 3.227 7.66l1.773-2.369zM12 20c-2.21 0-4.163-.904-5.543-2.369l1.773-2.369A5.963 5.963 0 0012 18v2zm6-8a6 6 0 01-6 6v4c3.866 0 7-3.134 7-7h-4z"></path>
              </svg>
            )}
            {deploymentStatus === "idle" && "Deploy Campaign"}
            {deploymentStatus === "signing" && "Waiting for Wallet Signature..."}
            {deploymentStatus === "deploying" && "Deploying Campaign..."}
            {deploymentStatus === "success" && "Deployment Successful!"}
          </button>
        </div>
      </div>
    </div>
  );
}