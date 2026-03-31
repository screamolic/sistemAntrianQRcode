/**
 * WhatsApp Notification Service
 * Handles sending WhatsApp messages via Evolution-API
 */

import { evolution } from '@/lib/evolution/connection';
import { db } from '@/lib/prisma';
import { NotificationType, NotificationStatus } from '@prisma/client';

interface SendNotificationParams {
  queueId: string;
  entryId?: string;
  userId?: string;
  type: NotificationType;
  phone: string;
  message: string;
}

export class WhatsAppService {
  /**
   * Send WhatsApp message with retry logic and database tracking
   */
  static async sendNotification(params: SendNotificationParams) {
    // Create notification record
    const notification = await db.notification.create({
      data: {
        queueId: params.queueId,
        entryId: params.entryId,
        userId: params.userId,
        type: params.type,
        phone: params.phone,
        message: params.message,
        status: NotificationStatus.PENDING,
      },
    });

    try {
      // Format phone number (remove +, spaces, dashes)
      const formattedPhone = params.phone.replace(/[\s\-\+]/g, '');

      // Send message via Evolution-API
      await evolution.sendMessage(formattedPhone, params.message);

      // Mark as sent
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      return { success: true, notificationId: notification.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error('Failed to send WhatsApp notification:', errorMessage);

      // Mark as failed
      await db.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          attempts: { increment: 1 },
          errorMessage,
        },
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send welcome message when joining queue
   */
  static async sendWelcomeMessage(
    queueName: string,
    position: number,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message =
      `🎫 You joined queue at *${queueName}*!\n\n` +
      `Your position: #${position}\n` +
      `Total waiting: Please check the queue display\n\n` +
      `Please wait for your turn. You'll be notified when you're next.`;

    return this.sendNotification({
      queueId,
      entryId,
      type: NotificationType.QUEUE_WELCOME,
      phone,
      message,
    });
  }

  /**
   * Send "you're next" notification
   * Triggered when user reaches position 3 or admin calls next
   */
  static async sendNextNotification(
    queueName: string,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message =
      `🔔 *Be ready! You are next in queue at ${queueName}*\n\n` +
      `Please proceed to the counter now.`;

    return this.sendNotification({
      queueId,
      entryId,
      type: NotificationType.QUEUE_NEXT,
      phone,
      message,
    });
  }

  /**
   * Send position update notification
   */
  static async sendUpdateMessage(
    queueName: string,
    newPosition: number,
    phone: string,
    queueId: string,
    entryId: string
  ) {
    const message =
      `📊 Queue update at *${queueName}*\n\n` +
      `Your position is now: #${newPosition}\n` +
      `Estimated wait: ${newPosition * 3} minutes`;

    return this.sendNotification({
      queueId,
      entryId,
      type: NotificationType.QUEUE_UPDATE,
      phone,
      message,
    });
  }

  /**
   * Retry failed notifications
   * @param maxAttempts - Maximum retry attempts (default: 3)
   */
  static async retryFailedNotifications(maxAttempts = 3) {
    const failedNotifications = await db.notification.findMany({
      where: {
        status: NotificationStatus.FAILED,
        attempts: { lt: maxAttempts },
      },
      take: 10, // Process 10 at a time
    });

    const results = await Promise.all(
      failedNotifications.map((notification) =>
        this.sendNotification({
          queueId: notification.queueId,
          entryId: notification.entryId || undefined,
          userId: notification.userId || undefined,
          type: notification.type as NotificationType,
          phone: notification.phone,
          message: notification.message,
        })
      )
    );

    return results;
  }

  /**
   * Get notification stats for a queue
   */
  static async getNotificationStats(queueId: string) {
    const [pending, sent, failed, total] = await Promise.all([
      db.notification.count({
        where: { queueId, status: NotificationStatus.PENDING },
      }),
      db.notification.count({
        where: { queueId, status: NotificationStatus.SENT },
      }),
      db.notification.count({
        where: { queueId, status: NotificationStatus.FAILED },
      }),
      db.notification.count({
        where: { queueId },
      }),
    ]);

    return {
      pending,
      sent,
      failed,
      total,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
    };
  }
}
