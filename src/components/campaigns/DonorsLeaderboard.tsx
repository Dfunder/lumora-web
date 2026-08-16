import React, { useState } from "react";

type Donor = {
  rank: number;
  wallet: string;
  amount: number;
  asset: string;
  timestamp: string;
};

type DonorsLeaderboardProps = {
  donors: Donor[];
};

const DonorsLeaderboard: React.FC<DonorsLeaderboardProps> = ({ donors }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 20;

  const indexOfLastDonor = currentPage * donorsPerPage;
  const indexOfFirstDonor = indexOfLastDonor - donorsPerPage;
  const currentDonors = donors.slice(indexOfFirstDonor, indexOfLastDonor);

  const totalPages = Math.ceil(donors.length / donorsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Donors Leaderboard</h2>
      <p className="mb-6 text-gray-600">Total Donors: {donors.length}</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentDonors.map((donor, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {donor.rank}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donor.wallet === "Anonymous"
                    ? "Anonymous"
                    : `${donor.wallet.substring(0, 6)}...${donor.wallet.substring(donor.wallet.length - 4)}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donor.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donor.asset}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {donor.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="py-3 flex items-center justify-between border-t border-gray-200">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">{indexOfFirstDonor + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(indexOfLastDonor, donors.length)}
              </span>{" "}
              of <span className="font-medium">{donors.length}</span> results
            </p>
          </div>
          <div>
            <nav
              className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
              aria-label="Pagination"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === number ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"}`}
                  >
                    {number}
                  </button>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorsLeaderboard;
