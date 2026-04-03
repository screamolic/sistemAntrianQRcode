import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { queueEntries, queues } from '@/lib/db/schema'
import { eq, and, asc, sql } from 'drizzle-orm'

/**
 * POST /api/queue/:queueId/call-next - Call next customer in queue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { queueId } = await params

    // Verify queue exists and user has access
    const queueResults = await db
      .select()
      .from(queues)
      .where(eq(queues.id, queueId))
      .limit(1)

    if (queueResults.length === 0) {
      return NextResponse.json({ error: 'Queue tidak ditemukan' }, { status: 404 })
    }

    // Get first waiting entry
    const nextEntryResults = await db
      .select()
      .from(queueEntries)
      .where(
        and(
          eq(queueEntries.queueId, queueId),
          eq(queueEntries.status, 'WAITING')
        )
      )
      .orderBy(asc(queueEntries.position), asc(queueEntries.createdAt))
      .limit(1)

    if (nextEntryResults.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada antrian yang menunggu' },
        { status: 400 }
      )
    }

    const nextEntry = nextEntryResults[0]

    // Update entry to called
    const [updatedEntry] = await db
      .update(queueEntries)
      .set({
        status: 'SERVED',
        calledAt: new Date(),
      })
      .where(eq(queueEntries.id, nextEntry.id))
      .returning()

    // Decrement positions of remaining waiting entries
    await db
      .update(queueEntries)
      .set({
        position: sql`${queueEntries.position} - 1`,
      })
      .where(
        and(
          eq(queueEntries.queueId, queueId),
          eq(queueEntries.status, 'WAITING')
        )
      )

    return NextResponse.json({
      message: 'Berhasil memanggil antrian berikutnya',
      entry: updatedEntry,
    })
  } catch (error) {
    console.error('Error calling next entry:', error)
    return NextResponse.json(
      { error: 'Gagal memanggil antrian berikutnya' },
      { status: 500 }
    )
  }
}
