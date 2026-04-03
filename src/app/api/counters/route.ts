import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { counters } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const counterSchema = z.object({
  name: z.string().min(2, 'Nama counter minimal 2 karakter').max(100),
  description: z.string().optional(),
})

/**
 * GET /api/counters - Get all counters for authenticated user
 */
export async function GET() {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userCounters = await db
    .select()
    .from(counters)
    .where(eq(counters.adminId, session.user.id))
    .orderBy(counters.createdAt)

  return NextResponse.json({ counters: userCounters })
}

/**
 * POST /api/counters - Create new counter
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = counterSchema.parse(body)

    const [newCounter] = await db
      .insert(counters)
      .values({
        name: validated.name,
        description: validated.description || null,
        adminId: session.user.id,
      })
      .returning()

    return NextResponse.json(
      { 
        message: 'Counter berhasil dibuat',
        counter: newCounter 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    
    console.error('Error creating counter:', error)
    return NextResponse.json(
      { error: 'Gagal membuat counter' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/counters/:id - Update counter
 */
export async function PUT(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Counter ID required' }, { status: 400 })
    }

    const body = await request.json()
    const validated = counterSchema.parse(body)

    // Verify ownership
    const existingCounter = await db
      .select()
      .from(counters)
      .where(eq(counters.id, id))
      .limit(1)

    if (existingCounter.length === 0) {
      return NextResponse.json({ error: 'Counter tidak ditemukan' }, { status: 404 })
    }

    if (existingCounter[0].adminId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [updatedCounter] = await db
      .update(counters)
      .set({
        name: validated.name,
        description: validated.description || null,
      })
      .where(eq(counters.id, id))
      .returning()

    return NextResponse.json({
      message: 'Counter berhasil diperbarui',
      counter: updatedCounter,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }
    
    console.error('Error updating counter:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui counter' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/counters/:id - Delete counter
 */
export async function DELETE(request: NextRequest) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json({ error: 'Counter ID required' }, { status: 400 })
    }

    // Verify ownership
    const existingCounter = await db
      .select()
      .from(counters)
      .where(eq(counters.id, id))
      .limit(1)

    if (existingCounter.length === 0) {
      return NextResponse.json({ error: 'Counter tidak ditemukan' }, { status: 404 })
    }

    if (existingCounter[0].adminId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db
      .delete(counters)
      .where(eq(counters.id, id))

    return NextResponse.json({
      message: 'Counter berhasil dihapus',
    })
  } catch (error) {
    console.error('Error deleting counter:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus counter' },
      { status: 500 }
    )
  }
}
