import React from "react";

type Milestone = {
  title: string;
  description: string;
  targetAmount: number;
  status: "Locked" | "Unlocked" | "Released";
  verificationLink?: string;
};

type MilestonesProps = {
  milestones: Milestone[];
};

const Milestones: React.FC<MilestonesProps> = ({ milestones }) => {
  const getStatusBadgeColor = (status: Milestone["status"]) => {
    switch (status) {
      case "Locked":
        return "bg-gray-500";
      case "Unlocked":
        return "bg-yellow-500";
      case "Released":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Milestones</h2>
      <div className="relative border-l-2 border-gray-200">
        {milestones.map((milestone, index) => (
          <div key={index} className="mb-10 ml-6">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
              <svg
                className="w-2.5 h-2.5 text-blue-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z" />
                <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
              </svg>
            </span>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="items-center justify-between sm:flex">
                <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                  ${milestone.targetAmount.toLocaleString()} USD
                </time>
                <div className="text-lg font-semibold text-gray-900">
                  {milestone.title}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span
                  className={`text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ${getStatusBadgeColor(milestone.status)}`}
                >
                  {milestone.status}
                </span>
              </div>
              <p className="mt-2 text-base font-normal text-gray-500">
                {milestone.description}
              </p>
              {milestone.status === "Released" &&
                milestone.verificationLink && (
                  <a
                    href={milestone.verificationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:underline"
                  >
                    Verify on Stellar Expert
                    <svg
                      className="w-3 h-3 ml-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  </a>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Milestones;
