// PURPOSE: Dialog component for resolving exceptions
// INPUT: exception data, isOpen, onClose, onSubmit callbacks
// BEHAVIOR: Modal form for entering resolution notes; validates input; calls API
// UX: Clear form layout, validation feedback, loading state during submit
// DO NOT: Update exception status locally - wait for server confirmation

'use client';

import { useState, useEffect, useRef } from 'react';
import { cn, formatDateTime, getExceptionTypeLabel } from '@/lib/utils';
import { severityConfig, exceptionTypeConfig } from '@/lib/tokens';
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { Exception, ExceptionResolution } from '@/types';

interface ResolveDialogProps {
  exception: Exception | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resolution: ExceptionResolution) => Promise<void>;
  isSubmitting?: boolean;
}

export function ResolveDialog({
  exception,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ResolveDialogProps) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting form on dialog open
      setResolutionNote('');
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Resetting form on dialog open
      setError(null);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolutionNote.trim()) {
      setError('Please enter a resolution note');
      textareaRef.current?.focus();
      return;
    }

    if (resolutionNote.trim().length < 10) {
      setError('Resolution note must be at least 10 characters');
      textareaRef.current?.focus();
      return;
    }

    try {
      await onSubmit({
        resolverId: 'current-user', // In real app, get from auth context
        resolutionNote: resolutionNote.trim(),
      });
      onClose();
    } catch {
      setError('Failed to resolve exception. Please try again.');
    }
  };

  if (!isOpen || !exception) return null;

  const typeConfig = exceptionTypeConfig[exception.type];
  const severity = severityConfig[exception.severity];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resolve-dialog-title"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/60 backdrop-blur-md',
          isSubmitting && 'pointer-events-none'
        )}
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl',
          'w-full max-w-lg',
          'mx-4 animate-in fade-in zoom-in-95 duration-200',
          'border border-white/50'
        )}
      >
        {/* Gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 id="resolve-dialog-title" className="text-xl font-bold text-slate-800">
              Resolve Exception
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Mark this exception as resolved
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              'p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Exception Details */}
        <div className="px-6 py-5 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
          <div className="grid grid-cols-2 gap-5">
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Employee</p>
              <p className="text-sm font-bold text-slate-800">{exception.name}</p>
              <p className="text-xs text-slate-500">{exception.employeeId}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Exception Type</p>
              <p className="text-sm font-bold text-slate-800">{typeConfig.label}</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Severity</p>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: severity.bgColor, color: severity.color }}
              >
                <AlertTriangle className="w-3 h-3" />
                {severity.label}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Occurred</p>
              <p className="text-sm font-bold text-slate-800">{formatDateTime(exception.timestamp)}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5">
            <label htmlFor="resolution-note" className="block text-sm font-bold text-slate-700 mb-2">
              Resolution Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="resolution-note"
              value={resolutionNote}
              onChange={(e) => {
                setResolutionNote(e.target.value);
                setError(null);
              }}
              placeholder="Describe how this exception was resolved (e.g., 'Verified with employee - forgot to punch out. Adjusted shift end time to 18:30.')"
              rows={4}
              disabled={isSubmitting}
              className={cn(
                'w-full px-4 py-3 text-sm rounded-xl text-slate-900 bg-white',
                'border-2 placeholder:text-slate-400',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400',
                'disabled:bg-slate-50 disabled:cursor-not-allowed',
                'transition-all duration-200 resize-none',
                error ? 'border-rose-300' : 'border-slate-200'
              )}
              aria-describedby={error ? 'resolution-error' : undefined}
            />
            {error && (
              <p id="resolution-error" className="mt-2 text-sm text-rose-600 font-medium" role="alert">
                {error}
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              This note will be recorded in the audit log.
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={cn(
                'px-5 py-2.5 text-sm font-semibold',
                'text-slate-700 bg-white border-2 border-slate-200 rounded-xl',
                'hover:bg-slate-50 hover:border-slate-300',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold',
                'text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl',
                'shadow-lg shadow-emerald-500/30',
                'hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark Resolved
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResolveDialog;
