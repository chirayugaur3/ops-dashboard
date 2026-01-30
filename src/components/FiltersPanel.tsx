// PURPOSE: Filters panel for dashboard - sticky sidebar with date, location, and filter controls
// INPUT: current filters, locations list, callbacks for filter changes
// BEHAVIOR: Sticky, collapsible; emits change events; shows active filter tags; "Clear all" action
// UX: Beautiful glass morphism sidebar with gradient accents
// DO NOT: Fetch data here - parent component handles data fetching based on filter changes

'use client';

import { useState } from 'react';
import { cn, getTodayRange, getYesterdayRange, getWeekRange } from '@/lib/utils';
import { exceptionTypeConfig } from '@/lib/tokens';
import {
  Calendar,
  MapPin,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { FiltersPanelProps, DateRange, ExceptionType } from '@/types';

const DATE_PRESETS = [
  { label: 'Today', getValue: getTodayRange },
  { label: 'Yesterday', getValue: getYesterdayRange },
  { label: 'Last 7 days', getValue: getWeekRange },
] as const;

const EXCEPTION_TYPES: ExceptionType[] = [
  'OpenSession',
  'PunchOutWithoutIn',
  'LocationBreach',
  'LocationMissing',
];

export function FiltersPanel({
  filters,
  locations,
  onFiltersChange,
  onClearAll,
}: FiltersPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDateRangeChange = (dateRange: DateRange) => {
    const newFilters = { ...filters, dateRange };
    onFiltersChange(newFilters);
  };

  const handleLocationChange = (locationId: string | undefined) => {
    const newFilters = { ...filters, locationId };
    onFiltersChange(newFilters);
  };

  const handleExceptionTypeChange = (exceptionType: ExceptionType | undefined) => {
    const newFilters = { ...filters, exceptionType };
    onFiltersChange(newFilters);
  };

  const activeFilterCount = [
    filters.locationId,
    filters.exceptionType,
    filters.employeeId,
  ].filter(Boolean).length;

  return (
    <aside
      className={cn(
        'relative transition-all duration-300 ease-out',
        'bg-white/70 backdrop-blur-xl',
        'border-r border-white/20',
        'shadow-xl shadow-slate-900/5',
        isCollapsed ? 'w-16' : 'w-80'
      )}
      aria-label="Filters"
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-violet-500 via-purple-500 to-pink-500 opacity-50" />
      
      {/* Header */}
      <div className="px-4 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Filter className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Filters</h2>
                {activeFilterCount > 0 && (
                  <span className="text-xs text-violet-600 font-medium">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              'p-2 rounded-lg transition-all duration-200',
              'text-slate-400 hover:text-violet-600',
              'hover:bg-violet-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            )}
            aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {!isCollapsed && (
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Date Range */}
          <FilterSection
            title="Date Range"
            icon={<Calendar className="w-4 h-4" />}
          >
            <div className="space-y-3">
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => {
                  const presetRange = preset.getValue();
                  const isActive =
                    filters.dateRange.start === presetRange.start &&
                    filters.dateRange.end === presetRange.end;

                  return (
                    <button
                      key={preset.label}
                      onClick={() => handleDateRangeChange(presetRange)}
                      className={cn(
                        'px-4 py-2 text-sm font-semibold rounded-xl',
                        'border-2 transition-all duration-200',
                        isActive
                          ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-transparent shadow-lg shadow-violet-500/25'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50'
                      )}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom Date Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label htmlFor="startDate" className="block text-xs font-medium text-slate-500 mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...filters.dateRange,
                        start: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full px-3 py-2 text-sm rounded-xl',
                      'border-2 border-slate-200 bg-white/50',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400',
                      'transition-all duration-200'
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-xs font-medium text-slate-500 mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      handleDateRangeChange({
                        ...filters.dateRange,
                        end: e.target.value,
                      })
                    }
                    className={cn(
                      'w-full px-3 py-2 text-sm rounded-xl',
                      'border-2 border-slate-200 bg-white/50',
                      'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400',
                      'transition-all duration-200'
                    )}
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Location */}
          <FilterSection
            title="Location"
            icon={<MapPin className="w-4 h-4" />}
          >
            <select
              value={filters.locationId || ''}
              onChange={(e) => handleLocationChange(e.target.value || undefined)}
              className={cn(
                'w-full px-4 py-3 text-sm font-medium rounded-xl',
                'border-2 border-slate-200 bg-white/50',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400',
                'transition-all duration-200',
                'appearance-none cursor-pointer'
              )}
              aria-label="Select location"
            >
              <option value="">All locations</option>
              {locations.map((location) => (
                <option key={location.locationId} value={location.locationId}>
                  {location.name}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Exception Type */}
          <FilterSection
            title="Exception Type"
            icon={<Filter className="w-4 h-4" />}
          >
            <select
              value={filters.exceptionType || ''}
              onChange={(e) =>
                handleExceptionTypeChange((e.target.value as ExceptionType) || undefined)
              }
              className={cn(
                'w-full px-4 py-3 text-sm font-medium rounded-xl',
                'border-2 border-slate-200 bg-white/50',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400',
                'transition-all duration-200',
                'appearance-none cursor-pointer'
              )}
              aria-label="Select exception type"
            >
              <option value="">All types</option>
              {EXCEPTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {exceptionTypeConfig[type].label}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Active Filters Tags */}
          {activeFilterCount > 0 && (
            <div className="pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Active Filters
                  </span>
                </div>
                <button
                  onClick={onClearAll}
                  className={cn(
                    'text-xs font-semibold text-rose-500 hover:text-rose-600',
                    'px-2 py-1 rounded-lg hover:bg-rose-50',
                    'transition-all duration-200'
                  )}
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.locationId && (
                  <FilterTag
                    label={locations.find((l) => l.locationId === filters.locationId)?.name || filters.locationId}
                    onRemove={() => handleLocationChange(undefined)}
                  />
                )}
                {filters.exceptionType && (
                  <FilterTag
                    label={exceptionTypeConfig[filters.exceptionType].label}
                    onRemove={() => handleExceptionTypeChange(undefined)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// =============================================================================
// Filter Section Sub-component
// =============================================================================

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center">
          <span className="text-violet-500" aria-hidden="true">
            {icon}
          </span>
        </div>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// =============================================================================
// Filter Tag Sub-component
// =============================================================================

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span
      className={cn(
        'group inline-flex items-center gap-1.5 px-3 py-1.5',
        'text-xs font-semibold text-violet-700',
        'bg-gradient-to-r from-violet-100 to-purple-100',
        'border border-violet-200 rounded-full',
        'transition-all duration-200 hover:shadow-md hover:shadow-violet-500/20'
      )}
    >
      {label}
      <button
        onClick={onRemove}
        className={cn(
          'p-0.5 rounded-full',
          'text-violet-400 hover:text-white hover:bg-violet-500',
          'transition-all duration-200'
        )}
        aria-label={`Remove ${label} filter`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

export default FiltersPanel;
