// PURPOSE: NextAuth middleware for route protection
// Protects dashboard and API routes, redirects unauthenticated users to login

export { auth as middleware } from '@/lib/auth';

export const config = {
  // Protect these routes - require authentication
  matcher: [
    '/dashboard/:path*',
    '/api/kpis/:path*',
    '/api/activity/:path*',
    '/api/employees/:path*',
    '/api/exceptions/:path*',
    '/api/locations/:path*',
    '/api/employee/:path*',
  ],
};
