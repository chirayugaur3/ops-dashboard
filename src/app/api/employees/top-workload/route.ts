// PURPOSE: API endpoint for top employees by workload
// CONTRACT: GET /api/employees/top-workload?startDate&endDate&locationId&limit
// Returns: { data: [{ employeeId, name, totalHours }], serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateTopWorkload, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockTopWorkload } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const startDate = searchParams.get('startDate');

    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const data = calculateTopWorkload(processedData, startDate || undefined, limit);
        return NextResponse.json({
          data,
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 200));
    const data = generateMockTopWorkload(limit);

    return NextResponse.json({
      data,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching top workload:', error);
    return NextResponse.json(
      { message: 'Failed to fetch top workload' },
      { status: 500 }
    );
  }
}
