import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { queueEntries, queues } from '@/lib/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'

const transferSchema = z.object({
  targetQueueId: z.string().min(1, 'Queue tujuan diperlukan'),
})

/**
 * POST /api/queue/entries/:entryId/transfer - Transfer customer to different queue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { entryId } = await params
    const body = await request.json()
    const validated = transferSchema.parse(body)

    // Get entry
    const entryResults = await db
      .select()
      .from(queueEntries)
      .where(eq(queueEntries.id, entryId))
      .limit(1)

    if (entryResults.length === 0) {
      return NextResponse.json({ error: 'Entri tidak ditemukan' }, { status: 404 })
    }

    const entry = entryResults[0]
    const originalQueueId = entry.queueId

    // Verify target queue exists
    const targetQueueResults = await db
      .select()
      .from(queues)
      .where(eq(queues.id, validated.targetQueueId))
      .limit(1)

    if (targetQueueResults.length === 0) {
      return NextResponse.json({ error: 'Queue tujuan tidak ditemukan' }, { status: 404 })
    }

    // Get new position in target queue
    const lastEntryResults = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(${queueEntries.position}), 0)` })
      .from(queueEntries)
      .where(eq(queueEntries.queueId, validated.targetQueueId))

    const newPosition = (lastEntryResults[0]?.maxPosition || 0) + 1

    // Transfer entry to new queue
    const [updatedEntry] = await db
      .update(queueEntries)
      .set({
        queueId: validated.targetQueueId,
        position: newPosition,
        status: 'WAITING',
      })
      .where(eq(queueEntries.id, entryId))
      .returning()

    // Decrement positions in original queue
    await db
      .update(queueEntries)
      .set({
        position: sql`${queueEntries.position} - 1`,
      })
      .where(
        and(
          eq(queueEntries.queueId, originalQueueId),
          sql`${queueEntries.position} > ${entry.position}`
        )
      )

    return NextResponse.json({
      message: 'Pelanggan berhasil dipindahkan ke queue lain',
      entry: updatedEntry,
      newPosition,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    console.error('Error transferring entry:', error)
    return NextResponse.json({ error: 'Gagal memindahkan pelanggan' }, { status: 500 })
  }
}
