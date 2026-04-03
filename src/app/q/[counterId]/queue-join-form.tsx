'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QueuePositionDisplay } from '@/components/queue/queue-position-display'

const joinQueueSchema = z.object({
  customerName: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  customerPhone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor telepon tidak valid'),
})

type JoinQueueInput = z.infer<typeof joinQueueSchema>

interface QueueJoinFormProps {
  counterId: string
  counterName: string
}

export function QueueJoinForm({ counterId, counterName }: QueueJoinFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [joinedQueue, setJoinedQueue] = useState<{
    entryId: string
    position: number
    customerName: string
    customerPhone: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JoinQueueInput>({
    resolver: zodResolver(joinQueueSchema),
  })

  const onSubmit = async (data: JoinQueueInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counterId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Gagal bergabung ke antrian')
        return
      }

      setJoinedQueue({
        entryId: result.entry.id,
        position: result.entry.position,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      })
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (joinedQueue) {
    return (
      <QueuePositionDisplay
        counterName={counterName}
        position={joinedQueue.position}
        customerName={joinedQueue.customerName}
        entryId={joinedQueue.entryId}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bergabung ke Antrian</CardTitle>
        <CardDescription>
          Masukkan data Anda untuk bergabung ke antrian {counterName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="customerName">Nama Lengkap</Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Masukkan nama Anda"
              disabled={isLoading}
              {...register('customerName')}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">{errors.customerName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Nomor Telepon (WhatsApp)</Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="Contoh: 081234567890"
              disabled={isLoading}
              {...register('customerPhone')}
            />
            {errors.customerPhone && (
              <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Nomor ini akan digunakan untuk mengirim notifikasi WhatsApp
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Bergabung ke antrian...' : 'Gabung ke Antrian'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
