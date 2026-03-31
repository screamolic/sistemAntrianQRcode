import { db } from './prisma';
import { generateQueueId } from '@/lib/utils';

/**
 * Create a new queue with automatic expiration (24 hours from creation)
 */
export async function createQueue(adminId: string, name?: string) {
  const queueId = generateQueueId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return db.queue.create({
    data: {
      id: queueId,
      adminId,
      name: name || `Queue-${queueId.slice(0, 6)}`,
      expiresAt,
    },
  });
}

/**
 * Get a queue by ID with admin and entry count info
 */
export async function getQueue(queueId: string) {
  return db.queue.findUnique({
    where: { id: queueId },
    include: {
      admin: { select: { id: true, name: true, email: true } },
      _count: { select: { entries: true } },
    },
  });
}

/**
 * Check if a queue exists and is not expired
 */
export async function isQueueExpired(queueId: string): Promise<boolean> {
  const queue = await getQueue(queueId);
  if (!queue) return true;
  return queue.expiresAt ? queue.expiresAt < new Date() : false;
}

/**
 * Get all queues for an admin
 */
export async function getAdminQueues(adminId: string) {
  return db.queue.findMany({
    where: { adminId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { entries: true } },
    },
  });
}

/**
 * Delete a queue (admin only)
 */
export async function deleteQueue(queueId: string, adminId: string) {
  return db.queue.deleteMany({
    where: {
      id: queueId,
      adminId,
    },
  });
}
