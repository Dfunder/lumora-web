'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to console only in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught an error:', error);
      console.error('Error stack:', error.stack);
      if (error.digest) {
        console.error('Error digest:', error.digest);
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Something went wrong!
        </h2>
        <p className="mt-4 text-center text-sm text-gray-600">
          We apologize for the inconvenience. An unexpected error has occurred while processing your request.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">What can you do?</h3>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>• Try refreshing the page</p>
                <p>• Check your internet connection</p>
                <p>• Contact support if the problem persists</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={reset}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Go Home
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Error ID: {error.digest || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}