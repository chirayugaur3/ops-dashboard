// PURPOSE: API endpoint for resolving an exception
// CONTRACT: POST /api/exceptions/[id]/resolve
// Body: { resolverId, resolutionNote }
// Returns: { success: boolean, exception: Exception }

import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { resolverId, resolutionNote } = body;

    if (!resolverId || !resolutionNote) {
      return NextResponse.json(
        { message: 'resolverId and resolutionNote are required' },
        { status: 400 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, this would update the database
    // For mock, we just return success
    return NextResponse.json({
      success: true,
      exception: {
        id,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        resolvedBy: resolverId,
        resolutionNote,
      },
    });
  } catch (error) {
    console.error('Error resolving exception:', error);
    return NextResponse.json(
      { message: 'Failed to resolve exception' },
      { status: 500 }
    );
  }
}
