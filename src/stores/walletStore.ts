import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore, type AuthStatus } from "./authStore";
import api, { getAuthChallenge, verifyWalletSignature } from "@/lib/api";
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

export interface WalletState {
  selectedWalletId: string | null;
  isWalletPanelOpen: boolean;
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  step: WalletConnectionStep;
  walletError: string | null;
  /** Which layer the last error came from (browser / wallet / backend). */
  walletErrorSource: WalletErrorSource | null;
  /** True while the active session came from the development-only demo path. */
  isDemoSession: boolean;
  authStatus: AuthStatus;

  selectWallet: (walletId: string | null) => void;
  setWalletPanelOpen: (isOpen: boolean) => void;
  /**
   * Connect a wallet. Pass `{ demo: true }` to explicitly request the
   * development-only demo login (only honoured when demo mode is enabled).
   */
  connectWallet: (options?: { demo?: boolean }) => Promise<void>;
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
  walletErrorSource: null;
  isDemoSession: false;
  authStatus: AuthStatus;
} = {
  selectedWalletId: null,
  isWalletPanelOpen: false,
  isConnected: false,
  address: null,
  balance: null,
  step: "idle",
  walletError: null,
  walletErrorSource: null,
  isDemoSession: false,
  authStatus: "idle",
};

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

      connectWallet: async (options) => {
        const authStore = useAuthStore.getState();

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

          // -- MetaMask / injected wallet path --
          // Used only for a real wallet and when the demo path wasn't requested.
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
                walletErrorSource: null,
                isDemoSession: false,
              },
              false,
              "wallet/connectWallet/done",
            );
          } else {
            // -- No injected wallet (or demo explicitly requested) --
            //
            // The demo login fabricates a signature instead of using a real
            // wallet, so it is strictly a development-only convenience. Outside
            // of an opted-in dev build we refuse rather than silently signing the
            // user in with a fake wallet — surfacing a clear browser-level error.
            if (!isDemoWalletEnabled()) {
              throw new Error(NO_WALLET_DETECTED);
            }

            const demoAddress = DEMO_WALLET_ADDRESS;

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

            const signature = buildDemoSignature(challenge);

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
                walletErrorSource: null,
                isDemoSession: true,
              },
              false,
              "wallet/connectWallet/demo/done",
            );
          }
        } catch (error) {
          const { source, message } = classifyWalletError(error);

          // Roll back to a clean idle state — never leave partial auth or a
          // stale address/balance behind. The user can retry immediately from
          // the error state without reloading the page.
          authStore.clearAuth();
          set(
            {
              ...initialWalletState,
              step: "error",
              walletError: message,
              walletErrorSource: source,
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
        // Reset in place — the UI reacts to store state, so there is no need to
        // force a full-page reload. This clears the address, balance and any
        // demo-session flag so no stale wallet data lingers after disconnect.
        set({ ...initialWalletState }, false, "wallet/disconnectWallet");
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
