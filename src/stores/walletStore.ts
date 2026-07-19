import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WalletState {
  selectedWalletId: string | null;
  isWalletPanelOpen: boolean;
  isConnected: boolean;
  address: string | null;
  balance: string | null;
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
        try {
          // Check if window.ethereum exists (MetaMask)
          if (typeof window !== 'undefined' && window.ethereum) {
            // Request account access
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts',
            });
            
            if (accounts.length > 0) {
              const address = accounts[0];
              // Get balance (optional)
              const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
              });
              
              set(
                {
                  isConnected: true,
                  address,
                  balance: balance ? parseInt(balance, 16).toString() : null,
                  selectedWalletId: 'metamask',
                },
                false,
                "wallet/connectWallet"
              );
            }
          } else {
            // Fallback for demo purposes when MetaMask is not available
            const demoAddress = '0x742d35Cc6434Bb0532C4457A88B95935F72C0770';
            set(
              {
                isConnected: true,
                address: demoAddress,
                balance: '1000000000000000000', // 1 ETH in wei
                selectedWalletId: 'demo',
              },
              false,
              "wallet/connectWalletDemo"
            );
          }
        } catch (error) {
          console.error('Failed to connect wallet:', error);
        }
      },
      disconnectWallet: () =>
        set(
          {
            isConnected: false,
            address: null,
            balance: null,
            selectedWalletId: null,
          },
          false,
          "wallet/disconnectWallet"
        ),
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
