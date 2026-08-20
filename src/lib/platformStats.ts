export interface NormalizedPlatformStats {
  totalTransactions: number;
  xlmRaised: number;
  contractsDeployed: number;
  totalRaised?: number;
  activeCampaigns?: number;
  totalDonors?: number;
}

export function normalizePlatformStats(payload: Record<string, unknown> | null | undefined): NormalizedPlatformStats {
  const asNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  return {
    totalTransactions: asNumber(payload?.totalTransactions ?? payload?.transactions ?? payload?.totalTxs ?? payload?.totalTransactionsCount),
    xlmRaised: asNumber(payload?.totalRaisedXlm ?? payload?.xlmRaised ?? payload?.totalRaised ?? payload?.raisedXlm),
    contractsDeployed: asNumber(payload?.contractsDeployed ?? payload?.contracts ?? payload?.smartContractsDeployed),
    totalRaised: asNumber(payload?.totalRaised),
    activeCampaigns: asNumber(payload?.activeCampaigns),
    totalDonors: asNumber(payload?.totalDonors),
  };
}

export function formatMetricValue(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `${(absValue / 1_000_000).toFixed(absValue % 1_000_000 === 0 ? 0 : 1)}M`;
  }

  if (absValue >= 1_000) {
    return `${(absValue / 1_000).toFixed(absValue % 1_000 === 0 ? 0 : 1)}K`;
  }

  return value.toLocaleString();
}
