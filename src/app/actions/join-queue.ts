'use server';

import { db } from '@/lib/prisma';
import { joinQueueSchema } from '@/lib/schemas/queue';
import { revalidatePath } from 'next/cache';
import { WhatsAppService } from '@/lib/services/whatsapp-service';

export async function joinQueueAction(formData: FormData) {
  const rawData = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    phone: formData.get('phone'),
    queueId: formData.get('queueId'),
  };

  // Validate input
  const validation = joinQueueSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.format()._errors[0] || 'Validation failed',
    };
  }

  const { firstName, lastName, phone, queueId } = validation.data;

  try {
    // Check if queue exists and not expired
    const queue = await db.queue.findUnique({
      where: { id: queueId },
    });

    if (!queue) {
      return { success: false, error: 'Queue not found' };
    }

    if (queue.expiresAt && queue.expiresAt < new Date()) {
      return { success: false, error: 'Queue has expired' };
    }

    // Check for duplicate (same phone in same queue)
    const existing = await db.queueEntry.findFirst({
      where: {
        phoneNumber: phone,
        queueId,
        status: 'WAITING',
      },
    });

    if (existing) {
      return {
        success: false,
        error: 'You are already in this queue',
        entryId: existing.id,
      };
    }

    // Calculate position (COUNT + 1)
    const count = await db.queueEntry.count({
      where: { queueId, status: 'WAITING' },
    });

    const position = count + 1;

    // Create queue entry
    const entry = await db.queueEntry.create({
      data: {
        queueId,
        phoneNumber: phone,
        name: `${firstName} ${lastName}`.trim(),
        position,
        status: 'WAITING',
      },
    });

    // Send welcome notification (non-blocking, don't fail join if notification fails)
    WhatsAppService.sendWelcomeMessage(
      queue.name,
      position,
      phone,
      queueId,
      entry.id
    ).catch((error) => console.error('Failed to send welcome notification:', error));

    revalidatePath(`/queue/${queueId}`);

    return {
      success: true,
      entryId: entry.id,
      position: entry.position,
    };
  } catch (error) {
    console.error('Error joining queue:', error);
    return { success: false, error: 'Failed to join queue' };
  }
}
