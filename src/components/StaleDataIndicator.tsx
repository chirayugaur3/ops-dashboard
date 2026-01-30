// PURPOSE: Stale data indicator component
// Shows last updated time and warning if data is stale

'use client';

import { cn, formatTime, isDataStale } from '@/lib/utils';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface StaleDataIndicatorProps {
  serverTimestamp: string | undefined;
  staleThresholdMinutes?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function StaleDataIndicator({
  serverTimestamp,
  staleThresholdMinutes = 5,
  onRefresh,
  isRefreshing = false,
}: StaleDataIndicatorProps) {
  if (!serverTimestamp) return null;

  const stale = isDataStale(serverTimestamp, staleThresholdMinutes);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium',
        'border transition-all duration-200',
        stale 
          ? 'bg-amber-50 text-amber-700 border-amber-200' 
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      )}
    >
      {stale ? (
        <AlertTriangle className="w-4 h-4 animate-pulse" aria-hidden="true" />
      ) : (
        <div className="relative">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
      )}
      <span>
        {stale ? 'Data may be stale • ' : 'Live • '}
        {formatTime(serverTimestamp)}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={cn(
            'p-1.5 rounded-full transition-all duration-200',
            'hover:bg-white/50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            stale 
              ? 'hover:text-amber-800 focus-visible:ring-amber-500' 
              : 'hover:text-emerald-800 focus-visible:ring-emerald-500',
            isRefreshing && 'animate-spin'
          )}
          aria-label="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default StaleDataIndicator;
