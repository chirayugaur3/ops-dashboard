// PURPOSE: API endpoint for latest employee locations
// CONTRACT: GET /api/locations/latest?startDate&endDate&locationId
// Returns: { data: [{ employeeId, lat, long, status, timestamp }], serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateLatestLocations, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockLatestLocations } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const data = calculateLatestLocations(processedData);
        return NextResponse.json({
          data,
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 350));
    const data = generateMockLatestLocations();

    return NextResponse.json({
      data,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching latest locations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch latest locations' },
      { status: 500 }
    );
  }
}
