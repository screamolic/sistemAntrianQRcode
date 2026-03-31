'use client';

import { useQueueEntries, useCallNextMutation, useRemoveEntryMutation } from '@/hooks/use-queue';
import { QueueEntryCard } from './queue-entry-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, CheckCircle } from 'lucide-react';

interface QueueListProps {
  queueId: string;
  isAdmin?: boolean;
}

export function QueueList({ queueId, isAdmin = false }: QueueListProps) {
  const { data: entries, isLoading, error } = useQueueEntries(queueId);
  const callNextMutation = useCallNextMutation(queueId);
  const removeEntryMutation = useRemoveEntryMutation(queueId);

  const handleCallNext = async () => {
    if (!entries || entries.length === 0) {
      alert('No one is in queue');
      return;
    }
    await callNextMutation.mutateAsync();
  };

  const handleRemove = async (entryId: string) => {
    await removeEntryMutation.mutateAsync(entryId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Failed to load queue entries
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">
              {entries?.length || 0} Waiting
            </span>
          </div>
          <Button
            onClick={handleCallNext}
            disabled={!entries || entries.length === 0 || callNextMutation.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {callNextMutation.isPending ? 'Calling...' : 'Call Next'}
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {entries?.map((entry: any, index: number) => (
          <QueueEntryCard
            key={entry.id}
            entry={{
              id: entry.id,
              firstName: entry.name?.split(' ')[0] || 'Unknown',
              lastName: entry.name?.split(' ').slice(1).join(' ') || '',
              phone: entry.phoneNumber,
              position: entry.position,
            }}
            onRemove={isAdmin ? handleRemove : undefined}
            isRemoving={removeEntryMutation.isPending}
          />
        ))}

        {(!entries || entries.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No one is in queue yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
