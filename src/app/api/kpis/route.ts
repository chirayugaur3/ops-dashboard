// PURPOSE: API endpoint for KPIs data
// CONTRACT: GET /api/kpis?startDate&endDate&locationId
// Returns: { activeEmployeesCount, totalWorkingHoursToday, onSiteCompliancePct, exceptionsCount, serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateKPIs, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockKPIs } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');

    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      // If we got data, process and return it
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const kpis = calculateKPIs(processedData, startDate || undefined);
        return NextResponse.json(kpis);
      }
      // Otherwise fall through to mock data
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const kpis = generateMockKPIs();
    return NextResponse.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { message: 'Failed to fetch KPIs' },
      { status: 500 }
    );
  }
}
