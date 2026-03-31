import { notFound } from 'next/navigation';
import { JoinQueueForm } from '@/components/queue/join-queue-form';
import { QRCodeDisplay } from '@/components/queue/qr-code-display';
import { db } from '@/lib/prisma';
import { formatQueueUrl } from '@/lib/utils';

export default async function PublicQueuePage({
  params,
}: {
  params: Promise<{ queueId: string }>;
}) {
  const { queueId } = await params;
  
  const queue = await db.queue.findUnique({
    where: { id: queueId },
    include: {
      admin: { select: { name: true } },
      _count: { select: { entries: true } },
    },
  });

  if (!queue) {
    notFound();
  }

  if (queue.expiresAt && queue.expiresAt < new Date()) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Queue Expired</h1>
        <p className="text-muted-foreground">This queue is no longer active.</p>
      </div>
    );
  }

  const queueUrl = formatQueueUrl(queueId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{queue.name}</h1>
          <p className="text-muted-foreground">
            Managed by {queue.admin.name || 'Queue Admin'}
          </p>
          <p className="text-sm text-muted-foreground">
            {queue._count.entries} people waiting
          </p>
        </div>

        <div className="flex justify-center">
          <QRCodeDisplay value={queueUrl} size={200} includeDownload={false} />
        </div>

        <div className="border-t pt-8">
          <h2 className="text-xl font-bold mb-4 text-center">Join Queue</h2>
          <JoinQueueForm queueId={queueId} />
        </div>
      </div>
    </div>
  );
}
