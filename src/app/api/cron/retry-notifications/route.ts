import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { WhatsAppService } from '@/lib/services/whatsapp-service';
import { NotificationStatus, NotificationType } from '@prisma/client';

/**
 * POST /api/cron/retry-notifications
 * Retry failed notifications every hour
 */
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get failed notifications with < 3 attempts
    const failedNotifications = await db.notification.findMany({
      where: {
        status: NotificationStatus.FAILED,
        attempts: { lt: 3 },
      },
      take: 20, // Process 20 at a time
    });

    const results = await Promise.all(
      failedNotifications.map((notification) =>
        WhatsAppService.sendNotification({
          queueId: notification.queueId,
          entryId: notification.entryId || undefined,
          userId: notification.userId || undefined,
          type: notification.type as NotificationType,
          phone: notification.phone,
          message: notification.message,
        })
      )
    );

    const successCount = results.filter((r) => r.success).length;

    console.log('Notification retry completed:', {
      attempted: failedNotifications.length,
      succeeded: successCount,
      failed: failedNotifications.length - successCount,
    });

    return NextResponse.json({
      success: true,
      attempted: failedNotifications.length,
      succeeded: successCount,
    });
  } catch (error) {
    console.error('Error retrying notifications:', error);
    return NextResponse.json({ error: 'Retry failed' }, { status: 500 });
  }
}
