// PURPOSE: Presentation component for key performance indicators (KPIs)
// INPUT: title, numericValue, subtext, trend, onClick, isLoading, format, variant
// BEHAVIOR: Read-only; responsive; shows trend indicator; clickable only if onClick provided
// UX: Large numeric display, beautiful gradients, micro-interactions, glass morphism
// DO NOT: Compute any business logic; this is presentation only

'use client';

import { cn, formatNumber, formatPercentage, formatHours } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Users, Clock, MapPin, AlertTriangle, Sparkles } from 'lucide-react';
import type { KPICardProps } from '@/types';

// Gradient configurations for different card variants
const gradientConfigs = {
  primary: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    iconBg: 'bg-white/20',
    glow: 'shadow-violet-500/25',
  },
  success: {
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
    iconBg: 'bg-white/20',
    glow: 'shadow-emerald-500/25',
  },
  warning: {
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    iconBg: 'bg-white/20',
    glow: 'shadow-amber-500/25',
  },
  info: {
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
    iconBg: 'bg-white/20',
    glow: 'shadow-blue-500/25',
  },
};

const iconMap = {
  users: Users,
  clock: Clock,
  location: MapPin,
  alert: AlertTriangle,
  default: Sparkles,
};

interface ExtendedKPICardProps extends KPICardProps {
  variant?: keyof typeof gradientConfigs;
  icon?: keyof typeof iconMap;
}

export function KPICard({
  title,
  numericValue,
  subtext,
  trend,
  onClick,
  isLoading = false,
  format = 'number',
  variant = 'primary',
  icon = 'default',
}: ExtendedKPICardProps) {
  const formattedValue = formatValue(numericValue, format);
  const isClickable = !!onClick;
  const config = gradientConfigs[variant];
  const IconComponent = iconMap[icon];

  if (isLoading) {
    return <KPICardSkeleton variant={variant} />;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br',
        config.gradient,
        'shadow-xl',
        config.glow,
        'transition-all duration-300 ease-out',
        isClickable && 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]',
        'group'
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={`${title}: ${formattedValue}${subtext ? `, ${subtext}` : ''}`}
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-700" />
      
      {/* Icon */}
      <div className={cn(
        'inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4',
        config.iconBg,
        'backdrop-blur-sm',
        'group-hover:scale-110 transition-transform duration-300'
      )}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-white/80 mb-1 tracking-wide uppercase">
        {title}
      </h3>

      {/* Numeric Value - Large Display */}
      <div className="flex items-baseline gap-3">
        <span className="text-4xl md:text-5xl font-bold text-white tabular-nums tracking-tight count-up">
          {formattedValue}
        </span>

        {/* Trend Indicator */}
        {trend && (
          <TrendIndicator trend={trend} />
        )}
      </div>

      {/* Subtext */}
      {subtext && (
        <p className="text-sm text-white/70 mt-2">
          {subtext}
        </p>
      )}
      
      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
}

// =============================================================================
// Trend Indicator Sub-component
// =============================================================================

interface TrendIndicatorProps {
  trend: {
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    comparedTo: string;
  };
}

function TrendIndicator({ trend }: TrendIndicatorProps) {
  const { direction, percentage, comparedTo } = trend;

  const config = {
    up: {
      Icon: TrendingUp,
      bgColor: 'bg-white/20',
      label: 'Increased',
    },
    down: {
      Icon: TrendingDown,
      bgColor: 'bg-white/20',
      label: 'Decreased',
    },
    stable: {
      Icon: Minus,
      bgColor: 'bg-white/20',
      label: 'No change',
    },
  }[direction];

  const { Icon, bgColor, label } = config;

  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
        bgColor,
        'text-white backdrop-blur-sm'
      )}
      aria-label={`${label} by ${percentage}% compared to ${comparedTo}`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{percentage}%</span>
    </div>
  );
}

// =============================================================================
// Skeleton Loader with Shimmer
// =============================================================================

function KPICardSkeleton({ variant = 'primary' }: { variant?: keyof typeof gradientConfigs }) {
  const config = gradientConfigs[variant];
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-6',
      'bg-gradient-to-br',
      config.gradient,
      'opacity-60'
    )}>
      <div className="absolute inset-0 shimmer" />
      <div className="w-12 h-12 rounded-xl bg-white/20 mb-4" />
      <div className="h-4 bg-white/20 rounded w-24 mb-4" />
      <div className="h-12 bg-white/20 rounded w-32 mb-2" />
      <div className="h-4 bg-white/20 rounded w-40" />
    </div>
  );
}

// =============================================================================
// Utility Functions
// =============================================================================

function formatValue(value: number | string, format: 'number' | 'percentage' | 'hours'): string {
  if (typeof value === 'string') {
    return value;
  }

  switch (format) {
    case 'percentage':
      return formatPercentage(value);
    case 'hours':
      return formatHours(value);
    case 'number':
    default:
      return formatNumber(value);
  }
}

export default KPICard;
