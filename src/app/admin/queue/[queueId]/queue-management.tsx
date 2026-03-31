'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { callNextEntry, getQueueEntries, removeQueueEntry } from '@/lib/queue-entries';
import { Users, CheckCircle, UserX } from 'lucide-react';
import { QueueEntryCard } from '@/components/queue/queue-entry-card';

interface QueueManagementProps {
  queue: {
    id: string;
    name: string;
    entries: Array<{
      id: string;
      name: string | null;
      phoneNumber: string;
      position: number;
    }>;
  };
}

export function QueueManagement({ queue: initialQueue }: QueueManagementProps) {
  const queryClient = useQueryClient();
  const [isCalling, setIsCalling] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch queue entries with polling
  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['queue-entries', initialQueue.id],
    queryFn: () => getQueueEntries(initialQueue.id),
    initialData: initialQueue.entries,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Call next entry mutation
  const callNextMutation = useMutation({
    mutationFn: () => callNextEntry(initialQueue.id),
    onMutate: () => setIsCalling(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-entries', initialQueue.id] });
    },
    onSettled: () => setIsCalling(false),
  });

  // Remove entry mutation
  const removeMutation = useMutation({
    mutationFn: (entryId: string) => removeQueueEntry(entryId),
    onMutate: (entryId) => setRemovingId(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-entries', initialQueue.id] });
    },
    onSettled: () => setRemovingId(null),
  });

  const handleCallNext = async () => {
    if (!entries || entries.length === 0) {
      alert('No one is in queue');
      return;
    }
    await callNextMutation.mutateAsync();
  };

  const handleRemove = async (entryId: string) => {
    if (confirm('Remove this person from queue?')) {
      await removeMutation.mutateAsync(entryId);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load queue entries. Please refresh the page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">
            {entries?.length || 0} Waiting
          </span>
        </div>
        <Button
          onClick={handleCallNext}
          disabled={entries?.length === 0 || isCalling}
          size="lg"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {isCalling ? 'Calling...' : 'Call Next'}
        </Button>
      </div>

      {/* Queue List */}
      <div className="grid gap-4">
        {entries?.map((entry: any) => (
          <QueueEntryCard
            key={entry.id}
            entry={{
              id: entry.id,
              firstName: entry.name?.split(' ')[0] || 'Unknown',
              lastName: entry.name?.split(' ').slice(1).join(' ') || '',
              phone: entry.phoneNumber,
              position: entry.position,
            }}
            onRemove={handleRemove}
            isRemoving={removingId === entry.id}
          />
        ))}

        {(!entries || entries.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No one is in queue yet</p>
              <p className="text-sm">Share the QR code to invite people</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
