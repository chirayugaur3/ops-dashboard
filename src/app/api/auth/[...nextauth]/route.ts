// PURPOSE: NextAuth API route handler
// Handles all auth endpoints: /api/auth/signin, /api/auth/signout, /api/auth/session

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
