'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { retryFailedNotificationsAction } from '@/app/actions/notifications'

interface NotificationPanelProps {
  queueId: string
}

export function NotificationPanel({ queueId }: NotificationPanelProps) {
  const { data: stats, refetch } = useQuery({
    queryKey: ['notification-stats', queueId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications/stats?queueId=${queueId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    refetchInterval: 30000, // 30 seconds
  })

  const handleRetry = async () => {
    const result = await retryFailedNotificationsAction(queueId)
    if (result.success) {
      refetch()
      alert(`Retried ${result.retried} notifications, ${result.succeeded} succeeded`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Notifications</span>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Failed
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats?.sent || 0}</div>
            <div className="text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 inline" /> Sent
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline" /> Pending
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            <div className="text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 inline" /> Failed
            </div>
          </div>
        </div>
        {stats && (
          <div className="mt-4 text-sm text-muted-foreground">
            Success rate: {stats.successRate}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}
