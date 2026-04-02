'use server'

import { db } from '@/lib/db'
import { queueEntries, queues } from '@/lib/db/schema'
import { joinQueueSchema } from '@/lib/schemas/queue'
import { revalidatePath } from 'next/cache'
import { and, eq, sql } from 'drizzle-orm'
import { WhatsAppService } from '@/lib/services/whatsapp-service'

export async function joinQueueAction(formData: FormData) {
  const rawData = {
    phone: formData.get('phone'),
    queueId: formData.get('queueId'),
  }

  // Validate input
  const validation = joinQueueSchema.safeParse(rawData)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.format()._errors[0] || 'Validation failed',
    }
  }

  const { phone, queueId } = validation.data

  try {
    // Check if queue exists and not expired
    const [queue] = await db.select().from(queues).where(eq(queues.id, queueId)).limit(1)

    if (!queue) {
      return { success: false, error: 'Queue not found' }
    }

    if (queue.expiresAt && queue.expiresAt < new Date()) {
      return { success: false, error: 'Queue has expired' }
    }

    // Check for duplicate (same phone in same queue)
    const [existing] = await db
      .select()
      .from(queueEntries)
      .where(
        and(
          eq(queueEntries.queueId, queueId),
          eq(queueEntries.customerPhone, phone),
          eq(queueEntries.status, 'WAITING')
        )
      )
      .limit(1)

    if (existing) {
      return {
        success: false,
        error: 'You are already in this queue',
        entryId: existing.id,
      }
    }

    // Calculate position (COUNT + 1)
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(queueEntries)
      .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))

    const position = (countResult?.count || 0) + 1

    // Create queue entry
    const [entry] = await db
      .insert(queueEntries)
      .values({
        queueId,
        customerPhone: phone,
        position,
        status: 'WAITING',
      })
      .returning()

    // Send welcome notification (non-blocking, don't fail join if notification fails)
    WhatsAppService.sendWelcomeMessage(queue.name, position, phone, queueId, entry.id).catch(
      (error) => console.error('Failed to send welcome notification:', error)
    )

    revalidatePath(`/queue/${queueId}`)

    return {
      success: true,
      entryId: entry.id,
      position: entry.position,
    }
  } catch (error) {
    console.error('Error joining queue:', error)
    return { success: false, error: 'Failed to join queue' }
  }
}
