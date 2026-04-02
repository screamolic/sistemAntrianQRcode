import { db } from './db'
import { queueEntries, queues, entryStatusEnum } from '@/lib/db/schema'
import { eq, and, gt, asc, desc, sql } from 'drizzle-orm'
import { broadcastQueueUpdate } from '@/app/api/sse/queue-updates/route'

/**
 * Get all waiting queue entries for a specific queue
 */
export async function getQueueEntries(queueId: string) {
  return db
    .select()
    .from(queueEntries)
    .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))
    .orderBy(asc(queueEntries.position), asc(queueEntries.createdAt))
}

/**
 * Get queue entries with total count
 */
export async function getQueueEntriesWithCount(queueId: string) {
  const [entries, countResult] = await Promise.all([
    getQueueEntries(queueId),
    db
      .select({ count: sql<number>`count(*)` })
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING'))),
  ])

  return { entries, count: Number(countResult[0]?.count || 0) }
}

/**
 * Call next entry in queue (mark as served)
 */
export async function callNextEntry(queueId: string) {
  // Get first waiting entry
  const nextEntryResults = await db
    .select()
    .from(queueEntries)
    .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))
    .orderBy(asc(queueEntries.position), asc(queueEntries.createdAt))
    .limit(1)

  const nextEntry = nextEntryResults[0]

  if (!nextEntry) {
    throw new Error('No waiting entries')
  }

  // Update entry to served
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

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_SERVED',
    entry: updatedEntry,
  })

  return updatedEntry
}

/**
 * Remove an entry from queue
 */
export async function removeQueueEntry(entryId: string) {
  // Get the entry
  const entryResults = await db
    .select()
    .from(queueEntries)
    .where(eq(queueEntries.id, entryId))
    .limit(1)

  const entry = entryResults[0]

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

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_REMOVED',
    entry,
  })

  return entry
}

/**
 * Add new entry to queue
 */
export async function addQueueEntry(queueId: string, customerPhone: string) {
  // Get current max position
  const lastEntryResults = await db
    .select()
    .from(queueEntries)
    .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))
    .orderBy(desc(queueEntries.position))
    .limit(1)

  const newPosition = (lastEntryResults[0]?.position || 0) + 1

  // Create new entry
  const [newEntry] = await db
    .insert(queueEntries)
    .values({
      queueId,
      customerPhone,
      position: newPosition,
      status: 'WAITING',
    })
    .returning()

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_ADDED',
    entry: newEntry,
  })

  return newEntry
}
