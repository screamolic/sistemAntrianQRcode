'use client';

import { useEffect, useRef } from 'react';
import { useQueueEntries } from './use-queue';

interface UsePositionTrackerProps {
  queueId: string;
  phone?: string;
  entryId?: string;
  onPositionThree?: () => void;
}

/**
 * Track position changes and trigger notifications at position 3
 */
export function usePositionTracker({
  queueId,
  phone,
  entryId,
  onPositionThree,
}: UsePositionTrackerProps) {
  const { data: entries } = useQueueEntries(queueId);
  const previousPosition = useRef<number | null>(null);

  useEffect(() => {
    if (!phone || !entryId || !entries) return;

    // Find user's entry
    const userEntry = entries.find((e) => e.id === entryId);
    if (!userEntry) return;

    const currentPosition = userEntry.position;

    // Check if position changed
    if (previousPosition.current !== null && previousPosition.current !== currentPosition) {
      // Trigger notification at position 3
      if (currentPosition === 3) {
        onPositionThree?.();
      }
    }

    previousPosition.current = currentPosition;
  }, [entries, phone, entryId, onPositionThree]);
}
