import { db } from './db'
import { users } from '@/lib/db/schema/users'
import { queues, counters, queueEntries } from '@/lib/db/schema'
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

export async function getQueuesByAdminId(adminId: string) {
  // Get queues with their counters and entries
  const result = await db
    .select({
      id: queues.id,
      name: queues.name,
      description: queues.description,
      status: queues.status,
      counterId: counters.id,
      counterName: counters.name,
      entryId: queueEntries.id,
      entryPhone: queueEntries.customerPhone,
      entryPosition: queueEntries.position,
      entryStatus: queueEntries.status,
    })
    .from(queues)
    .leftJoin(counters, eq(queues.counterId, counters.id))
    .leftJoin(queueEntries, eq(queues.id, queueEntries.queueId))
    .where(eq(queues.adminId, adminId))

  // Group entries by queue
  const queueMap = new Map()
  result.forEach((row) => {
    if (!queueMap.has(row.id)) {
      queueMap.set(row.id, {
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        counterId: row.counterId,
        counterName: row.counterName,
        entries: [],
      })
    }
    
    if (row.entryId) {
      queueMap.get(row.id).entries.push({
        id: row.entryId,
        phone: row.entryPhone,
        position: row.entryPosition,
        status: row.entryStatus,
      })
    }
  })

  return Array.from(queueMap.values())
}
