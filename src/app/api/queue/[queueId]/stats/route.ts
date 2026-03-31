import { NextRequest, NextResponse } from 'next/server';
import { getQueueStats } from '@/lib/services/queue-stats';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  try {
    const { queueId } = await params;
    const stats = await getQueueStats(queueId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue stats' },
      { status: 500 }
    );
  }
}
