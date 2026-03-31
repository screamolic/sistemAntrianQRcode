import { db } from '@/lib/prisma';
import { EntryStatus } from '@prisma/client';

export class QueueService {
  /**
   * Join queue with atomic position calculation
   */
  static async joinQueue(data: {
    queueId: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    return db.$transaction(async (tx: any) => {
      // Verify queue exists and not expired
      const queue = await tx.queue.findUnique({
        where: { id: data.queueId },
      });

      if (!queue) {
        throw new Error('Queue not found');
      }

      if (queue.expiresAt && queue.expiresAt < new Date()) {
        throw new Error('Queue has expired');
      }

      // Check for duplicate
      const existing = await tx.queueEntry.findFirst({
        where: {
          phoneNumber: data.phone,
          queueId: data.queueId,
          status: EntryStatus.WAITING,
        },
      });

      if (existing) {
        throw new Error('Already in queue');
      }

      // Calculate position atomically
      const count = await tx.queueEntry.count({
        where: {
          queueId: data.queueId,
          status: EntryStatus.WAITING,
        },
      });

      const position = count + 1;

      // Create entry
      return tx.queueEntry.create({
        data: {
          queueId: data.queueId,
          phoneNumber: data.phone,
          name: `${data.firstName} ${data.lastName}`.trim(),
          position,
          status: EntryStatus.WAITING,
        },
      });
    });
  }

  /**
   * Call next person in queue
   */
  static async callNext(queueId: string) {
    return db.$transaction(async (tx: any) => {
      // Get first waiting entry
      const nextEntry = await tx.queueEntry.findFirst({
        where: {
          queueId,
          status: EntryStatus.WAITING,
        },
        orderBy: [
          { position: 'asc' },
          { createdAt: 'asc' },
        ],
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
   * Remove entry from queue (admin action)
   */
  static async removeEntry(entryId: string) {
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

  /**
   * Get waiting entries in FIFO order
   */
  static async getWaitingEntries(queueId: string) {
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
   * Get entry position
   */
  static async getEntryPosition(entryId: string) {
    const entry = await db.queueEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.status !== EntryStatus.WAITING) {
      return null;
    }

    return entry.position;
  }
}
