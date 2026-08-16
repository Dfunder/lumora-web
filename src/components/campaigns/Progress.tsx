"use client";

import { useEffect, useState } from "react";

type ProgressProps = {
  raised: number;
  goal: number;
  currency?: string;
};

export const Progress = ({ raised, goal, currency = "ETH" }: ProgressProps) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    const calculatedPercentage = goal > 0 ? (raised / goal) * 100 : 0;
    setPercentage(calculatedPercentage);
  }, [raised, goal]);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-medium text-gray-600">
        <span>{`${currency} ${raised.toLocaleString()}`}</span>
        <span>{`${currency} ${goal.toLocaleString()}`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-right text-sm font-medium text-gray-600">
        {`${percentage.toFixed(2)}%`}
      </div>
    </div>
  );
};
