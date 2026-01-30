// PURPOSE: Presentation component for employee workload ranking (top N employees by hours)
// INPUT: topEmployees array sorted descending by totalHours, limit, onEmployeeClick callback
// BEHAVIOR: Shows horizontal bar visualization, expand to full list, clickable rows
// UX: Beautiful gradients, rank badges, smooth animations, accessible - SUPPORTS LIGHT/DARK
// DO NOT: Sort data here - backend provides pre-sorted data

'use client';

import { useState } from 'react';
import { cn, formatHours } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trophy, Medal, Award, Clock } from 'lucide-react';
import type { WorkloadBarListProps } from '@/types';

// Rank badge configuration with vibrant colors
const rankConfig = {
  1: { icon: Trophy, gradient: 'from-amber-400 to-yellow-500', bg: 'bg-amber-500/20', text: 'text-amber-500' },
  2: { icon: Medal, gradient: 'from-slate-400 to-slate-500', bg: 'bg-slate-500/20', text: 'text-slate-500' },
  3: { icon: Award, gradient: 'from-orange-400 to-amber-500', bg: 'bg-orange-500/20', text: 'text-orange-500' },
};

export function WorkloadBarList({
  topEmployees,
  limit = 10,
  onEmployeeClick,
  isLoading = false,
}: WorkloadBarListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return <WorkloadBarListSkeleton />;
  }

  if (!topEmployees || topEmployees.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Employees by Hours</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ranked by total working time</p>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          No workload data available
        </div>
      </div>
    );
  }

  const maxHours = topEmployees[0]?.totalHours || 1;
  const displayedEmployees = isExpanded ? topEmployees : topEmployees.slice(0, limit);
  const hasMore = topEmployees.length > limit;
  const totalHours = topEmployees.reduce((sum, e) => sum + e.totalHours, 0);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Employees by Hours</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{topEmployees.length} employees tracked</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Hours</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{formatHours(totalHours)}</p>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Top {Math.min(limit, topEmployees.length)}
            </span>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="space-y-2" role="list" aria-label="Employee workload ranking">
        {displayedEmployees.map((employee, index) => (
          <WorkloadBarItem
            key={employee.employeeId}
            rank={index + 1}
            name={employee.name}
            hours={employee.totalHours}
            maxHours={maxHours}
            onClick={() => onEmployeeClick?.(employee.employeeId)}
            isClickable={!!onEmployeeClick}
          />
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'w-full mt-4 py-2.5 px-4 text-sm font-semibold',
            'flex items-center justify-center gap-2',
            'rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10',
            'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
          )}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>Show less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show all {topEmployees.length} <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}

// =============================================================================
// Workload Bar Item - Light/Dark Theme Support
// =============================================================================

interface WorkloadBarItemProps {
  rank: number;
  name: string;
  hours: number;
  maxHours: number;
  onClick?: () => void;
  isClickable: boolean;
}

function WorkloadBarItem({
  rank,
  name,
  hours,
  maxHours,
  onClick,
  isClickable,
}: WorkloadBarItemProps) {
  const percentage = (hours / maxHours) * 100;
  const rankCfg = rankConfig[rank as 1 | 2 | 3];
  const RankIcon = rankCfg?.icon;

  // Color based on rank
  const barColor = rank === 1 
    ? 'from-amber-500 to-yellow-500' 
    : rank === 2 
      ? 'from-slate-400 to-slate-500' 
      : rank === 3 
        ? 'from-orange-500 to-amber-500' 
        : 'from-violet-500 to-purple-500';

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 py-3 px-4 rounded-xl',
        'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10',
        isClickable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20',
        'transition-all duration-200',
        rank <= 3 && 'border-l-2',
        rank === 1 && 'border-l-amber-500',
        rank === 2 && 'border-l-slate-400',
        rank === 3 && 'border-l-orange-500'
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
      role={isClickable ? 'button' : 'listitem'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${name}, rank ${rank}, ${formatHours(hours)}`}
    >
      {/* Rank Badge */}
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
        rankCfg ? rankCfg.bg : 'bg-slate-200 dark:bg-white/10'
      )}>
        {RankIcon ? (
          <RankIcon className={cn('w-4 h-4', rankCfg?.text)} />
        ) : (
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">#{rank}</span>
        )}
      </div>

      {/* Name and Bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-slate-900 dark:text-white truncate pr-2">
            {name || `Employee ${rank}`}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">{formatHours(hours)}</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Loading Skeleton - Light/Dark Theme Support
// =============================================================================

function WorkloadBarListSkeleton() {
  return (
    <div className="h-full animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/10" />
        <div>
          <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded mb-1" />
          <div className="h-3 w-32 bg-slate-100 dark:bg-white/5 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3 px-4 rounded-xl bg-slate-50 dark:bg-white/5">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 dark:bg-white/10 rounded mb-2 w-1/3" />
              <div className="h-2 bg-slate-200 dark:bg-white/10 rounded-full" style={{ width: `${90 - i * 15}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
