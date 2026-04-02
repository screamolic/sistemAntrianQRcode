import { db } from '@/lib/db'
import { queueEntries, queues, entryStatusEnum } from '@/lib/db/schema'
import { and, count, eq, sql } from 'drizzle-orm'

export class QueueStats {
  /**
   * Get queue statistics
   */
  static async getStats(queueId: string) {
    const [waitingCount, servedCount, totalEntries] = await Promise.all([
      db
        .select({ count: count() })
        .from(queueEntries)
        .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING'))),
      db
        .select({ count: count() })
        .from(queueEntries)
        .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'SERVED'))),
      db.select({ count: count() }).from(queueEntries).where(eq(queueEntries.queueId, queueId)),
    ])

    return {
      waiting: Number(waitingCount[0]?.count || 0),
      served: Number(servedCount[0]?.count || 0),
      total: Number(totalEntries[0]?.count || 0),
    }
  }

  /**
   * Get average wait time
   */
  static async getAverageWaitTime(queueId: string) {
    const result = await db
      .select({
        avgWait: sql<number>`AVG(EXTRACT(EPOCH FROM (served_at - created_at)))`,
      })
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'SERVED')))

    return Number(result[0]?.avgWait || 0)
  }
}
