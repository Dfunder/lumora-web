import { useWalletConnection } from "../contexts/WalletContext";
import { useState, useEffect } from "react";

type WalletWallet = {
  id: string;
  name: string;
  icon: string;
  installed: boolean;
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => void;
}

export const WalletModal = ({ open, onClose, onConnect }: ModalProps) => {
  const {
    status,
    address,
    selectedWallet,
    wallets,
    error,
    isConnecting,
    isConnected,
    hasError,
    isRejected,
  } = useWalletConnection();

  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (isRejected) {
      setShowError(true);
    }
    if (isConnected) {
      onClose();
    }
  }, [isRejected, isConnected, onClose]);

  if (!open) return null;

  if (isConnecting) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-zsm opacity-0 transition-opacity duration-500"
        aria-busy="true"
        aria-label="Connecting to wallet..."
      />
    );
  }

  if (hasError && error) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-zsm"
        aria-alert="true"
        aria-label="Connection error"
      >
        <div className="bg-white/90 rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-zsm">
        <div className="bg-white/90 rounded-lg p-8 max-w-sm w-full text-center shadow-lg">
          <p>No wallets detected. Please install a Stellar wallet.</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Install Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-zsm z-50"
      aria-modal="true"
      aria-label="Stellar wallets connection modal"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        className="bg-white/90 rounded-lg p-8 max-w-sm w-full sm:max-w-md shadow-xl transform scale-100 transition-all duration-300"
      >
        <h2 id="wallet-modal-title" className="text-xl font-semibold mb-6 text-center">
          Connect Your Wallet
        </h2>

        {error && showError ? (
          <p className="text-red-600 mb-4 text-center">{error}</p>
        ) : null}

        {isConnecting ? (
          <p className="text-center mb-4">Connecting...</p>
        ) : wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="flex items-center gap-3 mb-3 px-2 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onConnect(wallet.id)}
            tabindex={0}
            onKeyPress={(e) => e.key === "Enter" && onConnect(wallet.id)}
          >
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="w-6 h-6"
            />
            <span className="font-medium">{wallet.name}</span>
            {wallet.installed ? null : (
              <span className="text-sm text-gray-500 install-link cursor-pointer">
                Install
              </span>
            )}
          </div>
        ))}

        {!isConnected && !isConnecting ? (
          <button
            onClick={onClose}
            className="mt-6 w-full py-2 px-4 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          >
            Close
          </button>
        ) : isConnected && address ? (
          <p className="mt-4 text-sm text-gray-500 text-center">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        ) : null}
      </div>
    </div>
  );
};