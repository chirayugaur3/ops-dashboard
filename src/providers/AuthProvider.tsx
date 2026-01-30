// PURPOSE: Auth context provider for client components
// Provides session data and permission helpers throughout the app

'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
