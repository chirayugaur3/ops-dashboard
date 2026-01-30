// PURPOSE: Mock data generators for development and testing
// These simulate backend responses following the data contracts in PROJECT_CONTEXT.md
// DO NOT: Use in production - these are development mocks only

import type {
  KPIData,
  HourlyActivity,
  EmployeeWorkload,
  EmployeeLocation,
  Exception,
  Location,
  Shift,
  ComplianceStatus,
  ExceptionType,
  ExceptionSeverity,
} from '@/types';

// =============================================================================
// Mock Employee Data
// =============================================================================

const MOCK_EMPLOYEES = [
  { employeeId: 'EMP001', name: 'Rajesh Kumar' },
  { employeeId: 'EMP002', name: 'Priya Sharma' },
  { employeeId: 'EMP003', name: 'Amit Patel' },
  { employeeId: 'EMP004', name: 'Sneha Gupta' },
  { employeeId: 'EMP005', name: 'Vikram Singh' },
  { employeeId: 'EMP006', name: 'Anjali Verma' },
  { employeeId: 'EMP007', name: 'Rohit Mehta' },
  { employeeId: 'EMP008', name: 'Kavita Reddy' },
  { employeeId: 'EMP009', name: 'Suresh Nair' },
  { employeeId: 'EMP010', name: 'Deepika Joshi' },
  { employeeId: 'EMP011', name: 'Arjun Rao' },
  { employeeId: 'EMP012', name: 'Meera Iyer' },
];

// =============================================================================
// Mock Locations
// =============================================================================

export const MOCK_LOCATIONS: Location[] = [
  { locationId: 'LOC001', name: 'Warehouse A - Gurgaon', lat: 28.4595, long: 77.0266, distanceThreshold: 50 },
  { locationId: 'LOC002', name: 'Distribution Center - Noida', lat: 28.5355, long: 77.3910, distanceThreshold: 50 },
  { locationId: 'LOC003', name: 'Hub - South Delhi', lat: 28.5244, long: 77.2066, distanceThreshold: 50 },
  { locationId: 'LOC004', name: 'Sorting Facility - Faridabad', lat: 28.4089, long: 77.3178, distanceThreshold: 50 },
];

// =============================================================================
// KPIs Mock Generator
// =============================================================================

export function generateMockKPIs(): KPIData {
  return {
    activeEmployeesCount: Math.floor(Math.random() * 50) + 100,
    totalWorkingHoursToday: Math.floor(Math.random() * 200) + 600,
    onSiteCompliancePct: Math.floor(Math.random() * 15) + 85,
    exceptionsCount: Math.floor(Math.random() * 10) + 5,
    serverTimestamp: new Date().toISOString(),
  };
}

// =============================================================================
// Hourly Activity Mock Generator
// =============================================================================

export function generateMockHourlyActivity(): HourlyActivity[] {
  const hours = [];
  for (let h = 6; h <= 22; h++) {
    const hour = h.toString().padStart(2, '0') + ':00';
    const baseIn = h >= 8 && h <= 10 ? 20 : h >= 17 && h <= 19 ? 5 : 8;
    const baseOut = h >= 8 && h <= 10 ? 5 : h >= 17 && h <= 19 ? 18 : 6;
    
    hours.push({
      hour,
      punchIn: Math.floor(Math.random() * 10) + baseIn,
      punchOut: Math.floor(Math.random() * 10) + baseOut,
    });
  }
  return hours;
}

// =============================================================================
// Top Workload Mock Generator
// =============================================================================

export function generateMockTopWorkload(limit: number = 10): EmployeeWorkload[] {
  return MOCK_EMPLOYEES
    .slice(0, limit)
    .map((emp) => ({
      ...emp,
      totalHours: Math.floor(Math.random() * 4) + 6 + Math.random(),
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
}

// =============================================================================
// Latest Locations Mock Generator
// =============================================================================

export function generateMockLatestLocations(): EmployeeLocation[] {
  const statuses: ComplianceStatus[] = ['compliant', 'compliant', 'compliant', 'warning', 'breach', 'unknown'];
  
  return MOCK_EMPLOYEES.slice(0, 8).map((emp, index) => {
    const baseLocation = MOCK_LOCATIONS[index % MOCK_LOCATIONS.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Add some variance to locations
    const latOffset = (Math.random() - 0.5) * 0.01;
    const longOffset = (Math.random() - 0.5) * 0.01;
    
    return {
      employeeId: emp.employeeId,
      name: emp.name,
      lat: baseLocation.lat + latOffset,
      long: baseLocation.long + longOffset,
      status,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      distance: status === 'unknown' ? undefined : 
        status === 'compliant' ? Math.floor(Math.random() * 40) :
        status === 'warning' ? Math.floor(Math.random() * 50) + 50 :
        Math.floor(Math.random() * 100) + 100,
    };
  });
}

// =============================================================================
// Exceptions Mock Generator
// =============================================================================

export function generateMockExceptions(page: number = 1, limit: number = 20): {
  total: number;
  items: Exception[];
} {
  const types: ExceptionType[] = ['OpenSession', 'PunchOutWithoutIn', 'LocationBreach', 'LocationMissing'];
  const severities: ExceptionSeverity[] = ['warning', 'critical'];
  
  const allExceptions: Exception[] = [];
  
  // Generate 25 mock exceptions
  for (let i = 1; i <= 25; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const emp = MOCK_EMPLOYEES[Math.floor(Math.random() * MOCK_EMPLOYEES.length)];
    const location = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
    
    allExceptions.push({
      id: `EXC${i.toString().padStart(5, '0')}`,
      employeeId: emp.employeeId,
      name: emp.name,
      type,
      severity: type === 'LocationBreach' || (type === 'OpenSession' && Math.random() > 0.5) 
        ? 'critical' 
        : 'warning',
      status: Math.random() > 0.8 ? 'resolved' : 'open',
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      locationText: location.name,
      distance: type === 'LocationBreach' 
        ? Math.floor(Math.random() * 150) + 100 
        : type === 'LocationMissing' 
        ? null 
        : Math.floor(Math.random() * 200),
      notes: null,
    });
  }
  
  const start = (page - 1) * limit;
  const items = allExceptions.slice(start, start + limit);
  
  return {
    total: allExceptions.length,
    items,
  };
}

// =============================================================================
// Employee Shifts Mock Generator
// =============================================================================

export function generateMockEmployeeShifts(employeeId: string): Shift[] {
  const shifts: Shift[] = [];
  const today = new Date();
  
  // Generate shifts for the last 7 days
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    
    // Morning shift
    const shiftStart = new Date(date);
    shiftStart.setHours(9, Math.floor(Math.random() * 15), 0);
    
    const hasEnded = Math.random() > 0.2 || d > 0;
    const shiftEnd = hasEnded ? new Date(shiftStart) : null;
    if (shiftEnd) {
      shiftEnd.setHours(shiftStart.getHours() + 8 + Math.floor(Math.random() * 2));
    }
    
    const distanceStart = Math.floor(Math.random() * 60);
    const distanceEnd = hasEnded ? Math.floor(Math.random() * 60) : null;
    
    shifts.push({
      shiftStart: shiftStart.toISOString(),
      shiftEnd: shiftEnd?.toISOString() ?? null,
      durationMinutes: hasEnded && shiftEnd 
        ? Math.floor((shiftEnd.getTime() - shiftStart.getTime()) / 60000)
        : null,
      distanceStart,
      distanceEnd,
      onSiteStart: distanceStart <= 50,
      onSiteEnd: distanceEnd !== null ? distanceEnd <= 50 : null,
    });
  }
  
  return shifts;
}
