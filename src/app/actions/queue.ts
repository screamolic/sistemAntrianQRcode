'use server';

import { auth } from '@/lib/auth';
import { createQueue, deleteQueue, getAdminQueues } from '@/lib/queue';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Create a new queue action
 */
export async function createQueueAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }

  const name = formData.get('name') as string || undefined;

  try {
    const queue = await createQueue(session.user.id, name);
    revalidatePath('/dashboard');
    return {
      success: true,
      queueId: queue.id,
    };
  } catch (error) {
    console.error('Error creating queue:', error);
    return {
      success: false,
      error: 'Failed to create queue',
    };
  }
}

/**
 * Delete a queue action
 */
export async function deleteQueueAction(queueId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'Unauthorized',
    };
  }

  try {
    await deleteQueue(queueId, session.user.id);
    revalidatePath('/dashboard');
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting queue:', error);
    return {
      success: false,
      error: 'Failed to delete queue',
    };
  }
}

/**
 * Get admin queues action (for client components)
 */
export async function getAdminQueuesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return getAdminQueues(session.user.id);
}
