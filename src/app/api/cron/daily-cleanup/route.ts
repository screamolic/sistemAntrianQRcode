import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { queueEntries } from '@/lib/db/schema'
import { and, eq, sql } from 'drizzle-orm'

/**
 * POST /api/cron/daily-cleanup
 * Daily maintenance: clean expired queues, old notifications
 */
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // 1. Mark stale queue entries as NO_SHOW (waiting > 24 hours)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    await db
      .update(queueEntries)
      .set({
        status: 'NO_SHOW',
      })
      .where(
        and(
          eq(queueEntries.status, 'WAITING'),
          sql`${queueEntries.createdAt} < ${twentyFourHoursAgo}`
        )
      )

    console.log('Daily cleanup completed')

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
    })
  } catch (error) {
    console.error('Error in daily cleanup:', error)
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 })
  }
}
