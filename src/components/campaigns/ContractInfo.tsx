import React from "react";

type ContractMilestoneSummary = {
  title: string;
  targetAmount: number;
  status: "Locked" | "Unlocked" | "Released";
};

type Transaction = {
  hash: string;
  type: string;
  amount: number;
  asset: string;
  timestamp: string;
};

type ContractInfoData = {
  address: string;
  network: "Testnet" | "Mainnet";
  milestones: ContractMilestoneSummary[];
  transactions: Transaction[];
};

type ContractInfoProps = {
  contractInfo: ContractInfoData;
};

const getNetworkBadgeClasses = (network: ContractInfoData["network"]) =>
  network === "Mainnet"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

const truncateHash = (hash: string) =>
  hash.length > 14 ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}` : hash;

const ContractInfo: React.FC<ContractInfoProps> = ({ contractInfo }) => {
  const stellarExpertUrl = `https://stellar.expert/explorer/${
    contractInfo.network === "Mainnet" ? "public" : "testnet"
  }/contract/${contractInfo.address}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contract Info</h2>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="items-center justify-between sm:flex">
            <div>
              <div className="text-xs font-normal text-gray-400">
                Contract ID
              </div>
              <a
                href={stellarExpertUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center mt-1 text-sm font-medium text-blue-600 hover:underline"
              >
                {truncateHash(contractInfo.address)}
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
            </div>
            <span
              className={`mt-3 sm:mt-0 inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getNetworkBadgeClasses(
                contractInfo.network,
              )}`}
            >
              {contractInfo.network}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Milestones &amp; Release Conditions
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Funds are held in escrow by the smart contract and released to the
          creator in stages as each milestone is verified.
        </p>
        <ul className="space-y-3">
          {contractInfo.milestones.map((milestone, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-900">
                {milestone.title}
              </span>
              <span className="text-sm text-gray-500">
                ${milestone.targetAmount.toLocaleString()} USD &middot;{" "}
                {milestone.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Transaction History
        </h3>
        {contractInfo.transactions.length === 0 ? (
          <p className="text-sm text-gray-500">
            No on-chain transactions yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Tx Hash
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractInfo.transactions.map((tx) => (
                  <tr key={tx.hash}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <a
                        href={`${stellarExpertUrl.replace(/\/contract\/.*/, "")}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {truncateHash(tx.hash)}
                      </a>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {tx.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {tx.amount.toLocaleString()} {tx.asset}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractInfo;
