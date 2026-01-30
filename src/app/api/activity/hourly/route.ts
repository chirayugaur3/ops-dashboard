// PURPOSE: API endpoint for hourly punch activity data
// CONTRACT: GET /api/activity/hourly?startDate&endDate&locationId
// Returns: { data: [{ hour, punchIn, punchOut }], serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateHourlyActivity, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockHourlyActivity } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');

    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const data = calculateHourlyActivity(processedData, startDate || undefined);
        return NextResponse.json({
          data,
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 250));
    const data = generateMockHourlyActivity();

    return NextResponse.json({
      data,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching hourly activity:', error);
    return NextResponse.json(
      { message: 'Failed to fetch hourly activity' },
      { status: 500 }
    );
  }
}
