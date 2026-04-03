'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getQueueEntries, callNextEntry, removeQueueEntry } from '@/lib/queue-entries'

/**
 * Hook to fetch and poll queue entries
 */
export function useQueueEntries(queueId: string) {
  return useQuery({
    queryKey: ['queue-entries', queueId],
    queryFn: () => getQueueEntries(queueId),
    refetchInterval: 5000, // Poll every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000, // Consider data fresh for 1 minute
  })
}

/**
 * Hook to fetch queue stats
 */
export function useQueueStats(queueId: string) {
  return useQuery({
    queryKey: ['queue-stats', queueId],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${queueId}/stats`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    refetchInterval: 5000,
  })
}

/**
 * Hook to call next entry with optimistic updates
 */
export function useCallNextMutation(queueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => callNextEntry(queueId),
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['queue-entries', queueId] })

      const previousEntries = queryClient.getQueryData(['queue-entries', queueId])

      // Remove first entry optimistically
      if (Array.isArray(previousEntries)) {
        queryClient.setQueryData(
          ['queue-entries', queueId],
          previousEntries.slice(1).map((entry: { id: string }, index: number) => ({
            ...entry,
            position: index + 1,
          }))
        )
      }

      return { previousEntries }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousEntries) {
        queryClient.setQueryData(['queue-entries', queueId], context.previousEntries)
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['queue-entries', queueId] })
    },
  })
}

/**
 * Hook to remove entry with optimistic updates
 */
export function useRemoveEntryMutation(queueId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (entryId: string) => removeQueueEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-entries', queueId] })
    },
  })
}
