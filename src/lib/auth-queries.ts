import { db } from './db'
import { users } from '@/lib/db/schema/users'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

export async function getUserByEmail(email: string) {
  const results = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return results[0] || null
}

export async function getUserById(id: string) {
  const results = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return results[0] || null
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  const id = createId()

  const results = await db
    .insert(users)
    .values({
      id,
      email,
      passwordHash: hashedPassword,
      name,
      role: 'ADMIN',
    })
    .returning()

  return results[0]
}

export async function createQueue(adminId: string, name: string) {
  // This would need queues table import - keeping placeholder
  throw new Error('Not implemented - use queue-service.ts instead')
}

export async function getQueueById(id: string) {
  throw new Error('Not implemented - use queue-service.ts instead')
}

export async function getQueuesByAdminId(adminId: string) {
  throw new Error('Not implemented - use queue-service.ts instead')
}

export async function createQueueEntry(queueId: string, phoneNumber: string, name?: string) {
  throw new Error('Not implemented - use queue-entries.ts instead')
}

export async function getQueueEntryById(id: string) {
  throw new Error('Not implemented - use queue-entries.ts instead')
}

export async function updateQueueEntryStatus(id: string, status: 'WAITING' | 'SERVED' | 'NO_SHOW') {
  throw new Error('Not implemented - use queue-entries.ts instead')
}
