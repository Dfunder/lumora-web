import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore, type AuthStatus } from "./authStore";
import api, { getAuthChallenge, verifyWalletSignature } from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type WalletConnectionStep =
  | "idle"
  | "connecting"
  | "connected"
  | "authenticating"
  | "done"
  | "error";

export interface WalletState {
  selectedWalletId: string | null;
  isWalletPanelOpen: boolean;
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  step: WalletConnectionStep;
  walletError: string | null;
  authStatus: AuthStatus;

  selectWallet: (walletId: string | null) => void;
  setWalletPanelOpen: (isOpen: boolean) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  setConnectionState: (
    isConnected: boolean,
    address?: string,
    balance?: string,
  ) => void;
  resetWalletState: () => void;
}

const initialWalletState: {
  selectedWalletId: null;
  isWalletPanelOpen: false;
  isConnected: false;
  address: null;
  balance: null;
  step: WalletConnectionStep;
  walletError: null;
  authStatus: AuthStatus;
} = {
  selectedWalletId: null,
  isWalletPanelOpen: false,
  isConnected: false,
  address: null,
  balance: null,
  step: "idle",
  walletError: null,
  authStatus: "idle",
};

// Friendly labels for wallet connection errors.
function walletFriendlyError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("No accounts found")) {
      return "No wallet accounts found. Please unlock your wallet and try again.";
    }
    if (msg.includes("User rejected")) {
      return "Connection was rejected. Please approve the request in your wallet.";
    }
    if (msg.includes("Signature verification failed")) {
      return "Signature verification failed. Please try connecting your wallet again.";
    }
    if (msg.includes("Could not start wallet")) {
      return "Could not reach the server. Please check your connection and try again.";
    }
    if (msg.includes("Could not verify your wallet")) {
      return "Could not verify your wallet. Please try again.";
    }
    return "Failed to connect wallet. Please try again.";
  }
  return "An unexpected error occurred. Please try again.";
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      ...initialWalletState,

      selectWallet: (selectedWalletId) =>
        set({ selectedWalletId }, false, "wallet/selectWallet"),

      setWalletPanelOpen: (isWalletPanelOpen) =>
        set({ isWalletPanelOpen }, false, "wallet/setWalletPanelOpen"),

      connectWallet: async () => {
        const authStore = useAuthStore.getState();

        // Prevent duplicate connect attempts.
        const currentStep = get().step;
        if (currentStep === "connecting" || currentStep === "authenticating") {
          return;
        }

        try {
          set(
            {
              step: "connecting",
              walletError: null,
            },
            false,
            "wallet/connectWallet/start",
          );

          // -- MetaMask / injected wallet path --
          if (typeof window !== "undefined" && window.ethereum) {
            let accounts: string[];
            try {
              accounts = (await window.ethereum.request({
                method: "eth_requestAccounts",
              })) as string[];
            } catch {
              throw new Error("No accounts found. Please unlock MetaMask.");
            }

            if (!accounts.length) {
              throw new Error("No accounts found. Please unlock MetaMask.");
            }

            const address = accounts[0];

            set(
              {
                isConnected: true,
                address,
                selectedWalletId: "metamask",
                step: "connected",
              },
              false,
              "wallet/connectWallet/connected",
            );

            // --- Challenge ---
            authStore.setStatus("challenging");
            set(
              { authStatus: "challenging" },
              false,
              "wallet/connectWallet/challenging",
            );

            const { challenge } = await getAuthChallenge(address);

            // --- Signing ---
            authStore.setStatus("signing");
            set(
              { authStatus: "signing" },
              false,
              "wallet/connectWallet/signing",
            );

            let signature: string;
            try {
              signature = (await window.ethereum.request({
                method: "personal_sign",
                params: [challenge, address],
              })) as string;
            } catch {
              // User cancelled the signature request — rollback cleanly.
              throw new Error(
                "Connection was rejected. Please approve the request in your wallet.",
              );
            }

            // --- Verification ---
            authStore.setStatus("verifying");
            set(
              { authStatus: "verifying", step: "authenticating" },
              false,
              "wallet/connectWallet/verifying",
            );

            const result = await verifyWalletSignature(address, signature);

            // Only commit auth *after* verification succeeds.
            authStore.setAuth({
              user: result.user,
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            });

            // Fetch balance (non-critical).
            let balance: string | null = null;
            try {
              const rawBalance = (await window.ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
              })) as string;
              balance = rawBalance
                ? parseInt(rawBalance, 16).toString()
                : null;
            } catch {
              // Balance fetch failure is non-critical.
            }

            set(
              {
                balance,
                step: "done",
                authStatus: "authenticated",
                walletError: null,
              },
              false,
              "wallet/connectWallet/done",
            );
          } else {
            // -- Demo / no-wallet path --
            const demoAddress =
              "0x742d35Cc6434Bb0532C4457A88B95935F72C0770";

            authStore.setStatus("challenging");
            set(
              { authStatus: "challenging" },
              false,
              "wallet/connectWallet/demo/challenging",
            );

            const { challenge } = await getAuthChallenge(demoAddress);

            authStore.setStatus("signing");
            set(
              { authStatus: "signing" },
              false,
              "wallet/connectWallet/demo/signing",
            );

            const signature = `0x${btoa(challenge)}`;

            authStore.setStatus("verifying");
            set(
              { authStatus: "verifying" },
              false,
              "wallet/connectWallet/demo/verifying",
            );

            const result = await verifyWalletSignature(demoAddress, signature);

            authStore.setAuth({
              user: result.user,
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            });

            set(
              {
                isConnected: true,
                address: demoAddress,
                balance: "1000000000000000000",
                selectedWalletId: "demo",
                step: "done",
                authStatus: "authenticated",
                walletError: null,
              },
              false,
              "wallet/connectWallet/demo/done",
            );
          }
        } catch (error) {
          const message = walletFriendlyError(error);

          // Roll back to a clean idle state — never leave partial auth.
          authStore.clearAuth();
          set(
            {
              ...initialWalletState,
              step: "error",
              walletError: message,
              authStatus: "error",
            },
            false,
            "wallet/connectWallet/error",
          );
          console.error("Failed to connect wallet:", error);
        }
      },

      disconnectWallet: async () => {
        try {
          await api.post("/auth/logout");
        } catch (error) {
          console.error("Failed to logout from backend", error);
        }
        useAuthStore.getState().clearAuth();
        set(
          { ...initialWalletState },
          false,
          "wallet/disconnectWallet",
        );
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      },

      setConnectionState: (isConnected, address, balance) =>
        set(
          {
            isConnected,
            address: address || null,
            balance: balance || null,
          },
          false,
          "wallet/setConnectionState",
        ),

      resetWalletState: () =>
        set(initialWalletState, false, "wallet/resetWalletState"),
    }),
    {
      name: "wallet-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
