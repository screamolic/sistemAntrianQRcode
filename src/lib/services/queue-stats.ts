import { db } from '@/lib/prisma';
import { EntryStatus } from '@prisma/client';

export async function getQueueStats(queueId: string) {
  const [waiting, served, noShow, total] = await Promise.all([
    db.queueEntry.count({
      where: { queueId, status: EntryStatus.WAITING },
    }),
    db.queueEntry.count({
      where: { queueId, status: EntryStatus.SERVED },
    }),
    db.queueEntry.count({
      where: { queueId, status: EntryStatus.NO_SHOW },
    }),
    db.queueEntry.count({
      where: { queueId },
    }),
  ]);

  // Calculate average wait time from served entries
  const servedEntries = await db.queueEntry.findMany({
    where: {
      queueId,
      status: EntryStatus.SERVED,
      servedAt: { not: null },
    },
    select: {
      createdAt: true,
      servedAt: true,
    },
  });

  const averageWaitTime =
    servedEntries.length > 0
      ? servedEntries.reduce((acc: number, entry: any) => {
          const waitTime = (entry.servedAt!.getTime() - entry.createdAt.getTime()) / 1000;
          return acc + waitTime;
        }, 0) / servedEntries.length
      : 0;

  return {
    waiting,
    served,
    noShow,
    total,
    averageWaitTime: Math.round(averageWaitTime), // in seconds
  };
}
