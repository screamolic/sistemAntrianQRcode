import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { QueueManagement } from './queue-management';
import { QueueShareDialog } from '@/components/queue/queue-share-dialog';
import { formatQueueUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function AdminQueuePage({
  params,
}: {
  params: Promise<{ queueId: string }>;
}) {
  const { queueId } = await params;
  
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const queue = await db.queue.findUnique({
    where: { id: queueId },
    include: {
      entries: {
        where: { status: 'WAITING' },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      },
      _count: {
        select: {
          entries: {
            where: { status: 'WAITING' },
          },
        },
      },
    },
  });

  if (!queue) {
    notFound();
  }

  // Verify ownership
  if (queue.adminId !== session.user.id && session.user.role !== 'SUPER_ADMIN') {
    redirect('/unauthorized');
  }

  const queueUrl = formatQueueUrl(queueId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <a href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{queue.name}</h1>
          <p className="text-muted-foreground">
            {queue._count.entries} people waiting
          </p>
        </div>
        <QueueShareDialog queueId={queue.id} queueUrl={queueUrl} />
      </div>

      <QueueManagement queue={queue} />
    </div>
  );
}
