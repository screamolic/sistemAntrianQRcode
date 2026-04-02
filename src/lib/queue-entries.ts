import { db } from './prisma'
import { EntryStatus } from '@prisma/client'
import { broadcastQueueUpdate } from '@/app/api/sse/queue-updates/route'

/**
 * Get all waiting queue entries for a specific queue
 */
export async function getQueueEntries(queueId: string) {
  return db.queueEntry.findMany({
    where: {
      queueId,
      status: EntryStatus.WAITING,
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })
}

/**
 * Get queue entries with total count
 */
export async function getQueueEntriesWithCount(queueId: string) {
  const [entries, count] = await Promise.all([
    getQueueEntries(queueId),
    db.queueEntry.count({
      where: { queueId, status: EntryStatus.WAITING },
    }),
  ])

  return { entries, count }
}

/**
 * Call next entry in queue (mark as served)
 */
export async function callNextEntry(queueId: string) {
  const result = await db.$transaction(async (tx) => {
    // Get first waiting entry
    const nextEntry = await tx.queueEntry.findFirst({
      where: { queueId, status: EntryStatus.WAITING },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    })

    if (!nextEntry) {
      throw new Error('No waiting entries')
    }

    // Mark as served
    await tx.queueEntry.update({
      where: { id: nextEntry.id },
      data: {
        status: EntryStatus.SERVED,
        servedAt: new Date(),
      },
    })

    // Decrement positions of remaining entries
    await tx.queueEntry.updateMany({
      where: {
        queueId,
        position: { gt: nextEntry.position },
        status: EntryStatus.WAITING,
      },
      data: {
        position: { decrement: 1 },
      },
    })

    return nextEntry
  })

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_SERVED',
    entry: result,
  })

  return result
}

/**
 * Remove an entry from queue
 */
export async function removeQueueEntry(entryId: string) {
  const result = await db.$transaction(async (tx) => {
    const entry = await tx.queueEntry.findUnique({
      where: { id: entryId },
    })

    if (!entry) {
      throw new Error('Entry not found')
    }

    const queueId = entry.queueId

    // Delete the entry
    await tx.queueEntry.delete({
      where: { id: entryId },
    })

    // Decrement positions of entries after this one
    await tx.queueEntry.updateMany({
      where: {
        queueId,
        position: { gt: entry.position },
        status: EntryStatus.WAITING,
      },
      data: {
        position: { decrement: 1 },
      },
    })

    return { entry, queueId }
  })

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(result.queueId, {
    type: 'ENTRY_REMOVED',
    entry: result.entry,
  })

  return result.entry
}

/**
 * Add new entry to queue
 */
export async function addQueueEntry(queueId: string, customerPhone: string) {
  const result = await db.$transaction(async (tx) => {
    // Get current max position
    const lastEntry = await tx.queueEntry.findFirst({
      where: { queueId, status: EntryStatus.WAITING },
      orderBy: { position: 'desc' },
    })

    const newPosition = (lastEntry?.position || 0) + 1

    // Create new entry
    const newEntry = await tx.queueEntry.create({
      data: {
        queueId,
        customerPhone,
        position: newPosition,
        status: EntryStatus.WAITING,
      },
    })

    return newEntry
  })

  // Broadcast real-time update to all connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_ADDED',
    entry: result,
  })

  return result
}
