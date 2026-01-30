/**
 * AUTHENTICATION CONFIGURATION
 * 
 * PURPOSE: Handles user login/logout for the dashboard
 * 
 * OWNER CREDENTIALS:
 *   Email: yadavanillogisnow@gmail.com
 *   Password: anilyadav123
 * 
 * HOW IT WORKS:
 *   1. User submits email + password
 *   2. authorize() function checks if credentials match
 *   3. If match → Creates JWT session token (lasts 8 hours)
 *   4. If no match → Returns null (login fails)
 * 
 * TO CHANGE CREDENTIALS:
 *   Modify OWNER_EMAIL and OWNER_PASSWORD below
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole, User } from '@/types/auth';

// ============================================
// OWNER CREDENTIALS - CHANGE THESE IF NEEDED
// ============================================
const OWNER_EMAIL = 'yadavanillogisnow@gmail.com';
const OWNER_PASSWORD = 'anilyadav123';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Check if credentials match owner
        if (email === OWNER_EMAIL && password === OWNER_PASSWORD) {
          return {
            id: '1',
            email: OWNER_EMAIL,
            name: 'Anil Yadav',
            role: 'admin' as UserRole,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // First time sign in - add user data to token
      if (user) {
        token.id = user.id;
        token.role = (user as User).role || 'ops_manager';
        token.locationId = (user as User).locationId;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as User).role = token.role as UserRole;
        (session.user as User).locationId = token.locationId as string | undefined;
      }
      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
      const isOnApi = request.nextUrl.pathname.startsWith('/api');
      const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');

      // Allow auth routes always
      if (isAuthRoute) return true;

      // Protect dashboard and API routes
      if (isOnDashboard || isOnApi) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      }

      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours - typical work shift
  },
  trustHost: true,
});

// Type augmentation for NextAuth
declare module 'next-auth' {
  interface Session {
    user: User;
  }
}
