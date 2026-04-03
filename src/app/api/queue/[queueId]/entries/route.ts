import { NextRequest, NextResponse } from 'next/server'
import { getQueueEntries } from '@/lib/queue-entries'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params
    const entries = await getQueueEntries(queueId)
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching queue entries:', error)
    return NextResponse.json({ error: 'Failed to fetch queue entries' }, { status: 500 })
  }
}
