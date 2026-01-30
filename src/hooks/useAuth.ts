// PURPOSE: Custom hook for authentication state and permissions
// Provides easy access to user role and permission checks

'use client';

import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { hasPermission, canAccessLocation, type User, type Permission } from '@/types/auth';

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as User | undefined;
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  // Check if user has a specific permission
  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user?.role) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  // Check if user can access a specific location
  const checkLocationAccess = useCallback(
    (locationId?: string): boolean => {
      if (!user) return false;
      return canAccessLocation(user, locationId);
    },
    [user]
  );

  // Sign out and redirect to login
  const signOut = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
    router.push('/login');
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated,
    checkPermission,
    checkLocationAccess,
    signOut,
    // Convenience permission checks
    canResolveExceptions: checkPermission('canResolveExceptions'),
    canExportReports: checkPermission('canExportReports'),
    canViewAllLocations: checkPermission('canViewAllLocations'),
    canManageUsers: checkPermission('canManageUsers'),
  };
}
