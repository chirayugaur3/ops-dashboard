// PURPOSE: API endpoint for locations list
// CONTRACT: GET /api/locations
// Returns: { data: [{ locationId, name, lat, long, distanceThreshold }], serverTimestamp }

import { NextResponse } from 'next/server';
import { MOCK_LOCATIONS } from '@/lib/mockData';

export async function GET() {
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      data: MOCK_LOCATIONS,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { message: 'Failed to fetch locations' },
      { status: 500 }
    );
  }
}
