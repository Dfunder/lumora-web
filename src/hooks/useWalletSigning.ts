"use client";

import { useCallback, useState } from "react";

import type { DonationAssetId } from "@/lib/donation";

export interface DonationSigningRequest {
  campaignId: string;
  amount: number;
  asset: DonationAssetId;
  anonymous: boolean;
}

export interface SignedDonation {
  /** Transaction signature returned by the signer. */
  txHash: string;
}

export interface WalletSigner {
  signDonation(request: DonationSigningRequest): Promise<SignedDonation>;
}

export const NO_WALLET_SIGNER_ERROR =
  "No wallet detected. Please install a browser wallet to donate.";

function buildDonationMessage(request: DonationSigningRequest): string {
  return [
    "Lumora donation",
    `Campaign: ${request.campaignId}`,
    `Amount: ${request.amount} ${request.asset}`,
    request.anonymous ? "Anonymous: yes" : "Anonymous: no",
  ].join("\n");
}

/**
 * Default signer backed by the injected browser wallet (`window.ethereum`).
 *
 * NOTE: this is a stubbed signing flow — it proves donor intent with a
 * `personal_sign` signature and returns it as the donation reference.
 * Replacing it with a real Stellar transaction submission only requires
 * providing a different `WalletSigner`.
 */
export const injectedWalletSigner: WalletSigner = {
  async signDonation(request) {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(NO_WALLET_SIGNER_ERROR);
    }

    let accounts: string[];
    try {
      accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
    } catch {
      throw new Error(
        "Could not access your wallet. Please unlock it and try again.",
      );
    }

    if (!accounts.length) {
      throw new Error("No accounts found. Please unlock your wallet.");
    }

    try {
      const signature = (await window.ethereum.request({
        method: "personal_sign",
        params: [buildDonationMessage(request), accounts[0]],
      })) as string;
      return { txHash: signature };
    } catch {
      throw new Error(
        "Donation was rejected. Please approve the request in your wallet.",
      );
    }
  },
};

interface UseWalletSigningResult {
  signDonation: (
    request: DonationSigningRequest,
  ) => Promise<SignedDonation | null>;
  isSigning: boolean;
  signingError: string | null;
  signedDonation: SignedDonation | null;
  reset: () => void;
}

/**
 * Drives the Donate → wallet-signing flow for the donation widget.
 * Pass a custom `signer` to swap in a real on-chain implementation; the
 * default stub signs with the injected browser wallet.
 */
export function useWalletSigning(
  signer: WalletSigner = injectedWalletSigner,
): UseWalletSigningResult {
  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState<string | null>(null);
  const [signedDonation, setSignedDonation] = useState<SignedDonation | null>(
    null,
  );

  const signDonation = useCallback(
    async (request: DonationSigningRequest) => {
      setIsSigning(true);
      setSigningError(null);
      setSignedDonation(null);
      try {
        const result = await signer.signDonation(request);
        setSignedDonation(result);
        return result;
      } catch (error) {
        setSigningError(
          error instanceof Error
            ? error.message
            : "Donation failed. Please try again.",
        );
        return null;
      } finally {
        setIsSigning(false);
      }
    },
    [signer],
  );

  const reset = useCallback(() => {
    setSigningError(null);
    setSignedDonation(null);
  }, []);

  return { signDonation, isSigning, signingError, signedDonation, reset };
}
