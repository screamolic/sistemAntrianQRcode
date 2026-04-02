# Real-time Queue System dengan SSE (Server-Sent Events)

## Masalah: Cron Terlalu Lambat untuk Antrian Cepat

Cron jobs (bahkan setiap 1 menit) **tidak cocok** untuk sistem antrian real-time karena:

- ❌ Antrian berubah dalam hitungan detik
- ❌ Customer ingin lihat update instant
- ❌ Staff dashboard harus real-time
- ❌ Display board perlu update seketika

## Solusi: Server-Sent Events (SSE)

**SSE** adalah teknologi push notification dari server ke browser via HTTP connection yang tetap terbuka.

### Keuntungan SSE vs Cron

| Aspek          | Cron                   | SSE           |
| -------------- | ---------------------- | ------------- |
| **Latency**    | 1-60 menit             | <1 detik      |
| **Update**     | Polling (tarik)        | Push (dorong) |
| **Connection** | Stateless              | Persistent    |
| **Battery**    | Boros (sering request) | Hemat         |
| **Complexity** | Simple                 | Medium        |

### Kapan Pakai Apa

```
┌─────────────────────────────────────────────────────┐
│  Gunakan SSE untuk:                                 │
│  ✅ Queue position changes                          │
│  ✅ Call next customer                              │
│  ✅ Staff dashboard updates                         │
│  ✅ Public display board                            │
│  ✅ Customer waiting room screen                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Gunakan Cron untuk:                                │
│  ✅ Daily cleanup (midnight)                        │
│  ✅ Retry failed WhatsApp (every 5-15 min)          │
│  ✅ Backup & maintenance                            │
│  ✅ Daily reset queue                               │
└─────────────────────────────────────────────────────┘
```

---

## Arsitektur Real-time

```
┌──────────────┐      HTTP POST      ┌─────────────────┐
│   Customer   │ ──────────────────> │  API: /api/queue│
│   Join Queue │                     │  /join          │
└──────────────┘                     └────────┬────────┘
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │  Database (PostgreSQL)   │
                              │  - Insert queue entry    │
                              │  - Update positions      │
                              └────────────┬─────────────┘
                                           │
                                           ▼
                              ┌──────────────────────────┐
                              │  broadcastQueueUpdate()  │
                              │  - Push to all clients   │
                              └────────────┬─────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │                     │                     │
                     ▼                     ▼                     ▼
          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
          │  Staff Dashboard │  │  Display Board   │  │  Customer Mobile │
          │  (real-time)     │  │  (real-time)     │  │  (real-time)     │
          └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## Implementasi

### 1. SSE Endpoint

**File:** `src/app/api/sse/queue-updates/route.ts`

```typescript
// Server menerima koneksi dari semua clients
const clients = new Set<ReadableStreamDefaultController>()

// Broadcast function untuk push update
export function broadcastQueueUpdate(queueId: string, data: any) {
  clients.forEach((controller) => {
    controller.enqueue(encoder.encode(`data: ${message}\n\n`))
  })
}
```

### 2. React Hook

**File:** `src/hooks/use-queue-updates.ts`

```typescript
// Client connect ke SSE endpoint
export function useQueueUpdates({ queueId, onUpdate }) {
  const eventSource = new EventSource(`/api/sse/queue-updates`)

  eventSource.onmessage = (event) => {
    const update = JSON.parse(event.data)
    onUpdate(update)
  }
}
```

### 3. Broadcast dari Database Operations

**File:** `src/lib/queue-entries.ts`

```typescript
export async function addQueueEntry(queueId: string, phone: string) {
  const result = await db.$transaction(async (tx) => {
    // ... database operations
  })

  // REAL-TIME: Broadcast ke semua connected clients
  broadcastQueueUpdate(queueId, {
    type: 'ENTRY_ADDED',
    entry: result,
  })

  return result
}
```

### 4. UI Component dengan Auto-Update

**File:** `src/components/queue-display-board.tsx`

```typescript
export function QueueDisplayBoard({ queueId }) {
  const [entries, setEntries] = useState([]);

  // Handle real-time updates
  useQueueUpdates({
    queueId,
    onUpdate: (update) => {
      switch (update.data.type) {
        case 'ENTRY_ADDED':
          setEntries(prev => [...prev, update.data.entry]);
          break;
        case 'ENTRY_SERVED':
          setEntries(prev => prev.filter(e => e.id !== update.data.entry.id));
          break;
      }
    },
  });

  return <div>...</div>;
}
```

---

## Event Types

| Event           | Trigger             | Effect                        |
| --------------- | ------------------- | ----------------------------- |
| `ENTRY_ADDED`   | Customer join queue | Add to list, update positions |
| `ENTRY_SERVED`  | Staff call next     | Remove first, shift positions |
| `ENTRY_REMOVED` | Cancel/transfer     | Remove entry, recalculate     |
| `QUEUE_RESET`   | Daily cleanup       | Clear all entries             |

---

## Koneksi & Rekoneksi

### Auto-Reconnect dengan Exponential Backoff

```typescript
eventSource.onerror = () => {
  eventSource.close()

  // Reconnect setelah 3s, 6s, 12s, dst (max 30s)
  const retryDelay = Math.min(30000, 3000 * Math.pow(2, retryCount))
  setTimeout(connect, retryDelay)
}
```

### Connection Status

```typescript
const { connected, lastUpdate, reconnect } = useQueueUpdates({ queueId });

if (!connected) {
  return <div>Reconnecting...</div>;
}
```

---

## Deployment Considerations

### Vercel/Serverless

**Challenge:** Serverless functions punya timeout (max 60s di Vercel)

**Solution:**

- Gunakan Vercel Edge Functions untuk SSE
- Atau deploy worker service terpisah (Railway, Render, Fly.io)

### Self-hosted (VPS)

**Setup:**

```bash
# Run Next.js dengan Node.js server (bukan serverless)
npm run build
npm run start

# PM2 untuk process management
pm2 start npm --name "queue-app" -- start
```

### Load Balancing

Jika pakai multiple instances:

- Gunakan Redis Pub/Sub untuk broadcast cross-instance
- Atau sticky sessions untuk SSE connections

---

## Testing Real-time

### Manual Test

1. Buka 2 browser tabs:
   - Tab 1: `/admin/queue` (staff dashboard)
   - Tab 2: `/display/1` (public display)

2. Di Tab 1, klik "Call Next"
3. Tab 2 harus update **instant** (<1 detik)

### Automated Test

```typescript
// playwright: real-time-update.spec.ts
test('queue updates propagate in real-time', async ({ page }) => {
  const dashboard = await page.newContext()
  const display = await page.newContext()

  // Connect both to SSE
  await dashboard.goto('/admin/queue')
  await display.goto('/display/1')

  // Trigger update
  await dashboard.click('button:has-text("Call Next")')

  // Check display updates within 2 seconds
  await display.waitForTimeout(2000)
  const updated = await display.textContent('.current-customer')
  expect(updated).not.toBe('')
})
```

---

## Performance Metrics

| Metric         | Target                 | Measurement               |
| -------------- | ---------------------- | ------------------------- |
| **Latency**    | <500ms                 | Server push to UI update  |
| **Connection** | 99.9% uptime           | SSE persistent connection |
| **Reconnect**  | <5s                    | Auto-recovery time        |
| **Memory**     | <10MB per 1000 clients | Server memory usage       |

---

## Troubleshooting

### Update tidak muncul real-time

1. Check SSE connection di browser DevTools → Network
2. Verify `broadcastQueueUpdate()` dipanggil setelah database change
3. Check CORS jika deploy di domain berbeda

### Connection sering putus

1. Increase timeout di server/proxy
2. Disable nginx buffering (`X-Accel-Buffering: no`)
3. Implement proper reconnection logic

### Memory leak

1. Pastikan clients di-cleanup on disconnect
2. Limit stored updates (max 50 per queue)
3. Monitor heap usage di production

---

## Migration dari Cron

### Before (Cron-based)

```typescript
// Cron job setiap 5 menit
async function retryNotifications() {
  const failed = await db.notification.findMany({
    where: { status: 'FAILED' },
  })
  // Send WhatsApp
}
```

### After (SSE + Cron backup)

```typescript
// Instant: Broadcast saat queue change
broadcastQueueUpdate(queueId, { type: 'POSITION_CHANGED' })

// Backup: Cron tetap ada untuk retry
async function retryNotifications() {
  // Only for failed messages
}
```

---

## Kesimpulan

**SSE adalah solusi tepat untuk real-time queue system:**

✅ **Instant update** (<1 detik)  
✅ **Tidak perlu ganti framework** (Next.js support)  
✅ **Simple implementasi** (vs WebSocket)  
✅ **Browser native** (no library needed)  
✅ **Fallback polling** (jika SSE tidak support)

**Cron tetap berguna untuk:**

- Background tasks (daily cleanup)
- Retry mechanism (backup)
- Scheduled jobs (midnight reset)

**Kombinasi SSE + Cron = Best of both worlds!**

---

_Created: 2 April 2026_  
_Author: Real-time Queue System Implementation_
