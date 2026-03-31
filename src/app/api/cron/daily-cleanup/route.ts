import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { EntryStatus, NotificationStatus } from '@prisma/client';

/**
 * POST /api/cron/daily-cleanup
 * Daily maintenance: clean expired queues, old notifications
 * Protected by Vercel Cron authorization
 */
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Archive expired queues (older than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const archivedQueues = await db.queue.updateMany({
      where: {
        expiresAt: { lt: now },
        updatedAt: { lt: sevenDaysAgo },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    // 2. Delete old notifications (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const deletedNotifications = await db.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        status: { in: [NotificationStatus.SENT, NotificationStatus.FAILED] },
      },
    });

    // 3. Mark stale queue entries as NO_SHOW (waiting > 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const markedNoShow = await db.queueEntry.updateMany({
      where: {
        status: EntryStatus.WAITING,
        createdAt: { lt: twentyFourHoursAgo },
      },
      data: {
        status: EntryStatus.NO_SHOW,
      },
    });

    console.log('Daily cleanup completed:', {
      archivedQueues: archivedQueues.count,
      deletedNotifications: deletedNotifications.count,
      markedNoShow: markedNoShow.count,
    });

    return NextResponse.json({
      success: true,
      archivedQueues: archivedQueues.count,
      deletedNotifications: deletedNotifications.count,
      markedNoShow: markedNoShow.count,
    });
  } catch (error) {
    console.error('Error in daily cleanup:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
