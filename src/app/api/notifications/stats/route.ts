import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
export async function GET() {
  try {
    const [totalResult, sentResult, failedResult] = await Promise.all([
      db.select({ count: count() }).from(notifications),
      db.select({ count: count() }).from(notifications).where(eq(notifications.status, 'SENT')),
      db.select({ count: count() }).from(notifications).where(eq(notifications.status, 'FAILED')),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total: Number(totalResult[0]?.count || 0),
        sent: Number(sentResult[0]?.count || 0),
        failed: Number(failedResult[0]?.count || 0),
      },
    })
  } catch (error) {
    console.error('Error getting stats:', error)
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 })
  }
}
