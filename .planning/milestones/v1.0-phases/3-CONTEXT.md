# Phase 3 Context: Queue Core Functionality

**Phase Number:** 3
**Created:** 31 March 2026
**Mode:** Assumptions (auto)

---

## Decision Summary

This document captures implementation decisions for Phase 3. These decisions are locked and ready for downstream agents (researcher, planner, executor) to act without asking the user again.

**Goal:** Build core queue management features (create, join, view, manage)

**Plans:**
- 3.1 — Create queue generation with unique IDs
- 3.2 — Implement QR code generation component
- 3.3 — Build queue join form with validation
- 3.4 — Create admin queue dashboard
- 3.5 — Implement FIFO queue algorithm with Prisma
- 3.6 — Add real-time updates (React Query polling)

---

## Architecture Decisions

### Queue ID Generation

| Aspect | Decision |
|--------|----------|
| ID Format | `cuid()` — collision-resistant, URL-safe |
| URL Pattern | `/queue/[queueId]` (dynamic route) |
| Queue Expiration | 24 hours from creation (`expiresAt` field) |
| Slug Alternative | Not needed — cuid is short enough (~25 chars) |

**Rationale:** cuid() provides uniqueness without database round-trips, URL-safe characters, and shorter length than UUID.

### QR Code Generation

| Aspect | Decision |
|--------|----------|
| Library | `qrcode.react` (React component, SSR-compatible) |
| Size | 256x256 minimum (scalable) |
| Format | PNG download |
| Content | Full queue URL (`https://domain.com/queue/[queueId]`) |
| Error Correction | Level M (15% recovery) |

**Rationale:** qrcode.react is lightweight, works with Next.js App Router, and provides React component API for easy integration.

### Queue Join Form

| Aspect | Decision |
|--------|----------|
| Fields | firstName, lastName, phone (WhatsApp format) |
| Validation | Zod schema (client + server) |
| Duplicate Prevention | Unique constraint on (phone + queueId) |
| Default Status | WAITING |
| Phone Format | Indonesian WhatsApp (+62 or 08 prefix) |

### Admin Dashboard

| Aspect | Decision |
|--------|----------|
| Display Order | FIFO (position ASC, createdAt ASC) |
| Position Display | Large badge numbers (1, 2, 3...) |
| Actions | "Call Next" button (marks as SERVED) |
| Refresh Strategy | React Query polling every 5 seconds |
| Stats | Total waiting, served count, queue name |

### FIFO Algorithm

| Aspect | Decision |
|--------|----------|
| Ordering | `orderBy: { position: 'asc' }` then `createdAt: 'asc'` |
| Position Calculation | `COUNT(entries where queueId) + 1` on join |
| Concurrency | Prisma transaction for concurrent joins |
| Position Recalculation | On removal/serving — decrement subsequent positions |

### Real-time Updates

| Aspect | Decision |
|--------|----------|
| Library | TanStack React Query (v5) |
| Polling Interval | 5 seconds |
| Strategy | Stale-while-revalidate |
| Optimistic Updates | Enabled for better UX |
| Reconnection | Automatic retry with exponential backoff |

---

## Technical Decisions

### Database Schema Additions

```prisma
model Queue {
  id         String   @id @default(cuid())
  name       String
  adminId    String
  admin      User     @relation(fields: [adminId], references: [id])
  isActive   Boolean  @default(true)
  expiresAt  DateTime // 24 hours from creation
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  entries    QueueEntry[]
}

model QueueEntry {
  id        String      @id @default(cuid())
  queueId   String
  queue     Queue       @relation(fields: [queueId], references: [id])
  firstName String
  lastName  String
  phone     String      // WhatsApp format: +62xxx
  position  Int
  status    EntryStatus @default(WAITING)
  createdAt DateTime    @default(now())
  servedAt  DateTime?

  @@unique([phone, queueId]) // Prevent duplicate joins
}

enum EntryStatus {
  WAITING
  SERVED
  NO_SHOW
}
```

### Queue Creation API (Server Action)

```typescript
// app/actions/queue.ts
export async function createQueue(name: string): Promise<Queue> {
  const admin = await getCurrentUser(); // NextAuth session
  
  const queue = await prisma.queue.create({
    data: {
      name,
      adminId: admin.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });
  
  return queue;
}
```

### QR Code Component

```typescript
// components/qr-code-generator.tsx
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  value: string; // Full queue URL
  size?: number;
  onDownload?: () => void;
}

export function QRCodeGenerator({ value, size = 256 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  const handleDownload = () => {
    // Convert SVG to PNG and trigger download
  };
  
  return (
    <div>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        includeMargin={true}
      />
      <Button onClick={handleDownload}>Download PNG</Button>
    </div>
  );
}
```

### Queue Join Form Validation (Zod)

```typescript
// lib/schemas/queue-join.ts
import { z } from 'zod';

export const queueJoinSchema = z.object({
  firstName: z.string().min(1, "First name required").max(50),
  lastName: z.string().min(1, "Last name required").max(50),
  phone: z.string()
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, "Invalid WhatsApp number")
    .transform((val) => {
      // Normalize to +62 format
      if (val.startsWith('0')) return '+62' + val.slice(1);
      if (val.startsWith('62')) return '+' + val;
      return val;
    }),
});

export type QueueJoinInput = z.infer<typeof queueJoinSchema>;
```

### FIFO Join Logic (Transaction)

```typescript
// app/actions/queue-join.ts
export async function joinQueue(queueId: string, data: QueueJoinInput) {
  return await prisma.$transaction(async (tx) => {
    // Check for duplicate
    const existing = await tx.queueEntry.findUnique({
      where: {
        phone_queueId: {
          phone: data.phone,
          queueId,
        },
      },
    });
    
    if (existing) {
      throw new Error("You already joined this queue");
    }
    
    // Calculate position
    const count = await tx.queueEntry.count({
      where: { queueId, status: 'WAITING' },
    });
    
    // Create entry
    const entry = await tx.queueEntry.create({
      data: {
        queueId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        position: count + 1,
        status: 'WAITING',
      },
    });
    
    return entry;
  });
}
```

### Position Recalculation (On Serve)

```typescript
// app/actions/queue-serve.ts
export async function callNext(queueId: string) {
  return await prisma.$transaction(async (tx) => {
    // Find next waiting person
    const nextEntry = await tx.queueEntry.findFirst({
      where: { queueId, status: 'WAITING' },
      orderBy: { position: 'asc' },
    });
    
    if (!nextEntry) return null;
    
    // Mark as served
    await tx.queueEntry.update({
      where: { id: nextEntry.id },
      data: { status: 'SERVED', servedAt: new Date() },
    });
    
    // Decrement positions of remaining waiting entries
    await tx.queueEntry.updateMany({
      where: { 
        queueId, 
        status: 'WAITING',
        position: { gt: nextEntry.position },
      },
      data: { position: { decrement: 1 } },
    });
    
    return nextEntry;
  });
}
```

### React Query Hooks

```typescript
// hooks/useQueue.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useQueue(queueId: string) {
  return useQuery({
    queryKey: ['queue', queueId],
    queryFn: () => fetch(`/api/queue/${queueId}`).then(r => r.json()),
    refetchInterval: 5000, // 5 seconds
    staleTime: 0,
  });
}

export function useQueueEntries(queueId: string) {
  return useQuery({
    queryKey: ['queue-entries', queueId],
    queryFn: () => fetch(`/api/queue/${queueId}/entries`).then(r => r.json()),
    refetchInterval: 5000,
  });
}

export function useCallNext() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (queueId: string) => 
      fetch('/api/queue/call-next', {
        method: 'POST',
        body: JSON.stringify({ queueId }),
      }).then(r => r.json()),
    onSuccess: (_, queueId) => {
      queryClient.invalidateQueries(['queue-entries', queueId]);
      queryClient.invalidateQueries(['queue', queueId]);
    },
  });
}
```

### React Query Provider Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## Security Decisions

| Concern | Mitigation |
|---------|------------|
| Queue ID enumeration | cuid() is collision-resistant, not sequential |
| Duplicate queue joins | Database unique constraint (phone + queueId) |
| Phone number privacy | Store encrypted, mask in admin UI (+62xxx***123) |
| Queue expiration | Auto-delete after 24h (cron job in Phase 4) |
| API rate limiting | Per-IP limits on join endpoint (prevent spam) |
| Admin authorization | NextAuth session check on all queue mutations |
| Input validation | Zod schema on client + server (defense in depth) |
| SQL injection | Prisma parameterized queries (automatic protection) |

---

## UI/UX Decisions

### Queue Public Page (`/queue/[queueId]`)

| Element | Design |
|---------|--------|
| Header | Queue name, current position count |
| QR Code | Prominent display at top |
| Join Form | firstName, lastName, phone inputs |
| Success State | Show position number, "You are #X in line" |
| Error State | Clear message for duplicates, expired queue |

### Admin Dashboard (`/dashboard/queues/[queueId]`)

| Element | Design |
|---------|--------|
| Queue List | Card layout with name, created time, waiting count |
| Entry List | Table with position, name, phone, status, join time |
| Call Next Button | Prominent primary action button |
| Stats Bar | "Waiting: X | Served: Y | Total: Z" |
| Auto-refresh | Visual indicator when refreshing (spinner/badge) |

### Mobile Responsiveness

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Single column, stacked form fields |
| Tablet (640-1024px) | Two-column form, side-by-side stats |
| Desktop (>1024px) | Full dashboard layout with sidebar |

---

## Gray Areas Resolved

### Q: What happens when queue expires?
**A:** Queue becomes read-only, new joins rejected with "Queue expired" message. Existing entries remain viewable. Actual deletion handled by Phase 4 cron job.

### Q: Can admin manually remove someone from queue?
**A:** Not in Phase 3 — only "Call Next" (mark as SERVED). Manual removal can be added post-MVP.

### Q: What if two people join at exact same time?
**A:** Prisma transaction ensures atomic position calculation. One gets position N, other gets N+1.

### Q: Should queue URL be shareable?
**A:** Yes — anyone with URL can join. No additional access control for MVP.

### Q: Phone number format validation — how strict?
**A:** Indonesian WhatsApp format only (+62 or 08 prefix). Normalize to +62 format on save.

### Q: What if admin closes dashboard and reopens?
**A:** React Query cache persists, immediate UI show, then background refresh.

---

## Out of Scope (Deferred)

- Manual queue entry removal (only "Call Next" in Phase 3)
- Queue pause/resume functionality
- Multiple queue support per admin (one queue per admin for MVP)
- Queue analytics/history
- Export queue data (CSV, PDF)
- Custom queue expiration times (fixed 24h for MVP)
- International phone formats (Indonesia only for MVP)
- Queue categories/tags

---

## Research Handoff

**For Researcher Agent:**
Research the following before planning:
1. `qrcode.react` latest API and Next.js App Router compatibility
2. TanStack React Query v5 best practices for polling
3. Prisma transaction performance with concurrent writes
4. Zod schema patterns for server action validation
5. Optimal React Query cache configuration for real-time dashboards

**Key Questions:**
- Does qrcode.react work with Next.js 15 Server Components?
- What's the optimal polling interval vs. server load trade-off?
- How to handle React Query reconnection after network loss?

---

## Verification Criteria

Phase 3 is complete when:

### 3.1 Queue Generation
- [ ] Admin can create queue with unique name
- [ ] Queue ID generated with cuid()
- [ ] Queue URL accessible at `/queue/[queueId]`
- [ ] Queue expires after 24 hours

### 3.2 QR Code Generation
- [ ] QR code displays on queue page
- [ ] QR code contains full queue URL
- [ ] Download as PNG works
- [ ] QR code scans correctly (tested with phone)

### 3.3 Queue Join Form
- [ ] Form validates firstName, lastName, phone
- [ ] Phone format validated (Indonesian WhatsApp)
- [ ] Duplicate prevention working (same phone + queue)
- [ ] Success message shows position number
- [ ] Error messages clear and actionable

### 3.4 Admin Dashboard
- [ ] Queue list shows all admin queues
- [ ] Entries displayed in FIFO order
- [ ] Position numbers visible
- [ ] "Call Next" button marks entry as SERVED
- [ ] Stats show waiting count, served count

### 3.5 FIFO Algorithm
- [ ] Position calculated correctly on join (COUNT + 1)
- [ ] Concurrent joins handled (tested with rapid submissions)
- [ ] Position recalculation on serve (decrement subsequent)
- [ ] Database unique constraint prevents duplicates

### 3.6 Real-time Updates
- [ ] Dashboard refreshes every 5 seconds
- [ ] React Query devtools show polling
- [ ] Optimistic updates feel instant
- [ ] Reconnection works after network loss
- [ ] No duplicate entries from polling

---

## Dependencies

**Requires Phase 2:**
- Prisma schema extended with Queue, QueueEntry models
- NextAuth.js session available for admin identification
- Database migrations applied

**Blocks Phase 4:**
- Queue entries needed for WhatsApp notifications
- Position tracking needed for "next in queue" trigger

---

## Next Steps

1. Run `/gsd-plan-phase 3` — Research and create detailed plans for all 6 sub-plans
2. Execute plans with `/gsd-execute-phase 3`
3. Verify with `/gsd-verify-work 3`

---

*Generated autonomously — assumptions mode*
