'use server'

import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { createRateLimitedNotification } from '@/lib/rate-limiter'
import { db } from '@/lib/db'
import { notifications, queueEntries } from '@/lib/db/schema'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { eq, and, lt, desc } from 'drizzle-orm'

/**
 * Send test notification (admin only)
 */
export async function sendTestNotification(phone: string, queueId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  // Rate limit check
  const rateLimit = createRateLimitedNotification(phone)
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.reason }
  }

  const result = await WhatsAppService.sendNotification({
    queueId,
    type: 'POSITION_UPDATE',
    phone,
    message: '🧪 Test notification from Queue Automation',
  })

  if (result.success) {
    revalidatePath(`/admin/queue/${queueId}`)
  }

  return result
}

/**
 * Trigger "next in queue" notification
 * Called when admin clicks "Call Next"
 */
export async function triggerNextNotification(entryId: string, queueId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // Get entry details
    const [entry] = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1)

    if (!entry) {
      return { success: false, error: 'Entry not found' }
    }

    // Rate limit check
    const rateLimit = createRateLimitedNotification(entry.customerPhone)
    if (!rateLimit.allowed) {
      console.warn('Rate limit exceeded for notification:', entry.customerPhone)
      return { success: true, skipped: true, reason: rateLimit.reason }
    }

    // Send notification
    const result = await WhatsAppService.sendTurnCalled(
      'Queue', // queue name - would need join in real app
      entry.customerPhone,
      queueId,
      entryId
    )

    revalidatePath(`/admin/queue/${queueId}`)

    return result
  } catch (error) {
    console.error('Error triggering notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

/**
 * Get notification history for a queue
 */
export async function getQueueNotifications(queueId: string) {
  const session = await auth()
  if (!session?.user) {
    return []
  }

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.queueId, queueId))
    .orderBy(desc(notifications.createdAt))
    .limit(50)
}

/**
 * Retry all failed notifications
 */
export async function retryFailedNotificationsAction(queueId?: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  const where = queueId ? eq(notifications.queueId, queueId) : undefined

  const failedNotifications = await db
    .select()
    .from(notifications)
    .where(where && and(where, eq(notifications.status, 'FAILED'), lt(notifications.attempts, 3)))
    .limit(10)

  const results = await Promise.all(
    failedNotifications.map((notification) =>
      WhatsAppService.sendNotification({
        queueId: notification.queueId,
        entryId: notification.queueEntryId || undefined,
        userId: notification.userId || undefined,
        type: notification.type,
        phone: notification.phone,
        message: notification.message,
      })
    )
  )

  const successCount = results.filter((r) => r.success).length

  revalidatePath('/dashboard')

  return {
    success: true,
    retried: failedNotifications.length,
    succeeded: successCount,
  }
}
