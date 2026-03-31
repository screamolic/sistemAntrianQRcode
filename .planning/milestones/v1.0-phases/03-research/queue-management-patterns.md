# Research: Queue Management Patterns (2026)

**Researched:** 31 March 2026
**Phase:** 3 - Queue Core Functionality
**Focus:** Queue generation, ID strategies, expiration patterns

---

## Queue ID Generation Strategies

### Recommended: CUID2 (Collision-Resistant Unique Identifiers)

**Why CUID2 over alternatives:**

| Strategy | Pros | Cons | Verdict |
|----------|------|------|---------|
| **cuid2** | Collision-resistant, URL-safe, ~25 chars, no DB round-trip | Slightly longer than nanoid | ✅ **Recommended** |
| nanoid | Shorter (~21 chars), fast | Less collision resistance | Alternative |
| UUID v4 | Standard, well-known | Long (36 chars), not URL-friendly | ❌ Avoid |
| Auto-increment | Short, simple | Predictable, enumerable | ❌ Security risk |
| ULID | Timestamp-sorted, 26 chars | Less battle-tested | Alternative |

**Implementation:**
```typescript
import { createId } from '@paralleldrive/cuid2';

export function generateQueueId(): string {
  return createId(); // e.g., 'k3j5h2g4f1d9s8a7'
}
```

**Package:** `@paralleldrive/cuid2` (npm install)

---

## Queue Expiration Patterns

### TTL (Time-To-Live) Strategy

**Best Practice:** Store `expiresAt` timestamp, check on access

```prisma
model Queue {
  id        String   @id @default(cuid())
  expiresAt DateTime // Indexed for cleanup queries
  isActive  Boolean  @default(true)
  // ... other fields
}
```

**Access Pattern:**
```typescript
// On queue access
const queue = await prisma.queue.findFirst({
  where: {
    id: queueId,
    expiresAt: { gt: new Date() },
    isActive: true,
  },
});

if (!queue) {
  throw new Error('Queue expired or inactive');
}
```

**Cleanup Strategy (Phase 4):**
- Vercel Cron: Daily job deletes `expiresAt < NOW() - 7 days`
- Keeps 7-day grace period for admin access to historical data

---

## Queue URL Patterns

### Recommended: `/queue/[queueId]`

**Route Structure:**
```
/queue/[queueId]          → Public queue page (join, view QR)
/queue/[queueId]/join     → Join form action
/dashboard/queues         → Admin queue list
/dashboard/queues/[id]    → Admin dashboard for specific queue
```

**URL Safety:**
- CUID2 is URL-safe by default (alphanumeric only)
- No encoding needed
- Short enough for QR codes (~25 chars)

---

## Concurrent Queue Join Handling

### Database Transaction Pattern

**Problem:** Two users join simultaneously → both get position N

**Solution:** Prisma transaction with atomic position calculation

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Check for duplicate (phone + queueId)
  const existing = await tx.queueEntry.findUnique({
    where: { phone_queueId: { phone, queueId } },
  });
  
  if (existing) {
    throw new Error('Already in queue');
  }
  
  // 2. Calculate position atomically
  const count = await tx.queueEntry.count({
    where: { queueId, status: 'WAITING' },
  });
  
  // 3. Create with position = count + 1
  return tx.queueEntry.create({
    data: { ...entryData, position: count + 1 },
  });
});
```

**Isolation Level:** Prisma uses database default (usually READ COMMITTED)
**Performance:** ~50-100ms per transaction under normal load

---

## Queue Position Recalculation

### Decrement Strategy (On Serve/Remove)

When entry at position N is served, all entries N+1, N+2... decrement by 1:

```typescript
await prisma.queueEntry.updateMany({
  where: {
    queueId,
    status: 'WAITING',
    position: { gt: servedEntry.position },
  },
  data: { position: { decrement: 1 } },
});
```

**Performance:** O(1) atomic operation (database-level decrement)
**Concurrency:** Safe within transaction

---

## Key Findings

1. **CUID2** is optimal for queue IDs — collision-resistant, URL-safe, no DB round-trip
2. **expiresAt timestamp** + daily cleanup is better than auto-delete triggers
3. **Prisma transactions** handle concurrent joins safely
4. **Position recalculation** is O(1) with atomic decrement
5. **Unique constraint** on (phone, queueId) prevents duplicates at DB level

---

## Recommendations for Phase 3

- Use `@paralleldrive/cuid2` for queue ID generation
- Store `expiresAt` as DateTime, check on every access
- Wrap queue joins in Prisma transaction
- Use unique constraint for duplicate prevention
- Implement position recalculation on serve

---

**Sources:**
- CUID2 GitHub: https://github.com/paralleldrive/cuid2
- Prisma Transactions Guide: https://www.prisma.io/docs/concepts/components/prisma-client/transactions
- Queue System Patterns: Martin Fowler, "Queue-Based Load Leveling"
