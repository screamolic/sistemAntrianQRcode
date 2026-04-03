'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Clock } from 'lucide-react'

interface QueuePositionDisplayProps {
  counterName: string
  position: number
  customerName: string
  entryId: string
}

export function QueuePositionDisplay({
  counterName,
  position,
  customerName,
}: QueuePositionDisplayProps) {
  // Estimate wait time (2 minutes per person in queue)
  const estimatedWaitMinutes = position * 2
  const estimatedWait = estimatedWaitMinutes < 60 
    ? `${estimatedWaitMinutes} menit`
    : `${Math.floor(estimatedWaitMinutes / 60)} jam ${estimatedWaitMinutes % 60} menit`

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Anda Berhasil Bergabung!</CardTitle>
        <CardDescription>
          Antrian di {counterName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-muted-foreground">Halo, {customerName}!</p>
          <div className="flex justify-center items-center gap-4">
            <Badge variant="secondary" className="text-4xl px-6 py-3">
              #{position}
            </Badge>
          </div>
          <p className="text-lg font-medium">Posisi Antrian Anda</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-muted-foreground" />
                <p className="text-2xl font-bold">{position}</p>
                <p className="text-sm text-muted-foreground">Orang di depan Anda</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-2">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-2xl font-bold">~{estimatedWait}</p>
                <p className="text-sm text-muted-foreground">Estimasi waktu tunggu</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>📱 Anda akan menerima notifikasi WhatsApp ketika:</p>
          <ul className="text-left space-y-1 ml-4 list-disc">
            <li>Giliran Anda hampir tiba (2-3 orang di depan)</li>
            <li>Giliran Anda sudah tiba</li>
            <li>Layanan Anda selesai</li>
          </ul>
        </div>

        <Alert>
          <AlertDescription>
            Harap tetap berada di dekat area counter dan perhatikan notifikasi WhatsApp Anda.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

import { Alert, AlertDescription } from '@/components/ui/alert'
