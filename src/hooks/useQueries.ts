// PURPOSE: React Query hooks for fetching dashboard data
// RETURNS: { data, isLoading, isError, error, refetch, ... }
// CACHING: Uses React Query with stale-while-revalidate strategy
// DO NOT: Add business logic here - just data fetching and state management

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchKPIs,
  fetchHourlyActivity,
  fetchTopWorkload,
  fetchLatestLocations,
  fetchLocationsList,
  fetchExceptions,
  resolveException,
  fetchEmployeeShifts,
  type FetchKPIsParams,
  type FetchActivityParams,
  type FetchWorkloadParams,
  type FetchLocationsParams,
  type FetchExceptionsParams,
  type FetchShiftsParams,
} from '@/services/api';
import type { ExceptionResolution } from '@/types';

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  kpis: (params: FetchKPIsParams) => ['kpis', params] as const,
  hourlyActivity: (params: FetchActivityParams) => ['activity', 'hourly', params] as const,
  topWorkload: (params: FetchWorkloadParams) => ['employees', 'workload', params] as const,
  latestLocations: (params: FetchLocationsParams) => ['locations', 'latest', params] as const,
  locationsList: () => ['locations', 'list'] as const,
  exceptions: (params: FetchExceptionsParams) => ['exceptions', params] as const,
  employeeShifts: (params: FetchShiftsParams) => ['employee', params.employeeId, 'shifts', params] as const,
} as const;

// =============================================================================
// KPIs Hook
// =============================================================================

export function useKPIs(params: FetchKPIsParams) {
  return useQuery({
    queryKey: queryKeys.kpis(params),
    queryFn: () => fetchKPIs(params),
    refetchInterval: 60 * 1000, // Refresh every minute for live data
  });
}

// =============================================================================
// Hourly Activity Hook
// =============================================================================

export function useHourlyActivity(params: FetchActivityParams) {
  return useQuery({
    queryKey: queryKeys.hourlyActivity(params),
    queryFn: () => fetchHourlyActivity(params),
  });
}

// =============================================================================
// Top Workload Hook
// =============================================================================

export function useTopWorkload(params: FetchWorkloadParams) {
  return useQuery({
    queryKey: queryKeys.topWorkload(params),
    queryFn: () => fetchTopWorkload(params),
  });
}

// =============================================================================
// Latest Locations Hook
// =============================================================================

export function useLatestLocations(params: FetchLocationsParams) {
  return useQuery({
    queryKey: queryKeys.latestLocations(params),
    queryFn: () => fetchLatestLocations(params),
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// =============================================================================
// Locations List Hook
// =============================================================================

export function useLocationsList() {
  return useQuery({
    queryKey: queryKeys.locationsList(),
    queryFn: fetchLocationsList,
    staleTime: 5 * 60 * 1000, // Locations don't change often
  });
}

// =============================================================================
// Exceptions Hook
// =============================================================================

export function useExceptions(params: FetchExceptionsParams) {
  return useQuery({
    queryKey: queryKeys.exceptions(params),
    queryFn: () => fetchExceptions(params),
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

// =============================================================================
// Resolve Exception Mutation
// =============================================================================

export function useResolveException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, resolution }: { id: string; resolution: ExceptionResolution }) =>
      resolveException(id, resolution),
    onSuccess: () => {
      // Invalidate exceptions and KPIs queries after successful resolution
      queryClient.invalidateQueries({ queryKey: ['exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['kpis'] });
    },
  });
}

// =============================================================================
// Employee Shifts Hook
// =============================================================================

export function useEmployeeShifts(params: FetchShiftsParams, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.employeeShifts(params),
    queryFn: () => fetchEmployeeShifts(params),
    enabled,
  });
}
