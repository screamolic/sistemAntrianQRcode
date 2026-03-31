import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

/**
 * POST /api/notifications/preferences
 * Update notification preferences for an entry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryId, optIn } = body;

    // For now, just log the preference
    // In production, store in database and check before sending
    console.log(`Notification preference for ${entryId}: ${optIn ? 'OPT-IN' : 'OPT-OUT'}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications/preferences
 * Get notification preferences for an entry
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('entryId');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const entry = await db.queueEntry.findUnique({
      where: { id: entryId },
      select: { id: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // For now, return default opt-in status
    // In production, store preference in database
    return NextResponse.json({ optIn: true });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}
