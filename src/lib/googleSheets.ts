// PURPOSE: Google Sheets data service
// Fetches attendance data from a published Google Sheet CSV
// Parses and transforms raw rows into typed data structures
// DO NOT: Store sensitive data; this uses publicly published sheet

import type {
  KPIData,
  HourlyActivity,
  EmployeeWorkload,
  EmployeeLocation,
  Exception,
  ExceptionType,
  ExceptionSeverity,
  Shift,
  Location,
  ComplianceStatus,
} from '@/types';

// =============================================================================
// Configuration
// =============================================================================

// IMPORTANT: Replace this with your published Google Sheet CSV URL
// To get this URL:
// 1. Open Google Sheet → File → Share → Publish to web
// 2. Select "Comma-separated values (.csv)" 
// 3. Click Publish and copy the URL
export const GOOGLE_SHEET_CSV_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '';

// Business rules configuration
export const CONFIG = {
  // Work start time (for late arrival calculation)
  WORK_START_HOUR: 9,
  WORK_START_MINUTE: 0,
  
  // Distance threshold for on-site compliance (meters)
  DISTANCE_THRESHOLD_COMPLIANT: 50,
  DISTANCE_THRESHOLD_WARNING: 100,
  
  // Open session threshold (hours)
  OPEN_SESSION_WARNING_HOURS: 8,
  OPEN_SESSION_CRITICAL_HOURS: 12,
  
  // Grace period for late arrival (minutes)
  LATE_GRACE_PERIOD_MINUTES: 15,
};

// =============================================================================
// Raw Data Types (from Google Sheet)
// =============================================================================

export interface RawPunchRecord {
  name: string;
  employeeId: string;
  punchType: 'Punch In' | 'Punch Out';
  location: string; // GPS coordinates "lat, long"
  timestamp: Date;
  manualLocation: string;
  distanceMeters: number | null;
}

// Flag to track if we've already shown the setup message
let sheetSetupWarningShown = false;

// =============================================================================
// CSV Fetching & Parsing
// =============================================================================

export async function fetchSheetData(): Promise<RawPunchRecord[]> {
  if (!GOOGLE_SHEET_CSV_URL) {
    console.warn('Google Sheet URL not configured. Using mock data.');
    return [];
  }

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, {
      cache: 'no-store', // Always fetch fresh data
      redirect: 'follow', // Follow redirects (Google Sheets uses them)
    });

    if (!response.ok) {
      // If 401/403, the sheet isn't published to web yet
      if (response.status === 401 || response.status === 403) {
        if (!sheetSetupWarningShown) {
          console.warn(`
╔═══════════════════════════════════════════════════════════════════════╗
║           GOOGLE SHEET NOT YET PUBLISHED TO WEB                       ║
╠═══════════════════════════════════════════════════════════════════════╣
║ To connect your Google Sheet:                                         ║
║                                                                       ║
║ 1. Open your Google Sheet                                             ║
║ 2. Go to File → Share → Publish to web                               ║
║ 3. Under "Link", select "Comma-separated values (.csv)"              ║
║ 4. Click "Publish"                                                    ║
║ 5. The dashboard will auto-detect the published sheet                 ║
║                                                                       ║
║ Currently using MOCK DATA for demonstration.                          ║
╚═══════════════════════════════════════════════════════════════════════╝
          `);
          sheetSetupWarningShown = true;
        }
        return []; // Return empty to trigger mock data fallback
      }
      throw new Error(`Failed to fetch sheet: ${response.status}`);
    }

    const csvText = await response.text();
    
    // Check if response is HTML (redirect page) instead of CSV
    if (csvText.trim().startsWith('<') || csvText.includes('<!DOCTYPE')) {
      console.warn('Received HTML instead of CSV. Sheet may not be properly published.');
      return [];
    }
    
    console.log(`✓ Fetched ${csvText.split('\n').length} rows from Google Sheet`);
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error fetching Google Sheet:', error);
    return []; // Return empty to trigger mock data fallback
  }
}

function parseCSV(csvText: string): RawPunchRecord[] {
  const lines = csvText.split('\n');
  
  if (lines.length < 2) {
    return [];
  }

  // Parse header row to find column indices
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  
  const columnMap = {
    name: findColumnIndex(headers, ['name', 'employee name', 'employee_name']),
    employeeId: findColumnIndex(headers, ['employee id', 'employee_id', 'employeeid', 'id']),
    punchType: findColumnIndex(headers, ['punch type', 'punch_type', 'punchtype', 'type']),
    location: findColumnIndex(headers, ['location', 'gps', 'coordinates']),
    timestamp: findColumnIndex(headers, ['timestamp', 'time', 'date time', 'datetime']),
    manualLocation: findColumnIndex(headers, ['manual location', 'manual_location', 'manuallocation', 'place']),
    distance: findColumnIndex(headers, ['distance(m)', 'distance', 'distance_m', 'distancem']),
  };

  // Parse data rows
  const records: RawPunchRecord[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    try {
      const record = parseRow(values, columnMap);
      if (record) {
        records.push(record);
      }
    } catch (e) {
      console.warn(`Failed to parse row ${i + 1}:`, e);
    }
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.indexOf(name.toLowerCase());
    if (index !== -1) return index;
  }
  return -1;
}

interface ColumnMap {
  name: number;
  employeeId: number;
  punchType: number;
  location: number;
  timestamp: number;
  manualLocation: number;
  distance: number;
}

/**
 * Normalize Employee ID to handle inconsistent data entry:
 * - Remove extra whitespace
 * - Standardize common typos (e.g., LYLB -> AYLB)
 */
function normalizeEmployeeId(raw: string): string {
  if (!raw) return '';
  
  // Trim and collapse multiple spaces to single space, then remove all spaces
  let normalized = raw.trim().replace(/\s+/g, '');
  
  // Handle common typos (add more patterns as needed)
  // LYLB -> AYLB (common typo where L is typed instead of A)
  normalized = normalized.replace(/^LYLB/i, 'AYLB');
  
  return normalized.toUpperCase();
}

function parseRow(values: string[], columnMap: ColumnMap): RawPunchRecord | null {
  const name = values[columnMap.name] || '';
  const employeeIdRaw = values[columnMap.employeeId] || '';
  const punchTypeRaw = values[columnMap.punchType] || '';
  const timestampRaw = values[columnMap.timestamp] || '';

  // Normalize employee ID to handle inconsistent data entry
  const employeeId = normalizeEmployeeId(employeeIdRaw);

  // Skip empty rows
  if (!name || !employeeId || !timestampRaw) {
    return null;
  }

  // Parse punch type
  const punchType = punchTypeRaw.toLowerCase().includes('out') ? 'Punch Out' : 'Punch In';

  // Parse timestamp
  const timestamp = parseTimestamp(timestampRaw);
  if (!timestamp) {
    return null;
  }

  // Parse distance
  const distanceRaw = values[columnMap.distance] || '';
  const distanceMeters = distanceRaw ? parseFloat(distanceRaw) : null;

  return {
    name: name.trim(),
    employeeId, // Already normalized
    punchType,
    location: values[columnMap.location] || '',
    timestamp,
    manualLocation: values[columnMap.manualLocation] || '',
    distanceMeters: isNaN(distanceMeters!) ? null : distanceMeters,
  };
}

function parseTimestamp(raw: string): Date | null {
  if (!raw) return null;

  // Try DD/MM/YYYY HH:mm:ss format FIRST (this is what the Google Sheet uses)
  const ddmmMatch = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):?(\d{2})?/);
  if (ddmmMatch) {
    const [, day, month, year, hour, minute, second = '0'] = ddmmMatch;
    // Validate that day/month are reasonable
    const d = +day, m = +month;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return new Date(+year, m - 1, d, +hour, +minute, +second);
    }
  }

  // Try ISO format as fallback (YYYY-MM-DD)
  if (raw.match(/^\d{4}-\d{2}-\d{2}/)) {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}

// =============================================================================
// Data Transformation Functions
// =============================================================================

export interface ProcessedData {
  punches: RawPunchRecord[];
  employees: Map<string, { id: string; name: string }>;
  punchesByEmployee: Map<string, RawPunchRecord[]>;
  punchesByDate: Map<string, RawPunchRecord[]>;
  todayPunches: RawPunchRecord[];
}

export function processSheetData(records: RawPunchRecord[]): ProcessedData {
  const employees = new Map<string, { id: string; name: string }>();
  const punchesByEmployee = new Map<string, RawPunchRecord[]>();
  const punchesByDate = new Map<string, RawPunchRecord[]>();

  const today = new Date();
  const todayStr = formatDateKey(today);
  const todayPunches: RawPunchRecord[] = [];

  // Sort records by timestamp
  const sortedRecords = [...records].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  for (const record of sortedRecords) {
    // Build employee map - update name if we get a non-empty one
    const existingEmployee = employees.get(record.employeeId);
    if (!existingEmployee) {
      employees.set(record.employeeId, {
        id: record.employeeId,
        name: record.name || record.employeeId, // Fallback to ID if no name
      });
    } else if (!existingEmployee.name && record.name) {
      // Update with actual name if we previously only had empty/ID
      existingEmployee.name = record.name;
    } else if (existingEmployee.name === existingEmployee.id && record.name) {
      // Update if current name is just the ID and we have a real name
      existingEmployee.name = record.name;
    }

    // Group by employee
    if (!punchesByEmployee.has(record.employeeId)) {
      punchesByEmployee.set(record.employeeId, []);
    }
    punchesByEmployee.get(record.employeeId)!.push(record);

    // Group by date
    const dateKey = formatDateKey(record.timestamp);
    if (!punchesByDate.has(dateKey)) {
      punchesByDate.set(dateKey, []);
    }
    punchesByDate.get(dateKey)!.push(record);

    // Collect today's punches
    if (dateKey === todayStr) {
      todayPunches.push(record);
    }
  }

  return {
    punches: sortedRecords,
    employees,
    punchesByEmployee,
    punchesByDate,
    todayPunches,
  };
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// =============================================================================
// KPI Calculations
// =============================================================================

export function calculateKPIs(data: ProcessedData, dateStr?: string): KPIData {
  const targetDate = dateStr || formatDateKey(new Date());
  const dayPunches = data.punchesByDate.get(targetDate) || [];

  // Active employees: unique employees who punched in today
  const activeEmployeeIds = new Set(
    dayPunches
      .filter(p => p.punchType === 'Punch In')
      .map(p => p.employeeId)
  );

  // Calculate total working hours from paired punches
  const { totalHours, openSessions } = calculateWorkingHours(dayPunches);

  // On-site compliance
  const punchesWithDistance = dayPunches.filter(p => p.distanceMeters !== null);
  const compliantPunches = punchesWithDistance.filter(
    p => p.distanceMeters! <= CONFIG.DISTANCE_THRESHOLD_COMPLIANT
  );
  const compliancePct = punchesWithDistance.length > 0
    ? Math.round((compliantPunches.length / punchesWithDistance.length) * 100)
    : 100;

  // Count exceptions
  const lateArrivals = countLateArrivals(dayPunches);
  const locationBreaches = punchesWithDistance.filter(
    p => p.distanceMeters! > CONFIG.DISTANCE_THRESHOLD_WARNING
  ).length;

  const exceptionsCount = openSessions + lateArrivals + locationBreaches;

  return {
    activeEmployeesCount: activeEmployeeIds.size,
    totalWorkingHoursToday: Math.round(totalHours * 10) / 10,
    onSiteCompliancePct: compliancePct,
    exceptionsCount,
    serverTimestamp: new Date().toISOString(),
  };
}

function calculateWorkingHours(punches: RawPunchRecord[]): {
  totalHours: number;
  openSessions: number;
} {
  // Group punches by employee
  const byEmployee = new Map<string, RawPunchRecord[]>();
  for (const punch of punches) {
    if (!byEmployee.has(punch.employeeId)) {
      byEmployee.set(punch.employeeId, []);
    }
    byEmployee.get(punch.employeeId)!.push(punch);
  }

  let totalMinutes = 0;
  let openSessions = 0;

  for (const [, empPunches] of byEmployee) {
    // Sort by timestamp
    const sorted = [...empPunches].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Pair punches (FIFO)
    let i = 0;
    while (i < sorted.length) {
      const punch = sorted[i];
      
      if (punch.punchType === 'Punch In') {
        // Find next punch out
        let foundOut = false;
        for (let j = i + 1; j < sorted.length; j++) {
          if (sorted[j].punchType === 'Punch Out') {
            // Calculate duration
            const duration = sorted[j].timestamp.getTime() - punch.timestamp.getTime();
            totalMinutes += duration / (1000 * 60);
            foundOut = true;
            i = j + 1;
            break;
          }
        }
        
        if (!foundOut) {
          // Open session
          openSessions++;
          i++;
        }
      } else {
        i++;
      }
    }
  }

  return {
    totalHours: totalMinutes / 60,
    openSessions,
  };
}

function countLateArrivals(punches: RawPunchRecord[]): number {
  const punchIns = punches.filter(p => p.punchType === 'Punch In');
  
  // Get first punch-in per employee
  const firstPunchByEmployee = new Map<string, RawPunchRecord>();
  for (const punch of punchIns) {
    if (!firstPunchByEmployee.has(punch.employeeId)) {
      firstPunchByEmployee.set(punch.employeeId, punch);
    }
  }

  let lateCount = 0;
  const lateThreshold = CONFIG.WORK_START_HOUR * 60 + CONFIG.WORK_START_MINUTE + CONFIG.LATE_GRACE_PERIOD_MINUTES;

  for (const [, punch] of firstPunchByEmployee) {
    const punchMinutes = punch.timestamp.getHours() * 60 + punch.timestamp.getMinutes();
    if (punchMinutes > lateThreshold) {
      lateCount++;
    }
  }

  return lateCount;
}

// =============================================================================
// Hourly Activity Calculation
// =============================================================================

export function calculateHourlyActivity(data: ProcessedData, dateStr?: string): HourlyActivity[] {
  const targetDate = dateStr || formatDateKey(new Date());
  const dayPunches = data.punchesByDate.get(targetDate) || [];

  // Initialize all hours
  const hourlyMap = new Map<string, { punchIn: number; punchOut: number }>();
  for (let h = 0; h < 24; h++) {
    const hour = `${String(h).padStart(2, '0')}:00`;
    hourlyMap.set(hour, { punchIn: 0, punchOut: 0 });
  }

  // Count punches by hour
  for (const punch of dayPunches) {
    const hour = `${String(punch.timestamp.getHours()).padStart(2, '0')}:00`;
    const entry = hourlyMap.get(hour)!;
    
    if (punch.punchType === 'Punch In') {
      entry.punchIn++;
    } else {
      entry.punchOut++;
    }
  }

  // Convert to array (only working hours 6 AM - 10 PM)
  return Array.from(hourlyMap.entries())
    .filter(([hour]) => {
      const h = parseInt(hour);
      return h >= 6 && h <= 22;
    })
    .map(([hour, counts]) => ({
      hour,
      punchIn: counts.punchIn,
      punchOut: counts.punchOut,
    }));
}

// =============================================================================
// Top Workload Calculation
// =============================================================================

export function calculateTopWorkload(
  data: ProcessedData,
  dateStr?: string,
  limit: number = 10
): EmployeeWorkload[] {
  const targetDate = dateStr || formatDateKey(new Date());
  const dayPunches = data.punchesByDate.get(targetDate) || [];

  // Group by employee
  const byEmployee = new Map<string, RawPunchRecord[]>();
  for (const punch of dayPunches) {
    if (!byEmployee.has(punch.employeeId)) {
      byEmployee.set(punch.employeeId, []);
    }
    byEmployee.get(punch.employeeId)!.push(punch);
  }

  // Calculate hours per employee
  const workloads: EmployeeWorkload[] = [];

  for (const [empId, empPunches] of byEmployee) {
    const employee = data.employees.get(empId);
    if (!employee) continue;

    const { totalHours } = calculateWorkingHours(empPunches);
    
    workloads.push({
      employeeId: empId,
      name: employee.name,
      totalHours: Math.round(totalHours * 10) / 10,
    });
  }

  // Sort by hours descending and limit
  return workloads
    .sort((a, b) => b.totalHours - a.totalHours)
    .slice(0, limit);
}

// =============================================================================
// Latest Locations Calculation
// =============================================================================

export function calculateLatestLocations(data: ProcessedData): EmployeeLocation[] {
  const locations: EmployeeLocation[] = [];

  for (const [empId, empPunches] of data.punchesByEmployee) {
    const employee = data.employees.get(empId);
    if (!employee) continue;

    // Get most recent punch
    const latest = empPunches[empPunches.length - 1];
    if (!latest) continue;

    // Parse GPS coordinates
    const coords = parseCoordinates(latest.location);
    if (!coords) continue;

    // Determine compliance status
    let status: ComplianceStatus = 'unknown';
    if (latest.distanceMeters !== null) {
      if (latest.distanceMeters <= CONFIG.DISTANCE_THRESHOLD_COMPLIANT) {
        status = 'compliant';
      } else if (latest.distanceMeters <= CONFIG.DISTANCE_THRESHOLD_WARNING) {
        status = 'warning';
      } else {
        status = 'breach';
      }
    }

    locations.push({
      employeeId: empId,
      name: employee.name,
      lat: coords.lat,
      long: coords.long,
      status,
      timestamp: latest.timestamp.toISOString(),
      distance: latest.distanceMeters ?? undefined,
    });
  }

  return locations;
}

function parseCoordinates(locationStr: string): { lat: number; long: number } | null {
  if (!locationStr) return null;

  // Try to parse "lat, long" format
  const parts = locationStr.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]);
    const long = parseFloat(parts[1]);
    
    if (!isNaN(lat) && !isNaN(long)) {
      return { lat, long };
    }
  }

  return null;
}

// =============================================================================
// Exceptions Calculation
// =============================================================================

export function calculateExceptions(
  data: ProcessedData,
  dateStr?: string
): Exception[] {
  const targetDate = dateStr || formatDateKey(new Date());
  const dayPunches = data.punchesByDate.get(targetDate) || [];
  const exceptions: Exception[] = [];
  let exceptionId = 1;

  // Group by employee
  const byEmployee = new Map<string, RawPunchRecord[]>();
  for (const punch of dayPunches) {
    if (!byEmployee.has(punch.employeeId)) {
      byEmployee.set(punch.employeeId, []);
    }
    byEmployee.get(punch.employeeId)!.push(punch);
  }

  for (const [empId, empPunches] of byEmployee) {
    const employee = data.employees.get(empId);
    if (!employee) continue;

    const sorted = [...empPunches].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Check for late arrivals
    const firstIn = sorted.find(p => p.punchType === 'Punch In');
    if (firstIn) {
      const lateThreshold = CONFIG.WORK_START_HOUR * 60 + CONFIG.WORK_START_MINUTE + CONFIG.LATE_GRACE_PERIOD_MINUTES;
      const punchMinutes = firstIn.timestamp.getHours() * 60 + firstIn.timestamp.getMinutes();
      
      if (punchMinutes > lateThreshold) {
        const minutesLate = punchMinutes - (CONFIG.WORK_START_HOUR * 60 + CONFIG.WORK_START_MINUTE);
        exceptions.push({
          id: `EXC${String(exceptionId++).padStart(5, '0')}`,
          employeeId: empId,
          name: employee.name,
          type: 'OpenSession', // Reusing type for late arrival
          severity: minutesLate > 60 ? 'critical' : 'warning',
          status: 'open',
          timestamp: firstIn.timestamp.toISOString(),
          locationText: firstIn.manualLocation || 'Unknown',
          distance: firstIn.distanceMeters,
          notes: `Late arrival by ${minutesLate} minutes`,
        });
      }
    }

    // Check for open sessions (punch in without punch out)
    let i = 0;
    while (i < sorted.length) {
      const punch = sorted[i];
      
      if (punch.punchType === 'Punch In') {
        let foundOut = false;
        for (let j = i + 1; j < sorted.length; j++) {
          if (sorted[j].punchType === 'Punch Out') {
            foundOut = true;
            i = j + 1;
            break;
          }
        }
        
        if (!foundOut) {
          const hoursOpen = (Date.now() - punch.timestamp.getTime()) / (1000 * 60 * 60);
          
          if (hoursOpen >= CONFIG.OPEN_SESSION_WARNING_HOURS) {
            exceptions.push({
              id: `EXC${String(exceptionId++).padStart(5, '0')}`,
              employeeId: empId,
              name: employee.name,
              type: 'OpenSession',
              severity: hoursOpen >= CONFIG.OPEN_SESSION_CRITICAL_HOURS ? 'critical' : 'warning',
              status: 'open',
              timestamp: punch.timestamp.toISOString(),
              locationText: punch.manualLocation || 'Unknown',
              distance: punch.distanceMeters,
              notes: `Open session for ${Math.round(hoursOpen)} hours (no punch out)`,
            });
          }
          i++;
        }
      } else {
        // Punch out without punch in
        const hasPriorIn = sorted.slice(0, i).some(p => p.punchType === 'Punch In');
        if (!hasPriorIn) {
          exceptions.push({
            id: `EXC${String(exceptionId++).padStart(5, '0')}`,
            employeeId: empId,
            name: employee.name,
            type: 'PunchOutWithoutIn',
            severity: 'warning',
            status: 'open',
            timestamp: punch.timestamp.toISOString(),
            locationText: punch.manualLocation || 'Unknown',
            distance: punch.distanceMeters,
            notes: 'Punch out without preceding punch in',
          });
        }
        i++;
      }
    }

    // Check for location breaches
    for (const punch of sorted) {
      if (punch.distanceMeters !== null && punch.distanceMeters > CONFIG.DISTANCE_THRESHOLD_WARNING) {
        exceptions.push({
          id: `EXC${String(exceptionId++).padStart(5, '0')}`,
          employeeId: empId,
          name: employee.name,
          type: 'LocationBreach',
          severity: punch.distanceMeters > 200 ? 'critical' : 'warning',
          status: 'open',
          timestamp: punch.timestamp.toISOString(),
          locationText: punch.manualLocation || 'Unknown',
          distance: punch.distanceMeters,
          notes: `Distance ${punch.distanceMeters}m exceeds threshold`,
        });
      }
    }
  }

  // Sort by severity (critical first) then by timestamp
  return exceptions.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'critical' ? -1 : 1;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

// =============================================================================
// Employee Shifts Calculation
// =============================================================================

export function calculateEmployeeShifts(
  data: ProcessedData,
  employeeId: string,
  startDate?: string,
  endDate?: string
): Shift[] {
  const empPunches = data.punchesByEmployee.get(employeeId) || [];
  const shifts: Shift[] = [];

  // Filter by date range if provided
  let filteredPunches = empPunches;
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    filteredPunches = empPunches.filter(
      p => p.timestamp >= start && p.timestamp <= end
    );
  }

  // Sort by timestamp
  const sorted = [...filteredPunches].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  // Pair punches
  let i = 0;
  while (i < sorted.length) {
    const punch = sorted[i];
    
    if (punch.punchType === 'Punch In') {
      let shiftEnd: RawPunchRecord | null = null;
      
      for (let j = i + 1; j < sorted.length; j++) {
        if (sorted[j].punchType === 'Punch Out') {
          shiftEnd = sorted[j];
          i = j + 1;
          break;
        }
      }

      const durationMinutes = shiftEnd
        ? Math.round((shiftEnd.timestamp.getTime() - punch.timestamp.getTime()) / (1000 * 60))
        : null;

      shifts.push({
        shiftStart: punch.timestamp.toISOString(),
        shiftEnd: shiftEnd?.timestamp.toISOString() ?? null,
        durationMinutes,
        distanceStart: punch.distanceMeters,
        distanceEnd: shiftEnd?.distanceMeters ?? null,
        onSiteStart: punch.distanceMeters !== null 
          ? punch.distanceMeters <= CONFIG.DISTANCE_THRESHOLD_COMPLIANT 
          : false,
        onSiteEnd: shiftEnd && shiftEnd.distanceMeters !== null
          ? shiftEnd.distanceMeters <= CONFIG.DISTANCE_THRESHOLD_COMPLIANT
          : null,
      });

      if (!shiftEnd) i++;
    } else {
      i++;
    }
  }

  return shifts.reverse(); // Most recent first
}

// =============================================================================
// Get Unique Locations from Data
// =============================================================================

export function getUniqueLocations(data: ProcessedData): Location[] {
  const locationMap = new Map<string, Location>();

  for (const punch of data.punches) {
    if (punch.manualLocation && !locationMap.has(punch.manualLocation)) {
      const coords = parseCoordinates(punch.location);
      
      locationMap.set(punch.manualLocation, {
        locationId: punch.manualLocation.replace(/\s+/g, '_').toUpperCase(),
        name: punch.manualLocation,
        lat: coords?.lat ?? 0,
        long: coords?.long ?? 0,
        distanceThreshold: CONFIG.DISTANCE_THRESHOLD_COMPLIANT,
      });
    }
  }

  return Array.from(locationMap.values());
}
