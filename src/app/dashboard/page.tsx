'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KPICard,
  ActivityChart,
  WorkloadBarList,
  ExceptionsTable,
  MapView,
  ShiftDetailModal,
  ResolveDialog,
} from '@/components';
import {
  useKPIs,
  useHourlyActivity,
  useTopWorkload,
  useLatestLocations,
  useLocationsList,
  useExceptions,
  useEmployeeShifts,
  useResolveException,
} from '@/hooks/useQueries';
import { getTodayRange, cn } from '@/lib/utils';
import { 
  RefreshCw, Calendar, MapPin, Filter, ChevronDown, Search,
  Bell, Settings, LogOut, User, TrendingUp, AlertTriangle, CheckCircle2, Clock, Moon
} from 'lucide-react';
import type { DashboardFilters, Exception, ExceptionResolution } from '@/types';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const DEFAULT_FILTERS: DashboardFilters = {
  dateRange: getTodayRange(),
  locationId: undefined,
  employeeId: undefined,
  exceptionType: undefined,
  exceptionStatus: undefined,
};

const DATE_PRESETS = [
  { label: 'Today', getValue: () => getTodayRange() },
  { label: 'Yesterday', getValue: () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const f = d.toISOString().split('T')[0];
    return { start: f, end: f };
  }},
  { label: 'Last 7 days', getValue: () => {
    const e = new Date(), s = new Date(); s.setDate(s.getDate() - 6);
    return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
  }},
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [exceptionsPage, setExceptionsPage] = useState(1);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState('Today');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<Exception | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Always use dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const { data: locations = [] } = useLocationsList();
  const kpisQuery = useKPIs({ dateRange: filters.dateRange, locationId: filters.locationId });
  const activityQuery = useHourlyActivity({ dateRange: filters.dateRange, locationId: filters.locationId });
  const workloadQuery = useTopWorkload({ dateRange: filters.dateRange, locationId: filters.locationId, limit: 10 });
  const locationsQuery = useLatestLocations({ dateRange: filters.dateRange, locationId: filters.locationId });
  const exceptionsQuery = useExceptions({ dateRange: filters.dateRange, locationId: filters.locationId, type: filters.exceptionType, page: exceptionsPage, limit: 10 });
  const shiftsQuery = useEmployeeShifts({ employeeId: selectedEmployeeId || '', dateRange: filters.dateRange }, shiftModalOpen && !!selectedEmployeeId);
  const resolveExceptionMutation = useResolveException();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshAll = useCallback(() => {
    kpisQuery.refetch(); activityQuery.refetch(); workloadQuery.refetch();
    locationsQuery.refetch(); exceptionsQuery.refetch();
    setLastRefreshTime(new Date());
  }, [kpisQuery, activityQuery, workloadQuery, locationsQuery, exceptionsQuery]);

  const handleDatePresetChange = useCallback((preset: typeof DATE_PRESETS[0]) => {
    setSelectedDatePreset(preset.label);
    setFilters(prev => ({ ...prev, dateRange: preset.getValue() }));
    setExceptionsPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSelectedDatePreset('Today');
    setExceptionsPage(1);
  }, []);

  const handleEmployeeClick = useCallback((employeeId: string, name?: string) => {
    setSelectedEmployeeId(employeeId);
    setSelectedEmployeeName(name || employeeId);
    setShiftModalOpen(true);
  }, []);

  const handleViewException = useCallback((exceptionId: string) => {
    const exc = exceptionsQuery.data?.items.find((e) => e.id === exceptionId);
    if (exc) { setSelectedEmployeeId(exc.employeeId); setSelectedEmployeeName(exc.name); setShiftModalOpen(true); }
  }, [exceptionsQuery.data?.items]);

  const handleResolveException = useCallback((exceptionId: string) => {
    const exc = exceptionsQuery.data?.items.find((e) => e.id === exceptionId);
    if (exc) { setSelectedException(exc); setResolveDialogOpen(true); }
  }, [exceptionsQuery.data?.items]);

  const handleResolveSubmit = useCallback(async (resolution: ExceptionResolution) => {
    if (!selectedException) return;
    await resolveExceptionMutation.mutateAsync({ id: selectedException.id, resolution });
    setResolveDialogOpen(false); setSelectedException(null);
  }, [selectedException, resolveExceptionMutation]);

  const handleMapPinClick = useCallback((employeeId: string) => {
    const loc = locationsQuery.data?.find((l) => l.employeeId === employeeId);
    if (loc) handleEmployeeClick(employeeId, loc.name);
  }, [locationsQuery.data, handleEmployeeClick]);

  const isRefreshing = kpisQuery.isFetching || activityQuery.isFetching || workloadQuery.isFetching || locationsQuery.isFetching || exceptionsQuery.isFetching;
  const hasActiveFilters = filters.locationId || filters.exceptionType || selectedDatePreset !== 'Today';

  // Always dark mode
  const isDark = true;

  return (
    <div className="min-h-screen bg-[#0f1629] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f1629]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="text-xl">📊</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Ops Dashboard</h1>
              <p className="text-xs text-slate-400">Attendance & Field Activity</p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4", isDark ? "text-slate-400" : "text-slate-500")} />
              <input type="text" placeholder="Search employees, locations..." className={cn(
                "w-full pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors",
                isDark ? "bg-white/5 border border-white/10 placeholder:text-slate-500 text-white" : "bg-slate-100 border border-slate-200 placeholder:text-slate-400 text-slate-900"
              )} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={cn(
              "relative p-2.5 rounded-xl transition-colors",
              isDark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
            )}>
              <Bell className={cn("w-5 h-5", isDark ? "text-slate-300" : "text-slate-600")} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button onClick={() => setSettingsOpen(true)} className={cn(
              "p-2.5 rounded-xl transition-colors",
              isDark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
            )}>
              <Settings className={cn("w-5 h-5", isDark ? "text-slate-300" : "text-slate-600")} />
            </button>
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className={cn(
                "flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl transition-colors",
                isDark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-slate-100 border border-slate-200 hover:bg-slate-200"
              )}>
                {(user as { image?: string })?.image ? <Image src={(user as { image?: string }).image!} alt="" width={32} height={32} className="rounded-lg" /> : <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><User className="w-4 h-4 text-white" /></div>}
                <div className="hidden sm:block text-left">
                  <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{user?.name || 'User'}</p>
                  <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{user?.email || ''}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4", isDark ? "text-slate-400" : "text-slate-500")} />
              </button>
              <AnimatePresence>
                {userMenuOpen && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className={cn(
                  "absolute right-0 mt-2 w-56 py-2 rounded-xl shadow-xl",
                  isDark ? "bg-[#1a2235] border border-white/10" : "bg-white border border-slate-200"
                )}>
                  <div className={cn("px-4 py-3 border-b", isDark ? "border-white/10" : "border-slate-200")}>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>{user?.name}</p>
                    <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{user?.email}</p>
                  </div>
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400",
                    isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                  )}>
                    <LogOut className="w-4 h-4" />Sign out
                  </button>
                </motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={cn(
          "sticky top-[73px] h-[calc(100vh-73px)] w-72 border-r transition-colors duration-300",
          isDark ? "border-white/10 bg-[#0f1629]/50" : "border-slate-200 bg-white"
        )}>
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-violet-400" />
                <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>Filters</span>
              </div>
              {hasActiveFilters && <button onClick={handleClearFilters} className="text-xs text-violet-400 hover:text-violet-300">Clear all</button>}
            </div>
            <div className="space-y-3">
              <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                <Calendar className="w-4 h-4" /><span>Date Range</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((p) => <button key={p.label} onClick={() => handleDatePresetChange(p)} className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  selectedDatePreset === p.label 
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25" 
                    : isDark 
                      ? "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                )}>{p.label}</button>)}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <label className={cn("text-xs mb-1 block", isDark ? "text-slate-500" : "text-slate-500")}>From</label>
                  <input type="date" value={filters.dateRange.start} onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))} className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg focus:ring-2 focus:ring-violet-500/50",
                    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                  )} />
                </div>
                <div>
                  <label className={cn("text-xs mb-1 block", isDark ? "text-slate-500" : "text-slate-500")}>To</label>
                  <input type="date" value={filters.dateRange.end} onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))} className={cn(
                    "w-full px-3 py-2 text-xs rounded-lg focus:ring-2 focus:ring-violet-500/50",
                    isDark ? "bg-white/5 border border-white/10 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                  )} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                <MapPin className="w-4 h-4" /><span>Location</span>
              </div>
              <select value={filters.locationId || ''} onChange={(e) => setFilters(prev => ({ ...prev, locationId: e.target.value || undefined }))} className={cn(
                "w-full px-3 py-2.5 text-sm rounded-lg focus:ring-2 focus:ring-violet-500/50",
                isDark ? "bg-white/5 border border-white/10 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
              )}>
                <option value="" className={isDark ? "bg-[#1a2235]" : ""}>All locations</option>
                {locations.map((l) => <option key={l.locationId} value={l.locationId} className={isDark ? "bg-[#1a2235]" : ""}>{l.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <div className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                <AlertTriangle className="w-4 h-4" /><span>Exception Type</span>
              </div>
              <select value={filters.exceptionType || ''} onChange={(e) => setFilters(prev => ({ ...prev, exceptionType: (e.target.value || undefined) as DashboardFilters['exceptionType'] }))} className={cn(
                "w-full px-3 py-2.5 text-sm rounded-lg focus:ring-2 focus:ring-violet-500/50",
                isDark ? "bg-white/5 border border-white/10 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
              )}>
                <option value="" className={isDark ? "bg-[#1a2235]" : ""}>All types</option>
                <option value="MissedPunch" className={isDark ? "bg-[#1a2235]" : ""}>Missed Punch</option>
                <option value="LocationBreach" className={isDark ? "bg-[#1a2235]" : ""}>Location Breach</option>
                <option value="OvertimeExcess" className={isDark ? "bg-[#1a2235]" : ""}>Overtime Excess</option>
              </select>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">Live • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>Last: {lastRefreshTime.toLocaleTimeString()}</span>
              <motion.button onClick={handleRefreshAll} disabled={isRefreshing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl disabled:opacity-50 transition-colors",
                isDark ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-900"
              )}>
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />Refresh
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Active Employees" numericValue={kpisQuery.data?.activeEmployeesCount ?? 0} subtext="Currently on field" trend={{ direction: 'up', percentage: 5, comparedTo: 'yesterday' }} isLoading={kpisQuery.isLoading} variant="primary" icon="users" />
            <KPICard title="Working Hours" numericValue={kpisQuery.data?.totalWorkingHoursToday ?? 0} subtext="Total today" format="hours" isLoading={kpisQuery.isLoading} variant="success" icon="clock" />
            <KPICard title="On-Site Compliance" numericValue={kpisQuery.data?.onSiteCompliancePct ?? 0} format="percentage" subtext="Within designated area" trend={{ direction: (kpisQuery.data?.onSiteCompliancePct ?? 0) >= 80 ? 'up' : 'down', percentage: 2, comparedTo: 'yesterday' }} isLoading={kpisQuery.isLoading} variant="info" icon="location" />
            <KPICard title="Open Exceptions" numericValue={kpisQuery.data?.exceptionsCount ?? 0} subtext="Requires attention" onClick={() => document.getElementById('exceptions-section')?.scrollIntoView({ behavior: 'smooth' })} isLoading={kpisQuery.isLoading} variant="warning" icon="alert" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[{ icon: CheckCircle2, label: 'Resolved Today', value: '12', color: 'emerald' }, { icon: AlertTriangle, label: 'Pending', value: String(kpisQuery.data?.exceptionsCount ?? 0), color: 'amber' }, { icon: Clock, label: 'Avg. Hours', value: '7.5h', color: 'blue' }, { icon: TrendingUp, label: 'Peak Hour', value: '9:00 AM', color: 'violet' }].map((s, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 p-4 rounded-xl transition-colors",
                isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"
              )}>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.color === 'emerald' && "bg-emerald-500/20", s.color === 'amber' && "bg-amber-500/20", s.color === 'blue' && "bg-blue-500/20", s.color === 'violet' && "bg-violet-500/20")}>
                  <s.icon className={cn("w-5 h-5", s.color === 'emerald' && "text-emerald-400", s.color === 'amber' && "text-amber-400", s.color === 'blue' && "text-blue-400", s.color === 'violet' && "text-violet-400")} />
                </div>
                <div>
                  <p className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{s.label}</p>
                  <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
              <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>Activity Patterns</h3>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className={cn(
                "p-6 rounded-2xl transition-colors",
                isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"
              )}>
                <ActivityChart hourlyBuckets={activityQuery.data ?? []} isLoading={activityQuery.isLoading} />
              </div>
              <div className={cn(
                "p-6 rounded-2xl transition-colors",
                isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"
              )}>
                <MapView latestLocations={locationsQuery.data ?? []} onPinClick={handleMapPinClick} isLoading={locationsQuery.isLoading} />
              </div>
            </div>
            <div className={cn(
              "mt-6 p-6 rounded-2xl transition-colors",
              isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"
            )}>
              <WorkloadBarList topEmployees={workloadQuery.data ?? []} limit={10} onEmployeeClick={(id: string) => { const emp = workloadQuery.data?.find((e) => e.employeeId === id); handleEmployeeClick(id, emp?.name); }} isLoading={workloadQuery.isLoading} />
            </div>
          </section>

          <section id="exceptions-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-red-500 rounded-full" />
              <h3 className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>Exceptions</h3>
              {(exceptionsQuery.data?.total ?? 0) > 0 && <span className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-red-500 rounded-full">{exceptionsQuery.data?.total} issues</span>}
            </div>
            <div className={cn(
              "p-6 rounded-2xl transition-colors",
              isDark ? "bg-white/5 border border-white/10" : "bg-white border border-slate-200 shadow-sm"
            )}>
              <ExceptionsTable exceptions={exceptionsQuery.data?.items ?? []} total={exceptionsQuery.data?.total ?? 0} page={exceptionsPage} limit={10} onPageChange={setExceptionsPage} onView={handleViewException} onResolve={handleResolveException} isLoading={exceptionsQuery.isLoading} />
            </div>
          </section>
        </main>
      </div>

      <ShiftDetailModal employeeId={selectedEmployeeId || ''} employeeName={selectedEmployeeName} dateRange={filters.dateRange} shifts={shiftsQuery.data ?? []} isOpen={shiftModalOpen} onClose={() => { setShiftModalOpen(false); setSelectedEmployeeId(null); }} isLoading={shiftsQuery.isLoading} />
      <ResolveDialog exception={selectedException} isOpen={resolveDialogOpen} onClose={() => { setResolveDialogOpen(false); setSelectedException(null); }} onSubmit={handleResolveSubmit} isSubmitting={resolveExceptionMutation.isPending} />
      
      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 border-l shadow-2xl z-[60] bg-[#1a2235] border-white/10"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white">Settings</h2>
                  <button 
                    onClick={() => setSettingsOpen(false)} 
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-6 flex-1">
                  {/* Theme Section - Dark mode only */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Appearance</h3>
                    <div className="space-y-2">
                      <div className="w-full flex items-center justify-between p-3 rounded-xl border bg-violet-500/20 border-violet-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#0f1629] border border-white/20">
                            <Moon className="w-4 h-4 text-violet-400" />
                          </div>
                          <span className="text-sm font-medium text-white">Dark Mode</span>
                        </div>
                        <div className="w-4 h-4 rounded-full bg-violet-500" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Refresh Rate */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Auto Refresh</h3>
                    <select className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-violet-500/50 bg-white/5 border border-white/10 text-white">
                      <option value="off" className="bg-[#1a2235]">Off</option>
                      <option value="30" className="bg-[#1a2235]">Every 30 seconds</option>
                      <option value="60" className="bg-[#1a2235]">Every minute</option>
                      <option value="300" className="bg-[#1a2235]">Every 5 minutes</option>
                    </select>
                  </div>
                  
                  {/* Notifications */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-300">Exception alerts</span>
                        <div className="relative">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500 bg-white/10"></div>
                        </div>
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-300">Location breaches</span>
                        <div className="relative">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500 bg-white/10"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {/* Data Export */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-slate-300">Data Export</h3>
                    <button className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10">
                      Export as CSV
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-center text-slate-500">Dashboard v1.0.0</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
