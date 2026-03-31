import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WhatsAppService } from '@/lib/services/whatsapp-service';
import { createRateLimitedNotification } from '@/lib/rate-limiter';
import { db } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

/**
 * POST /api/notifications/trigger
 * Trigger notification based on queue event
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entryId, queueId, type } = body;

    // Get entry details
    const entry = await db.queueEntry.findUnique({
      where: { id: entryId },
      include: {
        queue: true,
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Rate limit check
    const rateLimit = createRateLimitedNotification(entry.phoneNumber);
    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded:', entry.phoneNumber);
      return NextResponse.json(
        { skipped: true, reason: rateLimit.reason },
        { status: 429 }
      );
    }

    // Send appropriate notification
    let result;
    if (type === 'QUEUE_NEXT') {
      result = await WhatsAppService.sendNextNotification(
        entry.queue.name,
        entry.phoneNumber,
        queueId,
        entryId
      );
    } else {
      return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error triggering notification:', error);
    return NextResponse.json(
      { error: 'Failed to trigger notification' },
      { status: 500 }
    );
  }
}
