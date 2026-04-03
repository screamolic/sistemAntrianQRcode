/**
 * Queue utility functions using Drizzle ORM
 * Replaces legacy Prisma-based queue.ts
 */

import { db } from './db'
import { queues } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * Create a new queue with automatic expiration (24 hours from creation)
 */
export async function createQueue(adminId: string, counterId: string, name?: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const results = await db
    .insert(queues)
    .values({
      adminId,
      counterId,
      name: name || `Antrian-${Date.now().toString(36).toUpperCase()}`,
      expiresAt,
      status: 'ACTIVE',
    })
    .returning()

  return results[0]
}

/**
 * Get a queue by ID
 */
export async function getQueue(queueId: string) {
  const results = await db.select().from(queues).where(eq(queues.id, queueId)).limit(1)

  return results[0] ?? null
}

/**
 * Check if a queue exists and is not expired
 */
export async function isQueueExpired(queueId: string): Promise<boolean> {
  const queue = await getQueue(queueId)
  if (!queue) return true
  return queue.expiresAt ? queue.expiresAt < new Date() : false
}

/**
 * Get all queues for an admin (ordered by newest first)
 */
export async function getAdminQueues(adminId: string) {
  return db.select().from(queues).where(eq(queues.adminId, adminId))
}

/**
 * Delete a queue (verifies admin ownership)
 */
export async function deleteQueue(queueId: string, adminId: string) {
  return db.delete(queues).where(and(eq(queues.id, queueId), eq(queues.adminId, adminId)))
}
