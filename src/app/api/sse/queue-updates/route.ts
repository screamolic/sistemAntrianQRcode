import { NextRequest } from 'next/server'

const clients = new Set<ReadableStreamDefaultController>()

// Global store untuk queue updates
export const queueUpdates = new Map<string, unknown[]>()

/**
 * SSE Endpoint untuk real-time queue updates
 * Clients connect dan menerima update instant
 */
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create ReadableStream untuk SSE
  const stream = new ReadableStream({
    start(controller) {
      // Add client to subscribers
      clients.add(controller)

      // Send initial connection message
      controller.enqueue(encoder.encode('data: connected\n\n'))

      // Remove client on disconnect
      request.signal.addEventListener('abort', () => {
        clients.delete(controller)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}

/**
 * Broadcast update ke semua connected clients
 * Dipanggil dari API routes setelah database change
 */
export function broadcastQueueUpdate(queueId: string, data: Record<string, unknown>): void {
  const encoder = new TextEncoder()
  const message = JSON.stringify({
    queueId,
    data,
    timestamp: new Date().toISOString(),
  })

  // Store for reconnection
  const updates = queueUpdates.get(queueId) || []
  updates.push(JSON.parse(message))
  if (updates.length > 50) updates.shift() // Keep last 50
  queueUpdates.set(queueId, updates)

  // Broadcast to all connected clients
  clients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(`data: ${message}\n\n`))
    } catch {
      // Client disconnected, remove
      clients.delete(controller)
    }
  })
}
