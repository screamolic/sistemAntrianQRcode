import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { queueEntries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * POST /api/queue/entries/:entryId/mark-served - Mark customer as served
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

    // Update entry to completed
    const [updatedEntry] = await db
      .update(queueEntries)
      .set({
        status: 'COMPLETED',
        servedAt: new Date(),
        completedAt: new Date(),
      })
      .where(eq(queueEntries.id, entryId))
      .returning()

    return NextResponse.json({
      message: 'Pelanggan berhasil ditandai sebagai dilayani',
      entry: updatedEntry,
    })
  } catch (error) {
    console.error('Error marking entry as served:', error)
    return NextResponse.json(
      { error: 'Gagal menandai pelanggan sebagai dilayani' },
      { status: 500 }
    )
  }
}
