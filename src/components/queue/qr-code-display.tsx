'use client'

import { useEffect, useState } from 'react'
import { toDataURL } from 'qrcode'
import Image from 'next/image'

interface QRCodeDisplayProps {
  value: string
  size?: number
}

export function QRCodeDisplay({ value, size = 300 }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function generateQR() {
      try {
        const dataUrl = await toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })

        if (mounted) {
          setQrDataUrl(dataUrl)
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Failed to generate QR code:', error)
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    generateQR()

    return () => {
      mounted = false
    }
  }, [value, size])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        <p className="text-muted-foreground">Generating QR code...</p>
      </div>
    )
  }

  if (!qrDataUrl) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        <p className="text-destructive">Failed to generate QR code</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <Image src={qrDataUrl} alt="QR Code" fill className="object-contain" unoptimized />
    </div>
  )
}
