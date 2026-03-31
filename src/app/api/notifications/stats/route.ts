import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NotificationStatus } from '@prisma/client';

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    const [pending, sent, failed, total] = await Promise.all([
      db.notification.count({
        where: { queueId, status: NotificationStatus.PENDING },
      }),
      db.notification.count({
        where: { queueId, status: NotificationStatus.SENT },
      }),
      db.notification.count({
        where: { queueId, status: NotificationStatus.FAILED },
      }),
      db.notification.count({
        where: { queueId },
      }),
    ]);

    return NextResponse.json({
      pending,
      sent,
      failed,
      total,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
