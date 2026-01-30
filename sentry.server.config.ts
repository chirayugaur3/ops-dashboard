// PURPOSE: Sentry server-side configuration for API route monitoring
// Tracks backend errors, CSV fetch failures, and performance

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring - sample rate for transactions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Only enable when DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Add custom tags for filtering
  initialScope: {
    tags: {
      app: 'attendance-dashboard',
      side: 'server',
    },
  },
  
  // Error filtering
  beforeSend(event) {
    // Don't send in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
