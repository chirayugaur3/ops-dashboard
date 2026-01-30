// PURPOSE: API service functions for the Attendance Dashboard
// CONTRACT: All endpoints follow the data contracts in PROJECT_CONTEXT.md
// ERROR HANDLING: Throws errors with meaningful messages; caller handles UI feedback
// DO NOT: Add business logic here - backend handles all calculations

import { buildQueryString } from '@/lib/utils';
import type {
  KPIData,
  HourlyActivity,
  EmployeeWorkload,
  EmployeeLocation,
  Exception,
  ExceptionResolution,
  Shift,
  PaginatedResponse,
  DateRange,
  Location,
} from '@/types';

const API_BASE = '/api';

// =============================================================================
// Generic Fetch Wrapper
// =============================================================================

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// KPI Service
// =============================================================================

export interface FetchKPIsParams {
  dateRange: DateRange;
  locationId?: string;
}

export async function fetchKPIs(params: FetchKPIsParams): Promise<KPIData> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
    locationId: params.locationId,
  });

  return apiFetch<KPIData>(`/kpis?${query}`);
}

// =============================================================================
// Activity Service
// =============================================================================

export interface FetchActivityParams {
  dateRange: DateRange;
  locationId?: string;
}

export async function fetchHourlyActivity(params: FetchActivityParams): Promise<HourlyActivity[]> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
    locationId: params.locationId,
  });

  const response = await apiFetch<{ data: HourlyActivity[]; serverTimestamp: string }>(`/activity/hourly?${query}`);
  return response.data;
}

// =============================================================================
// Employee Workload Service
// =============================================================================

export interface FetchWorkloadParams {
  dateRange: DateRange;
  locationId?: string;
  limit?: number;
}

export async function fetchTopWorkload(params: FetchWorkloadParams): Promise<EmployeeWorkload[]> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
    locationId: params.locationId,
    limit: params.limit || 10,
  });

  const response = await apiFetch<{ data: EmployeeWorkload[]; serverTimestamp: string }>(`/employees/top-workload?${query}`);
  return response.data;
}

// =============================================================================
// Locations Service
// =============================================================================

export interface FetchLocationsParams {
  dateRange: DateRange;
  locationId?: string;
}

export async function fetchLatestLocations(params: FetchLocationsParams): Promise<EmployeeLocation[]> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
    locationId: params.locationId,
  });

  const response = await apiFetch<{ data: EmployeeLocation[]; serverTimestamp: string }>(`/locations/latest?${query}`);
  return response.data;
}

export async function fetchLocationsList(): Promise<Location[]> {
  const response = await apiFetch<{ data: Location[]; serverTimestamp: string }>('/locations');
  return response.data;
}

// =============================================================================
// Exceptions Service
// =============================================================================

export interface FetchExceptionsParams {
  dateRange: DateRange;
  locationId?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export async function fetchExceptions(params: FetchExceptionsParams): Promise<PaginatedResponse<Exception>> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
    locationId: params.locationId,
    status: params.status,
    type: params.type,
    page: params.page || 1,
    limit: params.limit || 20,
  });

  return apiFetch<PaginatedResponse<Exception>>(`/exceptions?${query}`);
}

export async function resolveException(
  id: string,
  resolution: ExceptionResolution
): Promise<{ success: boolean; exception: Exception }> {
  return apiFetch(`/exceptions/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(resolution),
  });
}

// =============================================================================
// Employee Shifts Service
// =============================================================================

export interface FetchShiftsParams {
  employeeId: string;
  dateRange: DateRange;
}

export async function fetchEmployeeShifts(params: FetchShiftsParams): Promise<Shift[]> {
  const query = buildQueryString({
    startDate: params.dateRange.start,
    endDate: params.dateRange.end,
  });

  const response = await apiFetch<{ data: Shift[]; serverTimestamp: string }>(
    `/employee/${params.employeeId}/shifts?${query}`
  );
  return response.data;
}
