// PURPOSE: API endpoint for exceptions list with pagination
// CONTRACT: GET /api/exceptions?startDate&endDate&locationId&status&type&page&limit
// Returns: { total, page, limit, items: [Exception], serverTimestamp }

import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, processSheetData, calculateExceptions, GOOGLE_SHEET_CSV_URL } from '@/lib/googleSheets';
import { generateMockExceptions } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const startDate = searchParams.get('startDate');

    // If Google Sheet is configured, try to use real data
    if (GOOGLE_SHEET_CSV_URL) {
      const rawData = await fetchSheetData();
      
      if (rawData.length > 0) {
        const processedData = processSheetData(rawData);
        const allExceptions = calculateExceptions(processedData, startDate || undefined);
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const paginatedItems = allExceptions.slice(startIndex, startIndex + limit);
        
        return NextResponse.json({
          total: allExceptions.length,
          page,
          limit,
          items: paginatedItems,
          serverTimestamp: new Date().toISOString(),
        });
      }
    }

    // Fallback to mock data
    await new Promise((resolve) => setTimeout(resolve, 300));
    const { total, items } = generateMockExceptions(page, limit);

    return NextResponse.json({
      total,
      page,
      limit,
      items,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
}
