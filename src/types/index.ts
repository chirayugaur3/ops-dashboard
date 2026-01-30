// PURPOSE: Core TypeScript types for the Attendance Dashboard
// These types define the data contracts between frontend and backend
// All timestamps are ISO 8601 UTC strings
// DO NOT: Add business logic here - this is types only

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  serverTimestamp: string; // ISO 8601 UTC
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  items: T[];
  serverTimestamp: string;
}

// =============================================================================
// KPI Types
// =============================================================================

export interface KPIData {
  activeEmployeesCount: number;
  totalWorkingHoursToday: number;
  onSiteCompliancePct: number;
  exceptionsCount: number;
  serverTimestamp: string;
}

export interface KPITrend {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
  comparedTo: string; // "yesterday", "last week", etc.
}

// =============================================================================
// Activity Types
// =============================================================================

export interface HourlyActivity {
  hour: string; // "08:00", "09:00", etc.
  punchIn: number;
  punchOut: number;
}

// =============================================================================
// Employee Types
// =============================================================================

export interface Employee {
  employeeId: string;
  name: string;
  department?: string;
  locationId?: string;
}

export interface EmployeeWorkload extends Employee {
  totalHours: number;
}

// =============================================================================
// Location Types
// =============================================================================

export type ComplianceStatus = 'compliant' | 'warning' | 'breach' | 'unknown';

export interface Location {
  locationId: string;
  name: string;
  lat: number;
  long: number;
  distanceThreshold: number; // meters
}

export interface EmployeeLocation {
  employeeId: string;
  name: string;
  lat: number;
  long: number;
  status: ComplianceStatus;
  timestamp: string;
  distance?: number; // meters from designated location
}

// =============================================================================
// Exception Types
// =============================================================================

export type ExceptionType =
  | 'OpenSession'        // Punch In with no Punch Out within threshold
  | 'PunchOutWithoutIn'  // Punch Out with no preceding Punch In
  | 'LocationBreach'     // Distance exceeds threshold at punch time
  | 'LocationMissing';   // No GPS data at punch time

export type ExceptionSeverity = 'warning' | 'critical';

export type ExceptionStatus = 'open' | 'resolved' | 'dismissed';

export interface Exception {
  id: string;
  employeeId: string;
  name: string;
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  timestamp: string;
  locationText: string;
  distance: number | null;
  notes: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
}

export interface ExceptionResolution {
  resolverId: string;
  resolutionNote: string;
}

// =============================================================================
// Shift Types
// =============================================================================

export interface Shift {
  shiftStart: string;
  shiftEnd: string | null;
  durationMinutes: number | null;
  distanceStart: number | null;
  distanceEnd: number | null;
  onSiteStart: boolean;
  onSiteEnd: boolean | null;
}

export interface EmployeeShiftHistory {
  employeeId: string;
  name: string;
  shifts: Shift[];
}

// =============================================================================
// Filter Types
// =============================================================================

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface DashboardFilters {
  dateRange: DateRange;
  locationId?: string;
  employeeId?: string;
  exceptionType?: ExceptionType;
  exceptionStatus?: ExceptionStatus;
}

// =============================================================================
// UI State Types
// =============================================================================

export interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
}

export interface StaleDataIndicator {
  lastUpdated: string;
  isStale: boolean; // true if data older than threshold
  staleThresholdMinutes: number;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface KPICardProps {
  title: string;
  numericValue: number | string;
  subtext?: string;
  trend?: KPITrend;
  onClick?: () => void;
  isLoading?: boolean;
  format?: 'number' | 'percentage' | 'hours';
}

export interface ActivityChartProps {
  hourlyBuckets: HourlyActivity[];
  isLoading?: boolean;
}

export interface WorkloadBarListProps {
  topEmployees: EmployeeWorkload[];
  limit?: number;
  onEmployeeClick?: (employeeId: string) => void;
  isLoading?: boolean;
}

export interface MapViewProps {
  latestLocations: EmployeeLocation[];
  onPinClick?: (employeeId: string) => void;
  isLoading?: boolean;
}

export interface ExceptionsTableProps {
  exceptions: Exception[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onResolve: (id: string) => void;
  isLoading?: boolean;
}

export interface FiltersPanelProps {
  filters: DashboardFilters;
  locations: Location[];
  onFiltersChange: (filters: DashboardFilters) => void;
  onClearAll: () => void;
}

export interface ShiftDetailModalProps {
  employeeId: string;
  employeeName: string;
  dateRange: DateRange;
  shifts: Shift[];
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}
