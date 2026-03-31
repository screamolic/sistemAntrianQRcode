'use server';

import { WhatsAppService } from '@/lib/services/whatsapp-service';
import { createRateLimitedNotification } from '@/lib/rate-limiter';
import { db } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { NotificationType } from '@prisma/client';

/**
 * Send test notification (admin only)
 */
export async function sendTestNotification(phone: string, queueId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Rate limit check
  const rateLimit = createRateLimitedNotification(phone);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.reason };
  }

  const result = await WhatsAppService.sendNotification({
    queueId,
    type: NotificationType.QUEUE_UPDATE,
    phone,
    message: '🧪 Test notification from Queue Automation',
  });

  if (result.success) {
    revalidatePath(`/admin/queue/${queueId}`);
  }

  return result;
}

/**
 * Trigger "next in queue" notification
 * Called when admin clicks "Call Next"
 */
export async function triggerNextNotification(entryId: string, queueId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Get entry details
    const entry = await db.queueEntry.findUnique({
      where: { id: entryId },
      include: {
        queue: {
          include: {
            admin: true,
          },
        },
      },
    });

    if (!entry) {
      return { success: false, error: 'Entry not found' };
    }

    // Rate limit check
    const rateLimit = createRateLimitedNotification(entry.phoneNumber);
    if (!rateLimit.allowed) {
      // Log but don't fail - admin should still be able to call next
      console.warn('Rate limit exceeded for notification:', entry.phoneNumber);
      return { success: true, skipped: true, reason: rateLimit.reason };
    }

    // Send notification
    const result = await WhatsAppService.sendNextNotification(
      entry.queue.name,
      entry.phoneNumber,
      queueId,
      entryId
    );

    revalidatePath(`/admin/queue/${queueId}`);

    return result;
  } catch (error) {
    console.error('Error triggering notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

/**
 * Get notification history for a queue
 */
export async function getQueueNotifications(queueId: string) {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return db.notification.findMany({
    where: { queueId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      queue: {
        select: { name: true },
      },
    },
  });
}

/**
 * Retry all failed notifications
 */
export async function retryFailedNotificationsAction(queueId?: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const where = queueId ? { queueId } : undefined;
  const failedNotifications = await db.notification.findMany({
    where: {
      ...where,
      status: 'FAILED',
      attempts: { lt: 3 },
    },
    take: 10,
  });

  const results = await Promise.all(
    failedNotifications.map((notification) =>
      WhatsAppService.sendNotification({
        queueId: notification.queueId,
        entryId: notification.entryId || undefined,
        userId: notification.userId || undefined,
        type: notification.type as NotificationType,
        phone: notification.phone,
        message: notification.message,
      })
    )
  );

  const successCount = results.filter((r) => r.success).length;

  revalidatePath('/dashboard');

  return {
    success: true,
    retried: failedNotifications.length,
    succeeded: successCount,
  };
}
