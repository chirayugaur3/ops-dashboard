'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { HourlyActivity } from '@/types';

interface ActivityChartProps {
  hourlyBuckets: HourlyActivity[];
  isLoading?: boolean;
}

const CHART_COLORS = {
  punchIn: '#8b5cf6',
  punchOut: '#22c55e',
};

// Custom hook to detect dark mode
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Initial check
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();

    // Watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function ActivityChart({ hourlyBuckets, isLoading }: ActivityChartProps) {
  const isDarkMode = useIsDarkMode();

  if (isLoading) {
    return <ActivityChartSkeleton />;
  }

  if (!hourlyBuckets || hourlyBuckets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center dark:text-slate-400 text-slate-500">
        No activity data available
      </div>
    );
  }

  const chartData = hourlyBuckets.map((item) => ({
    hour: String(item.hour).padStart(2, '0') + ':00',
    punchIn: item.punchIn,
    punchOut: item.punchOut,
  }));

  // Theme-aware colors
  const axisColor = isDarkMode ? '#94a3b8' : '#475569';
  const gridColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const tooltipBg = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  return (
    <div className="h-full flex flex-col">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.punchIn }} />
          <span className="text-sm font-medium dark:text-slate-300 text-slate-600">Punch In</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: CHART_COLORS.punchOut }} />
          <span className="text-sm font-medium dark:text-slate-300 text-slate-600">Punch Out</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 11, fill: axisColor }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              interval={1}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: axisColor }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              width={35}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg,
                borderRadius: '8px',
                border: `1px solid ${tooltipBorder}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                padding: '8px 12px',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: 4, color: tooltipText }}
              itemStyle={{ padding: '2px 0' }}
              cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <Bar 
              dataKey="punchIn" 
              fill={CHART_COLORS.punchIn}
              radius={[4, 4, 0, 0]}
              name="Punch In"
            />
            <Bar 
              dataKey="punchOut" 
              fill={CHART_COLORS.punchOut}
              radius={[4, 4, 0, 0]}
              name="Punch Out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ActivityChartSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded dark:bg-slate-700 bg-slate-200 animate-pulse" />
          <div className="w-16 h-4 dark:bg-slate-700 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded dark:bg-slate-700 bg-slate-200 animate-pulse" />
          <div className="w-16 h-4 dark:bg-slate-700 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 flex items-end gap-2 pb-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex gap-1">
            <div 
              className="flex-1 dark:bg-slate-700 bg-slate-200 rounded-t animate-pulse" 
              style={{ height: `${30 + (i % 5) * 15}%` }}
            />
            <div 
              className="flex-1 dark:bg-slate-700 bg-slate-200 rounded-t animate-pulse" 
              style={{ height: `${20 + (i % 4) * 10}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityChart;
