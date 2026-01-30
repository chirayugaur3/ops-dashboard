// PURPOSE: Modal component for viewing employee shift details and paired shifts
// INPUT: employeeId, employeeName, dateRange, shifts array, isOpen, onClose
// BEHAVIOR: Shows shift history in a modal; displays paired shifts with duration and location status
// UX: Clean table layout, status indicators, accessible modal with keyboard support
// DO NOT: Compute pairing logic - shifts come pre-paired from backend

'use client';

import { useEffect, useRef } from 'react';
import { cn, formatDateTime, formatDuration, formatDistance } from '@/lib/utils';
import { statusConfig } from '@/lib/tokens';
import { X, Clock, MapPin, Calendar, AlertCircle } from 'lucide-react';
import type { ShiftDetailModalProps, Shift } from '@/types';

export function ShiftDetailModal({
  employeeId,
  employeeName,
  dateRange,
  shifts,
  isOpen,
  onClose,
  isLoading = false,
}: ShiftDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl',
          'w-full max-w-3xl max-h-[85vh] overflow-hidden',
          'mx-4 animate-in fade-in zoom-in-95 duration-200',
          'border border-white/50'
        )}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 id="shift-modal-title" className="text-xl font-bold text-slate-800">
              Shift History
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-3 py-1 text-sm font-semibold text-violet-700 bg-violet-100 rounded-full">
                {employeeName}
              </span>
              <span className="text-sm text-slate-500">{employeeId}</span>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className={cn(
              'p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(85vh-140px)]">
          {isLoading ? (
            <ShiftTableSkeleton />
          ) : shifts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">No shifts found</p>
              <p className="text-slate-500">No shift records for the selected date range.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <SummaryStat
                  icon={<Clock className="w-5 h-5" />}
                  label="Total Shifts"
                  value={shifts.length.toString()}
                  gradient="from-violet-500 to-purple-500"
                />
                <SummaryStat
                  icon={<Clock className="w-5 h-5" />}
                  label="Total Hours"
                  value={formatDuration(
                    shifts.reduce((sum, s) => sum + (s.durationMinutes || 0), 0)
                  )}
                  gradient="from-blue-500 to-cyan-500"
                />
                <SummaryStat
                  icon={<MapPin className="w-5 h-5" />}
                  label="On-site Rate"
                  value={`${Math.round(
                    (shifts.filter((s) => s.onSiteStart).length / shifts.length) * 100
                  )}%`}
                  gradient="from-emerald-500 to-teal-500"
                />
              </div>

              {/* Shifts Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full" role="table" aria-label="Shift history">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Shift Start
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Shift End
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Start Location
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                        End Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shifts.map((shift, index) => (
                      <ShiftRow key={index} shift={shift} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className={cn(
              'px-6 py-2.5 text-sm font-semibold',
              'text-slate-700 bg-white border-2 border-slate-200 rounded-xl',
              'hover:bg-slate-50 hover:border-slate-300',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2'
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Shift Row Sub-component
// =============================================================================

interface ShiftRowProps {
  shift: Shift;
}

function ShiftRow({ shift }: ShiftRowProps) {
  const isOpenSession = !shift.shiftEnd;

  return (
    <tr className={cn(
      'hover:bg-slate-50/50 transition-colors', 
      isOpenSession && 'bg-amber-50/30'
    )}>
      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">
        {formatDateTime(shift.shiftStart)}
      </td>
      <td className="px-4 py-3.5 text-sm">
        {shift.shiftEnd ? (
          <span className="text-slate-800 font-medium">{formatDateTime(shift.shiftEnd)}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            Open session
          </span>
        )}
      </td>
      <td className="px-4 py-3.5 text-sm font-semibold text-slate-800">
        {shift.durationMinutes ? formatDuration(shift.durationMinutes) : '—'}
      </td>
      <td className="px-4 py-3.5">
        <LocationStatus
          distance={shift.distanceStart}
          isOnSite={shift.onSiteStart}
        />
      </td>
      <td className="px-4 py-3.5">
        {shift.onSiteEnd !== null ? (
          <LocationStatus
            distance={shift.distanceEnd}
            isOnSite={shift.onSiteEnd}
          />
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </td>
    </tr>
  );
}

// =============================================================================
// Location Status Sub-component
// =============================================================================

interface LocationStatusProps {
  distance: number | null;
  isOnSite: boolean | null;
}

function LocationStatus({ distance, isOnSite }: LocationStatusProps) {
  if (distance === null || isOnSite === null) {
    const config = statusConfig.unknown;
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {config.label}
      </span>
    );
  }

  const status = isOnSite ? 'compliant' : 'breach';
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {config.label}
      </span>
      <span className="text-xs text-neutral-500">{formatDistance(distance)}</span>
    </div>
  );
}

// =============================================================================
// Summary Stat Sub-component
// =============================================================================

interface SummaryStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  gradient?: string;
}

function SummaryStat({ icon, label, value, gradient = 'from-slate-500 to-slate-600' }: SummaryStatProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={cn('p-2.5 rounded-xl bg-gradient-to-br text-white shadow-lg', gradient)}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Skeleton Loader
// =============================================================================

function ShiftTableSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
            <div className="space-y-1">
              <div className="h-3 bg-neutral-200 rounded w-16" />
              <div className="h-5 bg-neutral-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-neutral-100 rounded" />
        ))}
      </div>
    </div>
  );
}

export default ShiftDetailModal;
