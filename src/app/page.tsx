/**
 * HOME PAGE (/)
 * 
 * PURPOSE: Entry point that redirects users based on authentication status
 * 
 * FLOW:
 *   - If logged in → Dashboard
 *   - If not logged in → Login page
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
