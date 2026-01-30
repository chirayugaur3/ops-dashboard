// PURPOSE: Utility functions for the dashboard
// DO NOT: Add business logic here - utilities only

import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns';

// =============================================================================
// Class Name Utilities
// =============================================================================

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// =============================================================================
// Date/Time Utilities
// =============================================================================

export function formatTime(isoString: string): string {
  return format(parseISO(isoString), 'HH:mm');
}

export function formatDate(isoString: string): string {
  return format(parseISO(isoString), 'MMM d, yyyy');
}

export function formatDateTime(isoString: string): string {
  return format(parseISO(isoString), 'MMM d, yyyy HH:mm');
}

export function formatRelativeTime(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
}

export function getDateRangeString(start: string, end: string): string {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  
  if (start === end) {
    return format(startDate, 'MMM d, yyyy');
  }
  
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
}

export function isDataStale(serverTimestamp: string, thresholdMinutes: number = 5): boolean {
  const diff = differenceInMinutes(new Date(), parseISO(serverTimestamp));
  return diff > thresholdMinutes;
}

export function getLastUpdatedText(serverTimestamp: string): string {
  return `Last updated: ${formatTime(serverTimestamp)}`;
}

// =============================================================================
// Number Formatting Utilities
// =============================================================================

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  }
  
  return `${wholeHours}h ${minutes}m`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

export function formatDistance(meters: number | null): string {
  if (meters === null) {
    return 'N/A';
  }
  
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  
  return `${(meters / 1000).toFixed(1)}km`;
}

// =============================================================================
// Query String Utilities
// =============================================================================

export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return searchParams.toString();
}

// =============================================================================
// Accessibility Utilities
// =============================================================================

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    compliant: 'On-site - within designated area',
    warning: 'Borderline - near boundary',
    breach: 'Off-site - outside designated area',
    unknown: 'Location missing - GPS data unavailable',
  };
  
  return labels[status] || status;
}

export function getExceptionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    OpenSession: 'Open Session - Punch In with no Punch Out since over 12 hours',
    PunchOutWithoutIn: 'Punch Out Without In - No preceding Punch In found',
    LocationBreach: 'Location Breach - Distance exceeds allowed threshold',
    LocationMissing: 'Location Missing - No GPS data recorded at punch time',
  };
  
  return labels[type] || type;
}

// =============================================================================
// Debounce Utility
// =============================================================================

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// =============================================================================
// Today's Date Utility
// =============================================================================

export function getTodayRange(): { start: string; end: string } {
  const today = format(new Date(), 'yyyy-MM-dd');
  return { start: today, end: today };
}

export function getYesterdayRange(): { start: string; end: string } {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = format(yesterday, 'yyyy-MM-dd');
  return { start: date, end: date };
}

export function getWeekRange(): { start: string; end: string } {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return {
    start: format(weekAgo, 'yyyy-MM-dd'),
    end: format(today, 'yyyy-MM-dd'),
  };
}
