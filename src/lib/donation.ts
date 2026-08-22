export type DonationAssetId = "XLM" | "USDC" | "AQUA";

export interface DonationAsset {
  id: DonationAssetId;
  label: string;
}

export const DONATION_ASSETS: readonly DonationAsset[] = [
  { id: "XLM", label: "Stellar Lumens" },
  { id: "USDC", label: "USD Coin" },
  { id: "AQUA", label: "Aqua" },
] as const;

/** Preset donation amounts offered as one-click options. */
export const DONATION_PRESETS: readonly number[] = [10, 25, 50] as const;

/**
 * Flat Stellar network fee per operation, in XLM (100 stroops).
 * The fee is always paid in XLM regardless of the donated asset.
 */
export const NETWORK_FEE_XLM = 0.00001;

export interface FeeEstimate {
  asset: DonationAssetId;
  amount: number;
  /** Network fee expressed in XLM. */
  networkFeeXlm: number;
  /** Total debit: `amount + fee` when paying in XLM, otherwise just the amount. */
  total: number;
  totalAsset: DonationAssetId;
}

export function isDonationAsset(value: unknown): value is DonationAssetId {
  return DONATION_ASSETS.some((asset) => asset.id === value);
}

/**
 * Parse a user-typed amount into a positive finite number.
 * Returns null when the input is empty, malformed or not greater than zero.
 */
export function parseAmount(input: string): number | null {
  if (!input.trim()) return null;
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Resolve which preset (if any) matches an amount so the UI can highlight it.
 * Returns -1 for custom amounts.
 */
export function resolveActivePreset(amount: number | null): number {
  if (amount === null) return -1;
  return DONATION_PRESETS.findIndex((preset) => preset === amount);
}

/** Build the fee estimate shown to the donor before confirming. */
export function estimateFee(
  amount: number,
  asset: DonationAssetId,
): FeeEstimate {
  const paysFeeInSameAsset = asset === "XLM";
  return {
    asset,
    amount,
    networkFeeXlm: NETWORK_FEE_XLM,
    total: paysFeeInSameAsset ? amount + NETWORK_FEE_XLM : amount,
    totalAsset: paysFeeInSameAsset ? "XLM" : asset,
  };
}
