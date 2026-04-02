import { NextResponse } from 'next/server'

/**
 * GET /api/cron/health
 * Health check for cron jobs
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
