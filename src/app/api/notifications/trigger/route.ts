import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'
import { createRateLimitedNotification } from '@/lib/rate-limiter'

/**
 * POST /api/notifications/trigger
 * Trigger WhatsApp notification with rate limiting
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queueId, entryId, type, phone, message } = body

    // Check rate limit
    const rateLimitResult = await createRateLimitedNotification(
      queueId,
      entryId,
      type,
      phone,
      message
    )

    if (!rateLimitResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
      })
    }

    // Send notification
    const result = await WhatsAppService.sendNotification({
      queueId,
      entryId,
      type,
      phone,
      message,
    })

    return NextResponse.json({
      success: result.success,
    })
  } catch (error) {
    console.error('Error triggering notification:', error)
    return NextResponse.json({ error: 'Failed to trigger notification' }, { status: 500 })
  }
}
