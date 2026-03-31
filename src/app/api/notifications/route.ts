import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { WhatsAppService } from '@/lib/services/whatsapp-service';
import { createRateLimitedNotification } from '@/lib/rate-limiter';
import { db } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

/**
 * POST /api/notifications
 * Send a notification (internal use, requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { queueId, entryId, type, phone, message } = body;

    // Rate limit check
    const rateLimit = createRateLimitedNotification(phone);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason, skipped: true },
        { status: 429 }
      );
    }

    const result = await WhatsAppService.sendNotification({
      queueId,
      entryId,
      userId: session.user.id,
      type: type as NotificationType,
      phone,
      message,
    });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/notifications
 * Get notification history (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    const notifications = await db.notification.findMany({
      where: queueId ? { queueId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
