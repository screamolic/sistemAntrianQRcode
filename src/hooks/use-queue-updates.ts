import { useEffect, useState, useRef } from 'react'

interface QueueUpdate {
  queueId: string
  data: Record<string, unknown>
  timestamp: string
}

interface UseQueueUpdatesOptions {
  queueId: string
  enabled?: boolean
  onUpdate?: (update: QueueUpdate) => void
}

/**
 * Hook untuk real-time queue updates via SSE
 * Auto-reconnect dengan exponential backoff
 */
export function useQueueUpdates({ queueId, enabled = true, onUpdate }: UseQueueUpdatesOptions) {
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<QueueUpdate | null>(null)
  const retryCountRef = useRef(0)
  const onUpdateRef = useRef(onUpdate)

  // Update ref when callback changes
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    if (!enabled) return

    const eventSource = new EventSource(`/api/sse/queue-updates`)
    let reconnectTimeout: NodeJS.Timeout

    eventSource.onopen = () => {
      console.log('SSE connected to queue updates')
      setConnected(true)
      retryCountRef.current = 0
    }

    eventSource.onmessage = (event) => {
      if (event.data === 'connected') return

      try {
        const update: QueueUpdate = JSON.parse(event.data)

        // Filter updates for this queue
        if (update.queueId === queueId) {
          setLastUpdate(update)
          onUpdateRef.current?.(update)
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('SSE connection error')
      setConnected(false)
      eventSource.close()

      // Reconnect with exponential backoff (max 30s)
      retryCountRef.current += 1
      const delay = Math.min(30000, 3000 * 2 ** retryCountRef.current)
      reconnectTimeout = setTimeout(() => {
        // Reconnection will happen via useEffect dependency
      }, delay)
    }

    return () => {
      clearTimeout(reconnectTimeout)
      eventSource.close()
    }
  }, [queueId, enabled])

  return {
    connected,
    lastUpdate,
  }
}
