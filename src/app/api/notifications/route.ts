import { NextRequest, NextResponse } from 'next/server'
import { WhatsAppService } from '@/lib/services/whatsapp-service'

/**
 * POST /api/notifications
 * Send WhatsApp notification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queueId, entryId, userId, type, phone, message } = body

    // Send notification
    const result = await WhatsAppService.sendNotification({
      queueId,
      entryId,
      userId,
      type,
      phone,
      message,
    })

    return NextResponse.json({
      success: result.success,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}
