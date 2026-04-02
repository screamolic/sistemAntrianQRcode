import { db } from '@/lib/db'
import { queueEntries, queues } from '@/lib/db/schema'
import { and, eq, gt, asc, sql } from 'drizzle-orm'

export class QueueService {
  /**
   * Join queue with atomic position calculation
   */
  static async joinQueue(data: {
    queueId: string
    firstName: string
    lastName: string
    phone: string
  }) {
    // Get queue
    const [queue] = await db.select().from(queues).where(eq(queues.id, data.queueId)).limit(1)

    if (!queue) {
      throw new Error('Queue not found')
    }

    if (queue.expiresAt && queue.expiresAt < new Date()) {
      throw new Error('Queue has expired')
    }

    // Check for duplicate
    const [existing] = await db
      .select()
      .from(queueEntries)
      .where(
        and(
          eq(queueEntries.queueId, data.queueId),
          eq(queueEntries.customerPhone, data.phone),
          eq(queueEntries.status, 'WAITING')
        )
      )
      .limit(1)

    if (existing) {
      throw new Error('Already in queue')
    }

    // Calculate position
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, data.queueId), eq(queueEntries.status, 'WAITING')))

    const position = (countResult?.count || 0) + 1

    // Create entry
    const [entry] = await db
      .insert(queueEntries)
      .values({
        queueId: data.queueId,
        customerPhone: data.phone,
        position,
        status: 'WAITING',
      })
      .returning()

    return entry
  }

  /**
   * Call next person in queue
   */
  static async callNext(queueId: string) {
    // Get first waiting entry
    const [nextEntry] = await db
      .select()
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))
      .orderBy(asc(queueEntries.position), asc(queueEntries.createdAt))
      .limit(1)

    if (!nextEntry) {
      throw new Error('No waiting entries')
    }

    // Mark as served
    const [updatedEntry] = await db
      .update(queueEntries)
      .set({
        status: 'SERVED',
        servedAt: new Date(),
      })
      .where(eq(queueEntries.id, nextEntry.id))
      .returning()

    // Decrement positions of remaining entries
    await db
      .update(queueEntries)
      .set({
        position: sql`${queueEntries.position} - 1`,
      })
      .where(
        and(
          eq(queueEntries.queueId, queueId),
          gt(queueEntries.position, nextEntry.position),
          eq(queueEntries.status, 'WAITING')
        )
      )

    return updatedEntry
  }

  /**
   * Remove entry from queue (admin action)
   */
  static async removeEntry(entryId: string) {
    // Get the entry
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1)

    if (!entry) {
      throw new Error('Entry not found')
    }

    const queueId = entry.queueId
    const position = entry.position

    // Delete the entry
    await db.delete(queueEntries).where(eq(queueEntries.id, entryId))

    // Decrement positions of entries after this one
    await db
      .update(queueEntries)
      .set({
        position: sql`${queueEntries.position} - 1`,
      })
      .where(
        and(
          eq(queueEntries.queueId, queueId),
          gt(queueEntries.position, position),
          eq(queueEntries.status, 'WAITING')
        )
      )

    return entry
  }

  /**
   * Get waiting entries in FIFO order
   */
  static async getWaitingEntries(queueId: string) {
    return db
      .select()
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))
      .orderBy(asc(queueEntries.position), asc(queueEntries.createdAt))
  }

  /**
   * Get entry position
   */
  static async getEntryPosition(entryId: string) {
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1)

    if (!entry || entry.status !== 'WAITING') {
      return null
    }

    return entry.position
  }
}
