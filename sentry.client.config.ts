// PURPOSE: Sentry configuration for error monitoring and performance tracking
// Monitors frontend errors, API failures, and CSV parsing issues

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  
  // Session replay for debugging (optional, production only)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Only enable in production or when DSN is configured
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Filter out common noise
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors
    'Network request failed',
    'Failed to fetch',
    // User cancelled
    'AbortError',
  ],
  
  // Add custom tags
  initialScope: {
    tags: {
      app: 'attendance-dashboard',
    },
  },
  
  // Breadcrumbs configuration
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'log') {
      return null;
    }
    return breadcrumb;
  },
  
  // Error filtering
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Sentry]', hint.originalException);
      return null;
    }
    return event;
  },
});
