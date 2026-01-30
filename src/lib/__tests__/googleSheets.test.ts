// PURPOSE: Unit tests for Google Sheets business logic
// Tests the core algorithms: punch pairing (FIFO), KPI calculations, compliance classification
// This draws from TDD principles that emerged in the 1990s - testing drives reliable code

import {
  processSheetData,
  calculateKPIs,
  calculateHourlyActivity,
  calculateTopWorkload,
  calculateLatestLocations,
  calculateExceptions,
  CONFIG,
  type RawPunchRecord,
} from '@/lib/googleSheets';

// =============================================================================
// Test Data Factories
// =============================================================================

function createMockPunch(overrides: Partial<RawPunchRecord> = {}): RawPunchRecord {
  return {
    name: 'John Doe',
    employeeId: 'EMP001',
    punchType: 'Punch In',
    location: '28.6139, 77.2090',
    timestamp: new Date('2026-01-29T09:00:00'),
    manualLocation: 'Office HQ',
    distanceMeters: 25,
    ...overrides,
  };
}

function createPunchPair(
  employeeId: string,
  name: string,
  inTime: string,
  outTime: string,
  distance: number = 25
): RawPunchRecord[] {
  return [
    createMockPunch({
      employeeId,
      name,
      punchType: 'Punch In',
      timestamp: new Date(inTime),
      distanceMeters: distance,
    }),
    createMockPunch({
      employeeId,
      name,
      punchType: 'Punch Out',
      timestamp: new Date(outTime),
      distanceMeters: distance,
    }),
  ];
}

// =============================================================================
// Process Sheet Data Tests
// =============================================================================

describe('processSheetData', () => {
  it('should correctly process empty data', () => {
    const result = processSheetData([]);
    
    expect(result.punches).toHaveLength(0);
    expect(result.employees.size).toBe(0);
    expect(result.punchesByEmployee.size).toBe(0);
    expect(result.punchesByDate.size).toBe(0);
  });

  it('should build employee map from punch records', () => {
    const punches = [
      createMockPunch({ employeeId: 'EMP001', name: 'John Doe' }),
      createMockPunch({ employeeId: 'EMP002', name: 'Jane Smith' }),
      createMockPunch({ employeeId: 'EMP001', name: 'John Doe', punchType: 'Punch Out' }),
    ];

    const result = processSheetData(punches);

    expect(result.employees.size).toBe(2);
    expect(result.employees.get('EMP001')?.name).toBe('John Doe');
    expect(result.employees.get('EMP002')?.name).toBe('Jane Smith');
  });

  it('should group punches by employee', () => {
    const punches = [
      ...createPunchPair('EMP001', 'John', '2026-01-29T09:00', '2026-01-29T17:00'),
      ...createPunchPair('EMP002', 'Jane', '2026-01-29T08:30', '2026-01-29T16:30'),
    ];

    const result = processSheetData(punches);

    expect(result.punchesByEmployee.get('EMP001')).toHaveLength(2);
    expect(result.punchesByEmployee.get('EMP002')).toHaveLength(2);
  });

  it('should group punches by date', () => {
    const punches = [
      createMockPunch({ timestamp: new Date('2026-01-28T09:00:00') }),
      createMockPunch({ timestamp: new Date('2026-01-29T09:00:00') }),
      createMockPunch({ timestamp: new Date('2026-01-29T10:00:00') }),
    ];

    const result = processSheetData(punches);

    expect(result.punchesByDate.get('2026-01-28')).toHaveLength(1);
    expect(result.punchesByDate.get('2026-01-29')).toHaveLength(2);
  });

  it('should sort punches by timestamp', () => {
    const punches = [
      createMockPunch({ timestamp: new Date('2026-01-29T17:00:00') }),
      createMockPunch({ timestamp: new Date('2026-01-29T09:00:00') }),
      createMockPunch({ timestamp: new Date('2026-01-29T12:00:00') }),
    ];

    const result = processSheetData(punches);

    expect(result.punches[0].timestamp.getHours()).toBe(9);
    expect(result.punches[1].timestamp.getHours()).toBe(12);
    expect(result.punches[2].timestamp.getHours()).toBe(17);
  });
});

// =============================================================================
// KPI Calculation Tests
// =============================================================================

describe('calculateKPIs', () => {
  const testDate = '2026-01-29';

  it('should calculate active employees count', () => {
    const punches = [
      ...createPunchPair('EMP001', 'John', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP002', 'Jane', `${testDate}T08:30`, `${testDate}T16:30`),
      ...createPunchPair('EMP003', 'Bob', `${testDate}T10:00`, `${testDate}T18:00`),
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    expect(kpis.activeEmployeesCount).toBe(3);
  });

  it('should calculate total working hours from paired punches', () => {
    // Two employees, each with 8 hours = 16 total hours
    const punches = [
      ...createPunchPair('EMP001', 'John', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP002', 'Jane', `${testDate}T09:00`, `${testDate}T17:00`),
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    expect(kpis.totalWorkingHoursToday).toBe(16);
  });

  it('should not count open sessions in working hours', () => {
    // Only punch in, no punch out
    const punches = [
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch In',
        timestamp: new Date(`${testDate}T09:00:00`),
      }),
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    expect(kpis.totalWorkingHoursToday).toBe(0);
  });

  it('should calculate on-site compliance percentage', () => {
    const punches = [
      // Compliant: distance <= 50m
      createMockPunch({ employeeId: 'EMP001', distanceMeters: 25 }),
      createMockPunch({ employeeId: 'EMP002', distanceMeters: 50 }),
      // Non-compliant: distance > 100m
      createMockPunch({ employeeId: 'EMP003', distanceMeters: 150 }),
      createMockPunch({ employeeId: 'EMP004', distanceMeters: 200 }),
    ].map((p, i) => ({
      ...p,
      timestamp: new Date(`${testDate}T09:0${i}:00`),
    }));

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    // 2 compliant out of 4 = 50%
    expect(kpis.onSiteCompliancePct).toBe(50);
  });

  it('should return 100% compliance when no distance data', () => {
    const punches = [
      createMockPunch({ distanceMeters: null }),
    ].map((p, i) => ({
      ...p,
      timestamp: new Date(`${testDate}T09:0${i}:00`),
    }));

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    expect(kpis.onSiteCompliancePct).toBe(100);
  });

  it('should include serverTimestamp in response', () => {
    const data = processSheetData([]);
    const kpis = calculateKPIs(data, testDate);

    expect(kpis.serverTimestamp).toBeDefined();
    expect(new Date(kpis.serverTimestamp).getTime()).not.toBeNaN();
  });
});

// =============================================================================
// FIFO Punch Pairing Algorithm Tests
// =============================================================================

describe('Punch Pairing (FIFO Algorithm)', () => {
  const testDate = '2026-01-29';

  it('should pair punch in with next punch out', () => {
    const punches = [
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch In',
        timestamp: new Date(`${testDate}T09:00:00`),
      }),
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch Out',
        timestamp: new Date(`${testDate}T17:00:00`),
      }),
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    // 8 hours worked
    expect(kpis.totalWorkingHoursToday).toBe(8);
  });

  it('should handle multiple shifts in a day', () => {
    const punches = [
      // Morning shift: 09:00 - 12:00 (3 hours)
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch In',
        timestamp: new Date(`${testDate}T09:00:00`),
      }),
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch Out',
        timestamp: new Date(`${testDate}T12:00:00`),
      }),
      // Afternoon shift: 13:00 - 17:00 (4 hours)
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch In',
        timestamp: new Date(`${testDate}T13:00:00`),
      }),
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch Out',
        timestamp: new Date(`${testDate}T17:00:00`),
      }),
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    // 3 + 4 = 7 hours
    expect(kpis.totalWorkingHoursToday).toBe(7);
  });

  it('should flag open sessions when no punch out', () => {
    const punches = [
      createMockPunch({
        employeeId: 'EMP001',
        punchType: 'Punch In',
        timestamp: new Date(`${testDate}T09:00:00`),
      }),
      // No punch out
    ];

    const data = processSheetData(punches);
    const kpis = calculateKPIs(data, testDate);

    // Open session should count as exception
    expect(kpis.exceptionsCount).toBeGreaterThanOrEqual(1);
  });
});

// =============================================================================
// Hourly Activity Tests
// =============================================================================

describe('calculateHourlyActivity', () => {
  const testDate = '2026-01-29';

  it('should return activity for working hours (6 AM - 10 PM)', () => {
    const data = processSheetData([]);
    const activity = calculateHourlyActivity(data, testDate);

    // Should have 17 hours (6 AM to 10 PM inclusive)
    expect(activity.length).toBe(17);
    expect(activity[0].hour).toBe('06:00');
    expect(activity[activity.length - 1].hour).toBe('22:00');
  });

  it('should count punch ins and outs by hour', () => {
    const punches = [
      // 9 AM - 3 punch ins
      createMockPunch({ punchType: 'Punch In', timestamp: new Date(`${testDate}T09:05:00`) }),
      createMockPunch({ employeeId: 'EMP002', punchType: 'Punch In', timestamp: new Date(`${testDate}T09:15:00`) }),
      createMockPunch({ employeeId: 'EMP003', punchType: 'Punch In', timestamp: new Date(`${testDate}T09:30:00`) }),
      // 5 PM - 2 punch outs
      createMockPunch({ punchType: 'Punch Out', timestamp: new Date(`${testDate}T17:00:00`) }),
      createMockPunch({ employeeId: 'EMP002', punchType: 'Punch Out', timestamp: new Date(`${testDate}T17:30:00`) }),
    ];

    const data = processSheetData(punches);
    const activity = calculateHourlyActivity(data, testDate);

    const hour9 = activity.find(a => a.hour === '09:00');
    const hour17 = activity.find(a => a.hour === '17:00');

    expect(hour9?.punchIn).toBe(3);
    expect(hour9?.punchOut).toBe(0);
    expect(hour17?.punchIn).toBe(0);
    expect(hour17?.punchOut).toBe(2);
  });
});

// =============================================================================
// Top Workload Tests
// =============================================================================

describe('calculateTopWorkload', () => {
  const testDate = '2026-01-29';

  it('should return employees sorted by hours descending', () => {
    const punches = [
      // EMP001: 8 hours
      ...createPunchPair('EMP001', 'John', `${testDate}T09:00`, `${testDate}T17:00`),
      // EMP002: 6 hours
      ...createPunchPair('EMP002', 'Jane', `${testDate}T10:00`, `${testDate}T16:00`),
      // EMP003: 10 hours
      ...createPunchPair('EMP003', 'Bob', `${testDate}T08:00`, `${testDate}T18:00`),
    ];

    const data = processSheetData(punches);
    const workload = calculateTopWorkload(data, testDate);

    expect(workload[0].employeeId).toBe('EMP003');
    expect(workload[0].totalHours).toBe(10);
    expect(workload[1].employeeId).toBe('EMP001');
    expect(workload[2].employeeId).toBe('EMP002');
  });

  it('should respect the limit parameter', () => {
    const punches = [
      ...createPunchPair('EMP001', 'John', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP002', 'Jane', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP003', 'Bob', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP004', 'Alice', `${testDate}T09:00`, `${testDate}T17:00`),
      ...createPunchPair('EMP005', 'Charlie', `${testDate}T09:00`, `${testDate}T17:00`),
    ];

    const data = processSheetData(punches);
    const workload = calculateTopWorkload(data, testDate, 3);

    expect(workload).toHaveLength(3);
  });
});

// =============================================================================
// Compliance Status Tests
// =============================================================================

describe('Compliance Classification', () => {
  it('should classify distance <= 50m as compliant', () => {
    const punches = [
      createMockPunch({ distanceMeters: 25, timestamp: new Date('2026-01-29T09:00:00') }),
      createMockPunch({ distanceMeters: 50, timestamp: new Date('2026-01-29T10:00:00') }),
    ];

    const data = processSheetData(punches);
    const locations = calculateLatestLocations(data);

    // Both should be compliant
    locations.forEach(loc => {
      expect(loc.status).toBe('compliant');
    });
  });

  it('should classify distance 51-100m as warning', () => {
    const punches = [
      createMockPunch({ distanceMeters: 75, timestamp: new Date('2026-01-29T09:00:00') }),
    ];

    const data = processSheetData(punches);
    const locations = calculateLatestLocations(data);

    expect(locations[0]?.status).toBe('warning');
  });

  it('should classify distance > 100m as breach', () => {
    const punches = [
      createMockPunch({ distanceMeters: 150, timestamp: new Date('2026-01-29T09:00:00') }),
    ];

    const data = processSheetData(punches);
    const locations = calculateLatestLocations(data);

    expect(locations[0]?.status).toBe('breach');
  });

  it('should classify missing distance as unknown', () => {
    const punches = [
      createMockPunch({ distanceMeters: null, timestamp: new Date('2026-01-29T09:00:00') }),
    ];

    const data = processSheetData(punches);
    const locations = calculateLatestLocations(data);

    expect(locations[0]?.status).toBe('unknown');
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Edge Cases', () => {
  it('should handle empty data gracefully', () => {
    const data = processSheetData([]);
    
    expect(() => calculateKPIs(data)).not.toThrow();
    expect(() => calculateHourlyActivity(data)).not.toThrow();
    expect(() => calculateTopWorkload(data)).not.toThrow();
    expect(() => calculateLatestLocations(data)).not.toThrow();
  });

  it('should handle punches without location data', () => {
    const punches = [
      createMockPunch({ location: '', distanceMeters: null }),
    ];

    const data = processSheetData(punches);
    const locations = calculateLatestLocations(data);

    // Should return empty array or handle gracefully
    expect(locations).toBeDefined();
  });

  it('should handle future dates', () => {
    const futureDate = '2030-12-31';
    const data = processSheetData([]);
    
    const kpis = calculateKPIs(data, futureDate);
    expect(kpis.activeEmployeesCount).toBe(0);
  });
});
