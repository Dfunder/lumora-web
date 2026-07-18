import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WalletState {
  selectedWalletId: string | null;
  isWalletPanelOpen: boolean;
  selectWallet: (walletId: string | null) => void;
  setWalletPanelOpen: (isOpen: boolean) => void;
  resetWalletState: () => void;
}

const initialWalletState = {
  selectedWalletId: null,
  isWalletPanelOpen: false,
};

export const useWalletStore = create<WalletState>()(
  devtools(
    (set) => ({
      ...initialWalletState,
      selectWallet: (selectedWalletId) =>
        set({ selectedWalletId }, false, "wallet/selectWallet"),
      setWalletPanelOpen: (isWalletPanelOpen) =>
        set({ isWalletPanelOpen }, false, "wallet/setWalletPanelOpen"),
      resetWalletState: () =>
        set(initialWalletState, false, "wallet/resetWalletState"),
    }),
    {
      name: "wallet-store",
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
