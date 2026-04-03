import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { counters } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { QueueJoinForm } from './queue-join-form'

interface QueueJoinPageProps {
  params: Promise<{
    counterId: string
  }>
}

export default async function QueueJoinPage({ params }: QueueJoinPageProps) {
  const { counterId } = await params

  // Verify counter exists
  const counter = await db.select().from(counters).where(eq(counters.id, counterId)).limit(1)

  if (counter.length === 0) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">{counter[0].name}</h1>
          {counter[0].description && (
            <p className="text-muted-foreground">{counter[0].description}</p>
          )}
        </div>

        <QueueJoinForm counterId={counterId} counterName={counter[0].name} />
      </div>
    </div>
  )
}
