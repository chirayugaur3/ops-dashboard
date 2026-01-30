// PURPOSE: React Query provider wrapper for the application
// Configures React Query client with appropriate defaults

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 30 seconds (for fresh data feel)
            staleTime: 30 * 1000,
            // Cache time: 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry configuration
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus for live data
            refetchOnWindowFocus: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
