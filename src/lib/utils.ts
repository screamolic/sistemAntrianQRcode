import { createId } from '@paralleldrive/cuid2';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique, URL-safe queue ID using cuid2
 */
export function generateQueueId(): string {
  return createId();
}

/**
 * Format the full URL for a queue
 */
export function formatQueueUrl(queueId: string): string {
  const domain =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${domain}/queue/${queueId}`;
}

/**
 * Check if a queue has expired based on expiresAt timestamp
 */
export function isQueueExpired(expiresAt: Date): boolean {
  return expiresAt <= new Date();
}

/**
 * Calculate relative time string (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}
