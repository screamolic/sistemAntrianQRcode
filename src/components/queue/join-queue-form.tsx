'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { joinQueueAction } from '@/app/actions/join-queue'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface JoinQueueFormProps {
  queueId: string
}

export function JoinQueueForm({ queueId }: JoinQueueFormProps) {
  const [pending, startTransition] = useTransition()
  const [result, setResult] = useState<{
    success: boolean
    error?: string
    position?: number
  } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    formData.append('queueId', queueId)

    startTransition(async () => {
      const response = await joinQueueAction(formData)
      setResult(response)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          name="firstName"
          placeholder="John"
          required
          disabled={pending || result?.success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          name="lastName"
          placeholder="Doe"
          required
          disabled={pending || result?.success}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp Number</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="+628123456789"
          type="tel"
          required
          disabled={pending || result?.success}
        />
        <p className="text-sm text-muted-foreground">Format: +62 or 08 (Indonesian WhatsApp)</p>
      </div>

      <Button type="submit" className="w-full" disabled={pending || result?.success}>
        {pending ? 'Joining...' : result?.success ? 'Joined Queue' : 'Join Queue'}
      </Button>

      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.success ? `You're in queue! Position: #${result.position}` : result.error}
          </AlertDescription>
        </Alert>
      )}
    </form>
  )
}
