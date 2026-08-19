"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { initSentry } from "@/lib/sentry";
import { useAuthStore } from "@/stores/authStore";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    initSentry();
  }, []);

  // On mount, verify that a persisted session is still consistent.
  // If the cookie is gone but Zustand still thinks we are authenticated,
  // (e.g. another tab logged out), force a clean reset.
  useEffect(() => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated && typeof document !== "undefined") {
      const hasCookie = document.cookie
        .split("; ")
        .some((c) => c.startsWith("lumora_auth=true"));
      if (!hasCookie) {
        // Another tab or server-side cleared the cookie — sync state.
        auth.clearAuth();
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
          {process.env.NODE_ENV === "development" ? (
            <ReactQueryDevtools initialIsOpen={false} />
          ) : null}
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
