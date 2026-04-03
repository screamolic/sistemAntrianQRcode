'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function QueueViewPage() {
  const params = useParams();
  const queueId = params.queueId as string;

  const { data: entries, isLoading, error } = useQuery({
    queryKey: ['queue-entries', queueId],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${queueId}/entries`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Queue Status</h1>
        <Card>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Queue Status</h1>
        <Card>
          <CardContent className="py-8 text-center text-destructive">
            Failed to load queue status
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Queue Status</h1>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {entries.map((entry: { id: string; name?: string }, index: number) => (
          <Card key={entry.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <span className="text-2xl font-bold w-12 text-center">
                #{index + 1}
              </span>
              <div>
                <p className="font-semibold">
                  {entry.name || 'Anonymous'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
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
