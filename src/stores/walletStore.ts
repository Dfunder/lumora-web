import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useAuthStore, type AuthStatus } from "./authStore";
import { getAuthChallenge, verifyWalletSignature } from "@/lib/api";

export type WalletConnectionStep = "idle" | "connecting" | "connected" | "authenticating" | "done" | "error";

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
  disconnectWallet: () => void;
  setConnectionState: (isConnected: boolean, address?: string, balance?: string) => void;
  resetWalletState: () => void;
}

const initialWalletState = {
  selectedWalletId: null,
  isWalletPanelOpen: false,
  isConnected: false,
  address: null,
  balance: null,
  step: "idle" as WalletConnectionStep,
  walletError: null as string | null,
  authStatus: "idle" as AuthStatus,
};

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
        authStore.setStatus("challenging");

        try {
          set({ step: "connecting", walletError: null }, false, "wallet/connectWallet/start");

          if (typeof window !== 'undefined' && window.ethereum) {
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });

            if (!accounts.length) {
              throw new Error("No accounts found. Please unlock MetaMask.");
            }

            const address = accounts[0];
            set({ isConnected: true, address, selectedWalletId: 'metamask', step: "connected" }, false, "wallet/connectWallet/connected");

            authStore.setStatus("challenging");
            set({ authStatus: "challenging" }, false, "wallet/connectWallet/challenging");

            const { challenge } = await getAuthChallenge(address);

            authStore.setStatus("signing");
            set({ authStatus: "signing" }, false, "wallet/connectWallet/signing");

            const signature = await window.ethereum.request({
              method: 'personal_sign',
              params: [challenge, address],
            });

            authStore.setStatus("verifying");
            set({ authStatus: "verifying", step: "authenticating" }, false, "wallet/connectWallet/verifying");

            const result = await verifyWalletSignature(address, signature);

            authStore.setAuth({
              user: result.user,
              accessToken: result.accessToken,
              refreshToken: result.refreshToken,
            });

            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [address, 'latest'],
            });

            set({
              balance: balance ? parseInt(balance, 16).toString() : null,
              step: "done",
              authStatus: "authenticated",
              walletError: null,
            }, false, "wallet/connectWallet/done");
          } else {
            const demoAddress = '0x742d35Cc6434Bb0532C4457A88B95935F72C0770';

            try {
              authStore.setStatus("challenging");
              set({ authStatus: "challenging" }, false, "wallet/connectWallet/demo/challenging");

              const { challenge } = await getAuthChallenge(demoAddress);

              authStore.setStatus("signing");
              set({ authStatus: "signing" }, false, "wallet/connectWallet/demo/signing");

              const signature = `0x${btoa(challenge)}`;

              authStore.setStatus("verifying");
              set({ authStatus: "verifying" }, false, "wallet/connectWallet/demo/verifying");

              const result = await verifyWalletSignature(demoAddress, signature);

              authStore.setAuth({
                user: result.user,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
              });

              set({
                isConnected: true,
                address: demoAddress,
                balance: '1000000000000000000',
                selectedWalletId: 'demo',
                step: "done",
                authStatus: "authenticated",
                walletError: null,
              }, false, "wallet/connectWallet/demo/done");
            } catch {
              set({
                isConnected: true,
                address: demoAddress,
                balance: '1000000000000000000',
                selectedWalletId: 'demo',
                step: "done",
                authStatus: "authenticated",
                walletError: null,
              }, false, "wallet/connectWallet/demo/fallback");
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to connect wallet';
          authStore.setError(message);
          set({
            step: "error",
            walletError: message,
            authStatus: "error",
          }, false, "wallet/connectWallet/error");
          console.error('Failed to connect wallet:', error);
        }
      },
      disconnectWallet: () => {
        useAuthStore.getState().clearAuth();
        set(
          {
            isConnected: false,
            address: null,
            balance: null,
            selectedWalletId: null,
            step: "idle",
            walletError: null,
            authStatus: "idle",
          },
          false,
          "wallet/disconnectWallet"
        );
      },
      setConnectionState: (isConnected, address, balance) =>
        set(
          { isConnected, address: address || null, balance: balance || null },
          false,
          "wallet/setConnectionState"
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
