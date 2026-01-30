// PURPOSE: Authentication types for role-based access control
// ROLES: OpsManager (view), HRAdmin (view + resolve), Supervisor (limited view + resolve own site)
// Inspired by RBAC patterns from enterprise systems since the 1990s

export type UserRole = 'ops_manager' | 'hr_admin' | 'supervisor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locationId?: string; // For supervisors, limits their view to their site
  avatar?: string;
}

export interface Session {
  user: User;
  expires: string;
}

// Permission matrix - what each role can do
export const PERMISSIONS = {
  ops_manager: {
    canViewDashboard: true,
    canViewExceptions: true,
    canResolveExceptions: false,
    canExportReports: true,
    canViewAllLocations: true,
    canManageUsers: false,
  },
  hr_admin: {
    canViewDashboard: true,
    canViewExceptions: true,
    canResolveExceptions: true,
    canExportReports: true,
    canViewAllLocations: true,
    canManageUsers: false,
  },
  supervisor: {
    canViewDashboard: true,
    canViewExceptions: true,
    canResolveExceptions: true, // Only their location
    canExportReports: false,
    canViewAllLocations: false, // Limited to their site
    canManageUsers: false,
  },
  admin: {
    canViewDashboard: true,
    canViewExceptions: true,
    canResolveExceptions: true,
    canExportReports: true,
    canViewAllLocations: true,
    canManageUsers: true,
  },
} as const;

export type Permission = keyof typeof PERMISSIONS.admin;

// Helper to check if user has permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.[permission] ?? false;
}

// Helper to check if user can access a specific location
export function canAccessLocation(user: User, locationId?: string): boolean {
  if (user.role === 'admin' || user.role === 'hr_admin' || user.role === 'ops_manager') {
    return true;
  }
  // Supervisors can only access their assigned location
  if (user.role === 'supervisor') {
    return !locationId || user.locationId === locationId;
  }
  return false;
}
