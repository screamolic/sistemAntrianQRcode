import { db } from './prisma';
import { EntryStatus } from '@prisma/client';

/**
 * Get all waiting queue entries for a specific queue
 */
export async function getQueueEntries(queueId: string) {
  return db.queueEntry.findMany({
    where: { 
      queueId,
      status: EntryStatus.WAITING,
    },
    orderBy: [
      { position: 'asc' },
      { createdAt: 'asc' },
    ],
  });
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
  ]);

  return { entries, count };
}

/**
 * Call next entry in queue (mark as served)
 */
export async function callNextEntry(queueId: string) {
  return db.$transaction(async (tx: any) => {
    // Get first waiting entry
    const nextEntry = await tx.queueEntry.findFirst({
      where: { queueId, status: EntryStatus.WAITING },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });

    if (!nextEntry) {
      throw new Error('No waiting entries');
    }

    // Mark as served
    await tx.queueEntry.update({
      where: { id: nextEntry.id },
      data: { 
        status: EntryStatus.SERVED,
        servedAt: new Date(),
      },
    });

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
    });

    return nextEntry;
  });
}

/**
 * Remove an entry from queue
 */
export async function removeQueueEntry(entryId: string) {
  return db.$transaction(async (tx: any) => {
    const entry = await tx.queueEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Delete the entry
    await tx.queueEntry.delete({
      where: { id: entryId },
    });

    // Decrement positions of entries after this one
    await tx.queueEntry.updateMany({
      where: {
        queueId: entry.queueId,
        position: { gt: entry.position },
        status: EntryStatus.WAITING,
      },
      data: {
        position: { decrement: 1 },
      },
    });

    return entry;
  });
}
