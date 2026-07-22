'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useWalletStore } from '@/stores/walletStore';
import { resolveReauthQueue, rejectReauthQueue, getAuthChallenge, verifyWalletSignature } from '@/lib/api';

export function ReAuthModal() {
  const { isReauthModalOpen, setReauthModalOpen, setAuth, clearAuth } = useAuthStore();
  const { address } = useWalletStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReauth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];

        if (address && account.toLowerCase() !== address.toLowerCase()) {
           throw new Error(`Please re-authenticate with your previous wallet: ${address}`);
        }

        const { challenge } = await getAuthChallenge(account);
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [challenge, account],
        });

        const result = await verifyWalletSignature(account, signature);
        
        setAuth({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        setReauthModalOpen(false);
        resolveReauthQueue(result.accessToken);
      } else {
        const demoAddress = '0x742d35Cc6434Bb0532C4457A88B95935F72C0770';
        if (address && demoAddress.toLowerCase() !== address.toLowerCase()) {
           throw new Error(`Please re-authenticate with your previous wallet: ${address}`);
        }
        
        const { challenge } = await getAuthChallenge(demoAddress);
        const signature = `0x${btoa(challenge)}`;
        const result = await verifyWalletSignature(demoAddress, signature);
        
        setAuth({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });

        setReauthModalOpen(false);
        resolveReauthQueue(result.accessToken);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Re-authentication failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReauthModalOpen(false);
    clearAuth();
    rejectReauthQueue(new Error('User cancelled re-authentication'));
  };

  if (!isReauthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900 bg-opacity-75 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        <div className="px-6 py-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center shadow-inner">
              <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h3 className="text-center text-2xl font-bold text-gray-900 mb-2">Session Expired</h3>
          <p className="text-center text-sm text-gray-500 mb-8 px-4">
            For your security, your session has expired. Please re-authenticate to continue without losing your progress.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleReauth}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating...
                </>
              ) : (
                'Re-connect Wallet'
              )}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
            >
              Cancel & Log Out
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
