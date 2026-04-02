import { notFound } from 'next/navigation'
import { JoinQueueForm } from '@/components/queue/join-queue-form'
import { QRCodeDisplay } from '@/components/queue/qr-code-display'
import { db } from '@/lib/db'
import { queues, queueEntries } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { formatQueueUrl } from '@/lib/utils'

export default async function PublicQueuePage({
  params,
}: {
  params: Promise<{ queueId: string }>
}) {
  const { queueId } = await params

  // Get queue with admin info
  const [queue] = await db
    .select({
      id: queues.id,
      name: queues.name,
      adminId: queues.adminId,
      expiresAt: queues.expiresAt,
      adminName: queues.name, // Simplified - in real app join with users table
    })
    .from(queues)
    .where(eq(queues.id, queueId))
    .limit(1)

  if (!queue) {
    notFound()
  }

  // Get entry count
  const [countResult] = await db
    .select({ count: count() })
    .from(queueEntries)
    .where(and(eq(queueEntries.queueId, queueId), eq(queueEntries.status, 'WAITING')))

  const entriesCount = Number(countResult?.count || 0)

  if (queue.expiresAt && queue.expiresAt < new Date()) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Queue Expired</h1>
        <p className="text-muted-foreground">This queue is no longer active.</p>
      </div>
    )
  }

  const queueUrl = formatQueueUrl(queueId)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{queue.name}</h1>
          <p className="text-muted-foreground">Managed by Queue Admin</p>
          <p className="text-sm text-muted-foreground">{entriesCount} people waiting</p>
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
  )
}
