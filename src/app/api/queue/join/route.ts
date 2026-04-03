import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { queueEntries, queues, counters } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { apiRateLimiter } from '@/lib/rate-limiter'

const joinQueueSchema = z.object({
  counterId: z.string().min(1, 'Counter ID diperlukan'),
  customerName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  customerPhone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
})

/**
 * POST /api/queue/join - Join a queue
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
  const isLimited = await apiRateLimiter.isRateLimited(`queue-join:${ip}`)

  if (isLimited) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const validated = joinQueueSchema.parse(body)

    // Verify counter exists
    const counterResults = await db
      .select()
      .from(counters)
      .where(eq(counters.id, validated.counterId))
      .limit(1)

    if (counterResults.length === 0) {
      return NextResponse.json({ error: 'Counter tidak ditemukan' }, { status: 404 })
    }

    const counter = counterResults[0]

    // Get or create a queue for this counter
    const queueResults = await db
      .select()
      .from(queues)
      .where(eq(queues.counterId, counter.id))
      .limit(1)

    let queueId: string

    if (queueResults.length === 0) {
      // Create default queue for this counter
      const [newQueue] = await db
        .insert(queues)
        .values({
          counterId: counter.id,
          name: `Antrian ${counter.name}`,
          adminId: counter.adminId,
          status: 'ACTIVE',
        })
        .returning()

      queueId = newQueue.id
    } else {
      queueId = queueResults[0].id
    }

    // Get current max position
    const lastEntryResults = await db
      .select({ maxPosition: sql<number>`COALESCE(MAX(${queueEntries.position}), 0)` })
      .from(queueEntries)
      .where(eq(queueEntries.queueId, queueId))

    const newPosition = (lastEntryResults[0]?.maxPosition || 0) + 1

    // Create new queue entry
    const [newEntry] = await db
      .insert(queueEntries)
      .values({
        queueId,
        customerPhone: validated.customerPhone,
        customerName: validated.customerName,
        position: newPosition,
        status: 'WAITING',
      })
      .returning()

    return NextResponse.json(
      {
        message: 'Berhasil bergabung ke antrian',
        entry: {
          id: newEntry.id,
          position: newEntry.position,
          customerName: newEntry.customerName,
          customerPhone: newEntry.customerPhone,
        },
        queue: {
          id: queueId,
          name: queueResults.length > 0 ? queueResults[0].name : `Antrian ${counter.name}`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    console.error('Error joining queue:', error)
    return NextResponse.json(
      { error: 'Gagal bergabung ke antrian. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
