// PURPOSE: Presentation component for exceptions table with pagination and actions
// INPUT: exceptions array, total count, pagination, onView/onResolve callbacks
// BEHAVIOR: Server-side paging; View opens detail; Resolve opens resolution dialog
// UX: Supports light/dark theme, beautiful cards, status badges with icons
// DO NOT: Compute business logic (pairing, classification) in this component

'use client';

import { cn, formatDateTime, formatDistance, getExceptionTypeLabel } from '@/lib/utils';
import {
  AlertTriangle,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  AlertOctagon,
  XCircle,
} from 'lucide-react';
import type { ExceptionsTableProps, Exception } from '@/types';

// Styling Configuration (works in both light/dark)
const exceptionTypeStyles: Record<string, {
  icon: typeof Clock;
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  iconColor: string;
}> = {
  OpenSession: {
    icon: AlertOctagon,
    bg: 'bg-amber-100 dark:bg-amber-500/10',
    border: 'border-amber-300 dark:border-amber-500/30',
    text: 'text-amber-700 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  PunchOutWithoutIn: {
    icon: AlertTriangle,
    bg: 'bg-orange-100 dark:bg-orange-500/10',
    border: 'border-orange-300 dark:border-orange-500/30',
    text: 'text-orange-700 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-500/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  LocationBreach: {
    icon: MapPin,
    bg: 'bg-red-100 dark:bg-red-500/10',
    border: 'border-red-300 dark:border-red-500/30',
    text: 'text-red-700 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-500/20',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  LocationMissing: {
    icon: XCircle,
    bg: 'bg-slate-100 dark:bg-slate-500/10',
    border: 'border-slate-300 dark:border-slate-500/30',
    text: 'text-slate-700 dark:text-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-500/20',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
};

const severityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  warning: { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export function ExceptionsTable({
  exceptions,
  total,
  page,
  limit,
  onPageChange,
  onView,
  onResolve,
  isLoading = false,
}: ExceptionsTableProps) {
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return <ExceptionsTableSkeleton />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/25">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exceptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{total} issue{total !== 1 ? 's' : ''} need attention</p>
          </div>
        </div>
        {total > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20">
            <span className="text-xs font-semibold text-red-700 dark:text-red-400">{total} Open</span>
          </div>
        )}
      </div>

      {/* Empty State */}
      {exceptions.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">All clear!</p>
          <p className="text-slate-500 dark:text-slate-400">No exceptions found for the selected filters.</p>
        </div>
      ) : (
        <>
          {/* Exception Cards */}
          <div className="space-y-3">
            {exceptions.map((exception) => (
              <ExceptionCard
                key={exception.id}
                exception={exception}
                onView={() => onView(exception.id)}
                onResolve={() => onResolve(exception.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={cn(
                          'w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200',
                          page === pageNum
                            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Exception Card - Light/Dark Theme
interface ExceptionCardProps {
  exception: Exception;
  onView: () => void;
  onResolve: () => void;
}

function ExceptionCard({ exception, onView, onResolve }: ExceptionCardProps) {
  const typeStyle = exceptionTypeStyles[exception.type] || exceptionTypeStyles.OpenSession;
  const severityStyle = severityStyles[exception.severity] || severityStyles.warning;
  const TypeIcon = typeStyle.icon;

  return (
    <div className={cn(
      'group p-4 rounded-xl border transition-all duration-200',
      'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          typeStyle.iconBg
        )}>
          <TypeIcon className={cn('w-6 h-6', typeStyle.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-slate-900 dark:text-white">{exception.name}</h4>
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold',
                  severityStyle.bg, severityStyle.text
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', severityStyle.dot)} />
                  {exception.severity}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{exception.employeeId}</p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onView}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
              {exception.status === 'open' && (
                <button
                  onClick={onResolve}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve
                </button>
              )}
            </div>
          </div>

          {/* Details Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg',
              typeStyle.bg, typeStyle.text, 'font-medium'
            )}>
              <TypeIcon className="w-3.5 h-3.5" />
              {getExceptionTypeLabel(exception.type)}
            </div>
            
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(exception.timestamp)}
            </div>
            
            {exception.locationText && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {exception.locationText}
              </div>
            )}
            
            {exception.distance !== null && exception.distance !== undefined && (
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                {formatDistance(exception.distance)} from site
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton - Light/Dark
function ExceptionsTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div>
          <div className="h-5 w-32 bg-slate-200 dark:bg-white/10 rounded mb-1" />
          <div className="h-3 w-24 bg-slate-100 dark:bg-white/5 rounded" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10" />
              <div className="flex-1">
                <div className="h-5 w-1/4 bg-slate-200 dark:bg-white/10 rounded mb-2" />
                <div className="h-4 w-1/3 bg-slate-100 dark:bg-white/5 rounded mb-3" />
                <div className="flex gap-4">
                  <div className="h-6 w-24 bg-slate-100 dark:bg-white/5 rounded-lg" />
                  <div className="h-6 w-32 bg-slate-100 dark:bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
