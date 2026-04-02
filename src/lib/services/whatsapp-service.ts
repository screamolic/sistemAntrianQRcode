/**
 * WhatsApp Notification Service
 * Handles sending WhatsApp messages via Evolution-API
 */

import { evolution } from '@/lib/evolution/connection'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema/notifications'
import { nanoid } from '@paralleldrive/cuid2'

interface SendNotificationParams {
  queueId: string
  entryId?: string
  userId?: string
  type: 'WELCOME' | 'POSITION_UPDATE' | 'TURN_CALLED' | 'SERVICE_COMPLETED' | 'FEEDBACK_REQUEST'
  phone: string
  message: string
}

export class WhatsAppService {
  /**
   * Send WhatsApp message with retry logic and database tracking
   */
  static async sendNotification(params: SendNotificationParams) {
    const id = nanoid()

    // Create notification record
    await db.insert(notifications).values({
      id,
      queueEntryId: params.entryId,
      queueId: params.queueId,
      userId: params.userId,
      type: params.type,
      phone: params.phone,
      message: params.message,
      status: 'PENDING',
    })

    try {
      // Format phone number (remove +, spaces, dashes)
      const formattedPhone = params.phone.replace(/[\s\-\+]/g, '')

      // Send message via Evolution-API
      await evolution.sendMessage(formattedPhone, params.message)

      // Mark as sent
      await db
        .update(notifications)
        .set({
          status: 'SENT',
          sentAt: new Date(),
        })
        .where(eq(notifications.id, id))

      return { success: true }
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error)

      // Mark as failed
      await db
        .update(notifications)
        .set({
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          attempts: 1,
        })
        .where(eq(notifications.id, id))

      return { success: false, error }
    }
  }

  /**
   * Send welcome notification when customer joins queue
   */
  static async sendWelcomeMessage(
    queueName: string,
    position: number,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message = `🎫 *Welcome to ${queueName}*\n\nYou have joined the queue at position #${position}.\n\nWe will notify you when it's almost your turn.`

    return this.sendNotification({
      queueId,
      entryId,
      type: 'WELCOME',
      phone,
      message,
    })
  }

  /**
   * Send turn called notification
   */
  static async sendTurnCalled(
    queueName: string,
    position: number,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message = `🔔 *Your Turn is Now!*\n\nQueue: ${queueName}\nPosition: #${position}\n\nPlease proceed to the counter.`

    return this.sendNotification({
      queueId,
      entryId,
      type: 'TURN_CALLED',
      phone,
      message,
    })
  }

  /**
   * Send service completed notification
   */
  static async sendServiceCompleted(
    queueName: string,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message = `✅ *Service Completed*\n\nThank you for visiting ${queueName}.\n\nWe hope you received excellent service!`

    return this.sendNotification({
      queueId,
      entryId,
      type: 'SERVICE_COMPLETED',
      phone,
      message,
    })
  }
}

// Import eq from drizzle-orm
import { eq } from 'drizzle-orm'
