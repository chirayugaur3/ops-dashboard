// PURPOSE: Centralized logging utility with Sentry integration
// Provides structured logging for debugging and monitoring
// Inspired by enterprise logging practices - structured, leveled, traceable

import * as Sentry from '@sentry/nextjs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, data?: LogContext): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${dataStr}`;
  }

  debug(message: string, data?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, data));
    }
    // Add Sentry breadcrumb for debugging
    Sentry.addBreadcrumb({
      category: this.context,
      message,
      level: 'debug',
      data,
    });
  }

  info(message: string, data?: LogContext): void {
    console.info(this.formatMessage('info', message, data));
    Sentry.addBreadcrumb({
      category: this.context,
      message,
      level: 'info',
      data,
    });
  }

  warn(message: string, data?: LogContext): void {
    console.warn(this.formatMessage('warn', message, data));
    Sentry.addBreadcrumb({
      category: this.context,
      message,
      level: 'warning',
      data,
    });
  }

  error(message: string, error?: Error | unknown, data?: LogContext): void {
    console.error(this.formatMessage('error', message, data), error);
    
    // Capture error in Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { context: this.context },
        extra: { message, ...data },
      });
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        tags: { context: this.context },
        extra: { error, ...data },
      });
    }
  }

  // Track specific events for monitoring
  trackEvent(eventName: string, data?: LogContext): void {
    Sentry.addBreadcrumb({
      category: this.context,
      message: eventName,
      level: 'info',
      data,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('info', `EVENT: ${eventName}`, data));
    }
  }
}

// Pre-configured loggers for different modules
export const createLogger = (context: string): Logger => new Logger(context);

// Commonly used loggers
export const apiLogger = createLogger('API');
export const sheetLogger = createLogger('GoogleSheets');
export const authLogger = createLogger('Auth');
export const uiLogger = createLogger('UI');

// Default export for convenience
export default Logger;
