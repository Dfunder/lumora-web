import { createContext, useContext, useReducer, useEffect, ReactNode, Dispatch } from "react";

type WalletStatus = "idle" | "connecting" | "connected" | "error" | "rejected";

interface WalletWallet {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
}

interface WalletState {
  status: WalletStatus;
  address: string | null;
  selectedWallet: WalletWallet | null;
  wallets: WalletWallet[];
  error: string | null;
}

interface WalletAction {
  type:
    | "set_status"
    | "set_address"
    | "set_selected_wallet"
    | "set_wallets"
    | "set_error";
  payload: any;
}

const initialState: WalletState = {
  status: "idle",
  address: null,
  selectedWallet: null,
  wallets: [],
  error: null,
};

const WalletContext = createContext<{
  state: WalletState;
  dispatch: Dispatch<WalletAction>;
  connect: (walletId: string) => Promise<void>;
} | null>(null);

export const useWallet = (): {
  state: WalletState;
  dispatch: Dispatch<WalletAction>;
  connect: (walletId: string) => Promise<void>;
} => {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return ctx;
};

type ReducerAction =
  | { type: "set_status"; payload: WalletStatus }
  | { type: "set_address"; payload: string | null }
  | { type: "set_selected_wallet"; payload: WalletWallet | null }
  | { type: "set_wallets"; payload: WalletWallet[] }
  | { type: "set_error"; payload: string | null };

const walletReducer = (state: WalletState, action: ReducerAction): WalletState => {
  switch (action.type) {
    case "set_status":
      return { ...state, status: action.payload };
    case "set_address":
      return { ...state, address: action.payload };
    case "set_selected_wallet":
      return { ...state, selectedWallet: action.payload };
    case "set_wallets":
      return { ...state, wallets: action.payload };
    case "set_error":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface WalletModule {
  freighter?: boolean;
  lobstr?: boolean;
  xbull?: boolean;
  albedo?: boolean;
}

export const WalletProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  useEffect(() => {
    import("@creit-tech/stellar-wallets-kit/sdk").then((module) => {
      import("@creit-tech/stellar-wallets-kit/modules/utils").then(
        ({ defaultModules }) => {
          const StellarWalletsKit = module.StellarWalletsKit;
          StellarWalletsKit.init({ modules: defaultModules() });

          const detectWallets = async () => {
            try {
              dispatch({ type: "set_status", payload: "connecting" });

              const modules: WalletModule = await StellarWalletsKit.getModules();
              const wallets: WalletWallet[] = [];

              if (modules.freighter) {
                wallets.push({
                  id: "freighter",
                  name: "Freighter",
                  icon: "/freighter.svg",
                  installed: true,
                });
              } else {
                wallets.push({
                  id: "freighter",
                  name: "Freighter",
                  icon: "/freighter.svg",
                  installed: false,
                });
              }

              if (modules.lobstr) {
                wallets.push({
                  id: "lobstr",
                  name: "LOBSTR",
                  icon: "/lobstr.svg",
                  installed: true,
                });
              } else {
                wallets.push({
                  id: "lobstr",
                  name: "LOBSTR",
                  icon: "/lobstr.svg",
                  installed: false,
                });
              }

              if (modules.xbull) {
                wallets.push({
                  id: "xbull",
                  name: "xBull",
                  icon: "/xbull.svg",
                  installed: true,
                });
              } else {
                wallets.push({
                  id: "xbull",
                  name: "xBull",
                  icon: "/xbull.svg",
                  installed: false,
                });
              }

              if (modules.albedo) {
                wallets.push({
                  id: "albedo",
                  name: "Albedo",
                  icon: "/albedo.svg",
                  installed: true,
                });
              } else {
                wallets.push({
                  id: "albedo",
                  name: "Albedo",
                  icon: "/albedo.svg",
                  installed: false,
                });
              }

              dispatch({ type: "set_wallets", payload: wallets });
              dispatch({ type: "set_status", payload: "idle" });
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Failed to detect wallets";
              dispatch({ type: "set_error", payload: message });
              dispatch({ type: "set_status", payload: "idle" });
            }
          };

          detectWallets();
        }
      );
    });
  }, []);

  const connect = async (walletId: string) => {
    dispatch({ type: "set_status", payload: "connecting" });
    dispatch({ type: "set_error", payload: null });

    try {
      const StellarWalletsKit = (await import(
        "@creit-tech/stellar-wallets-kit/sdk
      ")).StellarWalletsKit;

      const { address } = await StellarWalletsKit.getAddress();

      const wallet = state.wallets.find((w) => w.id === walletId) || null;

      dispatch({ type: "set_address", payload: address });
      dispatch({ type: "set_selected_wallet", payload: wallet });
      dispatch({ type: "set_status", payload: "connected" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      dispatch({ type: "set_error", payload: message });

      if (message.includes("user rejected") || message.includes("cancel")) {
        dispatch({ type: "set_status", payload: "rejected" });
      } else {
        dispatch({ type: "set_status", payload: "error" });
      }
    }
  };

  return (
    <WalletContext.Provider value={{ state, dispatch, connect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletConnection = () => {
  const { state } = useWallet();

  return {
    status: state.status,
    address: state.address,
    selectedWallet: state.selectedWallet,
    wallets: state.wallets,
    error: state.error,
    isConnecting: state.status === "connecting",
    isConnected: state.status === "connected",
    hasError: state.status === "error",
    isRejected: state.status === "rejected",
  };
};