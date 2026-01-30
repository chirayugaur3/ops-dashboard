// PURPOSE: API endpoint for employee shift history
// CONTRACT: GET /api/employee/[id]/shifts?startDate&endDate
// Returns: { data: [Shift], serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateEmployeeShifts, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockEmployeeShifts } from '@/lib/mockData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');

    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const data = calculateEmployeeShifts(processedData, id, startDate || undefined);
        return NextResponse.json({
          data,
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 250));
    const data = generateMockEmployeeShifts(id);

    return NextResponse.json({
      data,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching employee shifts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch employee shifts' },
      { status: 500 }
    );
  }
}
