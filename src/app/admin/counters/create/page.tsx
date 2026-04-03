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
import { QRCodeDisplay } from '@/components/queue/qr-code-display'
import { useRouter } from 'next/navigation'

const counterSchema = z.object({
  name: z.string().min(2, 'Nama counter minimal 2 karakter').max(100),
  description: z.string().optional(),
})

type CounterInput = z.infer<typeof counterSchema>

export default function CreateCounterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [createdCounter, setCreatedCounter] = useState<{
    id: string
    name: string
    qrCode: string
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CounterInput>({
    resolver: zodResolver(counterSchema),
  })

  const onSubmit = async (data: CounterInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/counters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Gagal membuat counter')
        return
      }

      setCreatedCounter({
        id: result.counter.id,
        name: result.counter.name,
        qrCode: `${window.location.origin}/q/${result.counter.id}`,
      })
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (createdCounter) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Counter Berhasil Dibuat</CardTitle>
            <CardDescription>
              Counter &quot;{createdCounter.name}&quot; siap digunakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <QRCodeDisplay value={createdCounter.qrCode} size={300} />
            </div>
            
            <Alert>
              <AlertDescription>
                <p className="font-medium mb-2">URL Antrian:</p>
                <code className="block bg-muted p-2 rounded text-sm break-all">
                  {createdCounter.qrCode}
                </code>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bagikan URL ini atau cetak kode QR untuk pelanggan
                </p>
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Kembali ke Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreatedCounter(null)
                  router.refresh()
                }}
              >
                Buat Counter Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Buat Counter Baru</CardTitle>
          <CardDescription>
            Tambahkan counter layanan baru untuk sistem antrian
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
              <Label htmlFor="name">Nama Counter</Label>
              <Input
                id="name"
                type="text"
                placeholder="Contoh: Counter Loket 1"
                disabled={isLoading}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input
                id="description"
                type="text"
                placeholder="Deskripsi counter layanan"
                disabled={isLoading}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Membuat counter...' : 'Buat Counter'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
