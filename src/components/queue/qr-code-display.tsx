'use client';

import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface QRCodeDisplayProps {
  value: string; // Queue URL
  size?: number;
  includeDownload?: boolean;
}

export function QRCodeDisplay({
  value,
  size = 256,
  includeDownload = true,
}: QRCodeDisplayProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `queue-qr-${Date.now()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card className="w-fit">
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center">
          <QRCodeSVG
            ref={svgRef}
            value={value}
            size={size}
            level="M"
            includeMargin={true}
            aria-label={`QR code for queue: ${value}`}
          />
        </div>
        {includeDownload && (
          <Button onClick={handleDownload} className="w-full">
            Download QR Code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
