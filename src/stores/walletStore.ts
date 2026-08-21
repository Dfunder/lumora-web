import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import api, {
  getAuthChallenge,
  verifyWalletSignature,
  type VerifyResponse,
} from "@/lib/api";
import {
  buildDemoSignature,
  classifyWalletError,
  DEMO_WALLET_ADDRESS,
  isDemoWalletEnabled,
  NO_WALLET_DETECTED,
  type WalletErrorSource,
} from "@/lib/walletErrors";

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

/** Which signing path is being used for a wallet-authentication sequence. */
export type WalletAuthMode = "injected" | "demo";

interface WalletConnectionState {
  /** Address observed during the active connection flow. */
  address: string | null;
  balance: string | null;
  step: WalletConnectionStep;
  walletError: string | null;
  /** Which layer the last error came from (browser / wallet / backend). */
  walletErrorSource: WalletErrorSource | null;
  /** True while the active session came from the development-only demo path. */
  isDemoSession: boolean;
}

export interface WalletState extends WalletConnectionState {
  /**
   * Connect a wallet. Pass `{ demo: true }` to explicitly request the
   * development-only demo login (only honoured when demo mode is enabled).
   */
  connectWallet: (options?: { demo?: boolean }) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  /** Restore the initial (disconnected) wallet state in place. */
  resetWallet: () => void;
}

const initialWalletState: WalletConnectionState = {
  address: null,
  balance: null,
  step: "idle",
  walletError: null,
  walletErrorSource: null,
  isDemoSession: false,
};

// ---------------------------------------------------------------------------
// Shared wallet-authentication sequence
//
// Both the connect flow (connectWallet) and the re-auth modal run the exact
// same challenge → sign → verify sequence. Keeping it here means the two paths
// can't drift apart on status transitions, demo handling, or error messages.
// ---------------------------------------------------------------------------

/**
 * Run the challenge → sign → verify wallet-authentication sequence for an
 * already-resolved address and return the verified session. Commits nothing —
 * the caller decides whether to persist the session via the auth store.
 */
export async function authenticateWithWallet(
  address: string,
  mode: WalletAuthMode,
): Promise<VerifyResponse> {
  const authStore = useAuthStore.getState();

  // --- Challenge ---
  authStore.setStatus("challenging");
  const { challenge } = await getAuthChallenge(address);

  // --- Signing ---
  authStore.setStatus("signing");
  let signature: string;
  if (mode === "injected") {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(NO_WALLET_DETECTED);
    }
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
  } else {
    signature = buildDemoSignature(challenge);
  }

  // --- Verification ---
  authStore.setStatus("verifying");
  return verifyWalletSignature(address, signature);
}

// ---------------------------------------------------------------------------
// Derived session hook
//
// The auth store is the source of truth for "is the user connected" (it
// survives reloads), while the wallet store only holds the address observed
// during the active connection. Components should use this single derived view
// instead of re-deriving booleans/addresses locally.
// ---------------------------------------------------------------------------

export interface WalletSession {
  /** True when an authenticated session exists. */
  isConnected: boolean;
  /** Resolved address: the active connection's, or the restored session's. */
  address: string | null;
  isDemoSession: boolean;
}

export function useWalletSession(): WalletSession {
  const isConnected = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const address = useWalletStore((s) => s.address);
  const isDemoSession = useWalletStore((s) => s.isDemoSession);

  return {
    isConnected,
    address: address ?? user?.walletAddress ?? null,
    isDemoSession,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWalletStore = create<WalletState>()(
  devtools(
    (set, get) => ({
      ...initialWalletState,

      connectWallet: async (options) => {
        // Prevent duplicate connect attempts.
        const currentStep = get().step;
        if (currentStep === "connecting" || currentStep === "authenticating") {
          return;
        }

        const wantDemo = options?.demo === true;
        const hasInjectedWallet =
          typeof window !== "undefined" && !!window.ethereum;

        try {
          set(
            {
              step: "connecting",
              walletError: null,
              walletErrorSource: null,
            },
            false,
            "wallet/connectWallet/start",
          );

          // Resolve which address we are authenticating with.
          let address: string;
          let mode: WalletAuthMode;
          if (!wantDemo && hasInjectedWallet && window.ethereum) {
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

            address = accounts[0];
            mode = "injected";
          } else {
            // No injected wallet (or demo explicitly requested). The demo login
            // fabricates a signature, so it is strictly a development-only
            // convenience. Outside of an opted-in dev build we refuse rather
            // than silently signing the user in with a fake wallet.
            if (!isDemoWalletEnabled()) {
              throw new Error(NO_WALLET_DETECTED);
            }

            address = DEMO_WALLET_ADDRESS;
            mode = "demo";
          }

          set(
            { address, step: "connected" },
            false,
            "wallet/connectWallet/connected",
          );
          set(
            { step: "authenticating" },
            false,
            "wallet/connectWallet/authenticating",
          );

          const result = await authenticateWithWallet(address, mode);

          // Only commit auth *after* verification succeeds.
          useAuthStore.getState().setAuth({
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });

          // Fetch balance (non-critical).
          let balance: string | null = null;
          if (mode === "injected") {
            const provider = window.ethereum;
            if (provider) {
              try {
                const rawBalance = (await provider.request({
                  method: "eth_getBalance",
                  params: [address, "latest"],
                })) as string;
                balance = rawBalance
                  ? parseInt(rawBalance, 16).toString()
                  : null;
              } catch {
                // Balance fetch failure is non-critical.
              }
            }
          } else {
            balance = "1000000000000000000";
          }

          set(
            {
              balance,
              step: "done",
              walletError: null,
              walletErrorSource: null,
              isDemoSession: mode === "demo",
            },
            false,
            "wallet/connectWallet/done",
          );
        } catch (error) {
          const { source, message } = classifyWalletError(error);

          // Roll back to a clean idle state — never leave partial auth or a
          // stale address/balance behind. The user can retry immediately from
          // the error state without reloading the page.
          useAuthStore.getState().resetAuth();
          set(
            {
              ...initialWalletState,
              step: "error",
              walletError: message,
              walletErrorSource: source,
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
        useAuthStore.getState().resetAuth();
        // Reset in place — the UI reacts to store state, so there is no need to
        // force a full-page reload. This clears the address, balance and any
        // demo-session flag so no stale wallet data lingers after disconnect.
        get().resetWallet();
      },

      resetWallet: () => set(initialWalletState, false, "wallet/resetWallet"),
    }),
    {
      name: "wallet-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
