# Research: QR Code Generation for Next.js 16 (2026)

**Researched:** 31 March 2026
**Phase:** 3 - Queue Core Functionality
**Focus:** QR code libraries, Next.js compatibility, download patterns

---

## QR Code Libraries for React/Next.js

### Recommended: `qrcode.react` (v4)

**Why qrcode.react over alternatives:**

| Library | SSR Support | Bundle Size | API | Next.js 16 | Verdict |
|---------|-------------|-------------|-----|------------|---------|
| **qrcode.react** | ✅ Yes | ~15KB | React component | ✅ Compatible | ✅ **Recommended** |
| qrcode | ❌ No (Node only) | ~8KB | Function calls | ⚠️ Server-only | Alternative |
| react-qr-code | ✅ Yes | ~12KB | React component | ✅ Compatible | Alternative |
| qr-code-styling | ✅ Yes | ~25KB | Class-based | ✅ Compatible | Overkill |

**Installation:**
```bash
npm install qrcode.react
```

---

## Next.js 16 App Router Compatibility

### Server Component Pattern

`qrcode.react` v4 works with Next.js 16 App Router:

```typescript
// components/qr-code-display.tsx
'use client'; // Required for interactive features

import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';

interface Props {
  value: string; // Queue URL
  size?: number;
}

export function QRCodeDisplay({ value, size = 256 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  return (
    <QRCodeSVG
      ref={svgRef}
      value={value}
      size={size}
      level="M" // 15% error correction
      includeMargin={true}
    />
  );
}
```

**Important:** Must be `'use client'` for download functionality (requires browser APIs)

---

## QR Code Download as PNG

### SVG to PNG Conversion Pattern

```typescript
// components/qr-code-generator.tsx
'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  value: string;
  size?: number;
}

export function QRCodeGenerator({ value, size = 256 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleDownload = async () => {
    if (!svgRef.current) return;

    // 1. Serialize SVG
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // 2. Load into Image
    const img = new Image();
    img.onload = () => {
      // 3. Draw to Canvas
      const canvas = document.createElement('canvas');
      canvas.width = size * 2; // 2x for retina
      canvas.height = size * 2;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, size * 2, size * 2);

      // 4. Download as PNG
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `queue-qr-${Date.now()}.png`;
      link.href = pngUrl;
      link.click();

      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <QRCodeSVG
        ref={svgRef}
        value={value}
        size={size}
        level="M"
        includeMargin={true}
      />
      <Button onClick={handleDownload}>
        Download QR Code
      </Button>
    </div>
  );
}
```

---

## QR Code Best Practices

### Error Correction Levels

| Level | Recovery Capacity | Use Case |
|-------|-------------------|----------|
| L (Low) | 7% | Clean environments only |
| **M (Medium)** | **15%** | **✅ Recommended for queues** |
| Q (Quartile) | 25% | High wear/damage expected |
| H (High) | 30% | Critical applications |

**For Queue QR Codes:** Level M is optimal — balances size and durability

### Size Recommendations

| Use Case | Minimum Size | Recommended |
|----------|--------------|-------------|
| Mobile screen display | 150x150 | 200x200 |
| Printed poster (view from 1m) | 2x2 cm | 3x3 cm |
| Printed counter stand | 3x3 cm | 5x5 cm |

**For digital display:** 256x256 pixels minimum
**For print:** 300 DPI, minimum 2x2 cm

### Content Best Practices

**DO:**
- ✅ Use full HTTPS URL (`https://domain.com/queue/abc123`)
- ✅ Test with multiple QR scanner apps
- ✅ Include margin (quiet zone) in design
- ✅ Use high contrast (black on white)

**DON'T:**
- ❌ Use HTTP URLs (security warning)
- ❌ Add too much styling/colors (reduces scannability)
- ❌ Make too small (<2cm for print)
- ❌ Place on reflective surfaces

---

## Next.js 16 Specific Considerations

### Dynamic Import for Heavy Libraries

If bundle size is concern:

```typescript
import dynamic from 'next/dynamic';

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false, loading: () => <div className="h-64 w-64 bg-muted animate-pulse" /> }
);
```

**Trade-off:** Adds lazy loading overhead, but reduces initial bundle

### Edge Runtime Compatibility

`qrcode.react` is client-side only — does not work in Edge Runtime:

```typescript
// ✅ Correct: Client component
'use client';
import { QRCodeSVG } from 'qrcode.react';

// ❌ Wrong: Will fail in edge runtime
import { QRCodeSVG } from 'qrcode.react'; // in server component
```

---

## Testing QR Codes

### Manual Testing Checklist

- [ ] Scan with iOS Camera app
- [ ] Scan with Android Google Lens
- [ ] Scan with WhatsApp (built-in scanner)
- [ ] Verify URL opens correctly on mobile
- [ ] Test from different distances (10cm - 1m)
- [ ] Test on printed version (if applicable)
- [ ] Test with screen brightness variations

### Automated Testing (Future)

```typescript
// __tests__/qr-code.test.tsx
import { render, screen } from '@testing-library/react';
import { QRCodeGenerator } from '@/components/qr-code-generator';

describe('QRCodeGenerator', () => {
  it('renders QR code SVG', () => {
    render(<QRCodeGenerator value="https://example.com/queue/test123" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('download button exists', () => {
    render(<QRCodeGenerator value="https://example.com/queue/test123" />);
    expect(screen.getByText('Download QR Code')).toBeInTheDocument();
  });
});
```

---

## Key Findings

1. **qrcode.react v4** is optimal — SSR-compatible, React component API, ~15KB
2. **Must be 'use client'** for download functionality
3. **Error correction M (15%)** is optimal for queue QR codes
4. **256x256 minimum** for reliable scanning
5. **SVG to PNG conversion** requires canvas API (client-side only)

---

## Recommendations for Phase 3

- Use `qrcode.react` with `QRCodeSVG` component
- Wrap in `'use client'` component for download feature
- Use error correction level M
- Size: 256x256 pixels minimum
- Include download button for admin to save QR code
- Test with multiple scanner apps before deployment

---

**Sources:**
- qrcode.react GitHub: https://github.com/zpao/qrcode.react
- Next.js 16 App Router Docs: https://nextjs.org/docs/app
- QR Code Best Practices: ISO/IEC 18004:2015
