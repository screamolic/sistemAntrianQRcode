'use client'

import { useQueueUpdates } from '@/hooks/use-queue-updates'
import { useCallback, useEffect, useState } from 'react'

interface QueueEntry {
  id: string
  customerPhone: string
  position: number
  status: string
  createdAt: string
}

interface QueueDisplayBoardProps {
  queueId: string
  title?: string
}

/**
 * Real-time Queue Display Board
 * Updates automatically via SSE when queue changes
 */
export function QueueDisplayBoard({ queueId, title }: QueueDisplayBoardProps) {
  const [entries, setEntries] = useState<QueueEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial data
  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/queue/${queueId}/entries`)
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setIsLoading(false)
    }
  }, [queueId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  // Handle real-time updates via SSE
  useQueueUpdates({
    queueId,
    enabled: true,
    onUpdate: (update) => {
      console.log('Real-time update received:', update)

      switch (update.data.type) {
        case 'ENTRY_ADDED':
          setEntries((prev) => [...prev, update.data.entry as QueueEntry])
          break
        case 'ENTRY_SERVED':
          setEntries((prev) => prev.filter((e) => e.id !== (update.data.entry as QueueEntry).id))
          break
        case 'ENTRY_REMOVED':
          setEntries((prev) => prev.filter((e) => e.id !== (update.data.entry as QueueEntry).id))
          break
        default:
          // Refresh all data for unknown events
          fetchEntries()
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">{title || 'Queue Display'}</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-100 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{entries.length}</div>
            <div className="text-sm text-gray-600">Waiting</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{entries[0]?.position || '-'}</div>
            <div className="text-sm text-gray-600">Current</div>
          </div>
          <div className="text-center p-4 bg-purple-100 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {entries[entries.length - 1]?.position || '-'}
            </div>
            <div className="text-sm text-gray-600">Last</div>
          </div>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No one in queue</div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex justify-between items-center p-4 rounded-lg border-2 ${
                  index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                      index === 0 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {entry.position}
                  </div>
                  <div>
                    <div className="font-semibold">{entry.customerPhone}</div>
                    <div className="text-sm text-gray-500">
                      Joined: {new Date(entry.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                {index === 0 && (
                  <div className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                    Now Serving
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
