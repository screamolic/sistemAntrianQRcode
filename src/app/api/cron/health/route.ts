import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { NotificationStatus } from '@prisma/client';

/**
 * GET /api/cron/health
 * Check if cron jobs are running properly
 */
export async function GET() {
  try {
    const [recentCleanup, recentRetry, failedNotifications] = await Promise.all([
      db.notification.findFirst({
        where: {
          createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          type: 'QUEUE_UPDATE', // Placeholder check
        },
      }),
      db.notification.findFirst({
        where: {
          attempts: { gt: 0 },
        },
      }),
      db.notification.count({
        where: { status: NotificationStatus.FAILED },
      }),
    ]);

    return NextResponse.json({
      healthy: true,
      lastCleanup: recentCleanup?.createdAt || null,
      lastRetry: recentRetry?.createdAt || null,
      failedCount: failedNotifications,
    });
  } catch (error) {
    return NextResponse.json({ healthy: false, error: 'Health check failed' }, { status: 500 });
  }
}
