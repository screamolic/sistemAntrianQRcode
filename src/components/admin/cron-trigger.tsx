'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Trash2, Clock } from 'lucide-react'

export function CronTrigger() {
  const [running, setRunning] = useState<{
    cleanup?: boolean
    retry?: boolean
  }>({})
  const [result, setResult] = useState<string>('')

  const runCleanup = async () => {
    setRunning((prev) => ({ ...prev, cleanup: true }))
    try {
      const res = await fetch('/api/cron/daily-cleanup', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        },
      })
      const data = await res.json()
      setResult(
        `Cleanup: ${data.archivedQueues} queues archived, ${data.deletedNotifications} notifications deleted`
      )
    } catch {
      setResult('Cleanup failed')
    } finally {
      setRunning((prev) => ({ ...prev, cleanup: false }))
    }
  }

  const runRetry = async () => {
    setRunning((prev) => ({ ...prev, retry: true }))
    try {
      const res = await fetch('/api/cron/retry-notifications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
        },
      })
      const data = await res.json()
      setResult(`Retry: ${data.succeeded}/${data.attempted} notifications sent`)
    } catch {
      setResult('Retry failed')
    } finally {
      setRunning((prev) => ({ ...prev, retry: false }))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runCleanup} disabled={running.cleanup} variant="outline">
            <Trash2 className="h-4 w-4 mr-2" />
            {running.cleanup ? 'Running...' : 'Run Daily Cleanup'}
          </Button>
          <Button onClick={runRetry} disabled={running.retry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {running.retry ? 'Running...' : 'Retry Failed'}
          </Button>
        </div>
        {result && (
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
