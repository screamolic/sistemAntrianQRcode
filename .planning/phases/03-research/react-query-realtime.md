# Research: React Query for Real-Time Updates (2026)

**Researched:** 31 March 2026
**Phase:** 3 - Queue Core Functionality
**Focus:** TanStack Query v5, polling strategies, optimistic updates

---

## TanStack Query (React Query) v5

### Why React Query for Queue Updates

**Alternatives compared:**

| Strategy | Latency | Complexity | Cost | Best For |
|----------|---------|------------|------|----------|
| **React Query Polling** | 5s delay | Low | Free | ✅ Queue dashboards |
| WebSockets | <100ms | High | $$ | Chat, live collaboration |
| Server-Sent Events | <1s | Medium | $ | Live feeds, notifications |
| SWR | 5s delay | Low | Free | Similar to React Query |
| Manual setInterval | 5s delay | Medium | Free | Not recommended |

**Verdict:** React Query polling is optimal for queue management — 5s latency is acceptable, zero infrastructure cost, simple implementation.

---

## Installation & Setup

### Package Installation

```bash
npm install @tanstack/react-query
npm install -D @tanstack/react-query-devtools
```

### Provider Setup (Next.js 16 App Router)

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
        // Stale-while-revalidate
        staleTime: 0, // Data is immediately stale
        
        // Retry logic
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch on window focus (optional)
        refetchOnWindowFocus: false, // Disable for queue dashboards
        
        // Network mode (for offline support)
        networkMode: 'online', // Only fetch when online
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

### Root Layout Integration

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Polling Configuration

### Optimal Polling Interval for Queues

**Trade-offs:**

| Interval | Server Load | UX Freshness | Battery Impact | Recommendation |
|----------|-------------|--------------|----------------|----------------|
| 1s | Very High | Excellent | High | ❌ Overkill |
| 3s | High | Very Good | Medium | ⚠️ Aggressive |
| **5s** | **Medium** | **Good** | **Low** | ✅ **Recommended** |
| 10s | Low | Acceptable | Very Low | Alternative |
| 30s | Very Low | Poor | Minimal | ❌ Too slow |

**Recommended: 5 seconds** — balances freshness with server load

### Query Configuration

```typescript
// hooks/useQueueEntries.ts
import { useQuery } from '@tanstack/react-query';

export function useQueueEntries(queueId: string) {
  return useQuery({
    queryKey: ['queue-entries', queueId],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${queueId}/entries`);
      if (!res.ok) throw new Error('Failed to fetch entries');
      return res.json();
    },
    
    // Polling configuration
    refetchInterval: 5000, // 5 seconds
    refetchIntervalInBackground: false, // Save battery when tab is backgrounded
    
    // Stale-while-revalidate
    staleTime: 0, // Immediately stale
    refetchOnMount: 'always', // Always refetch on mount
    
    // Retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Network resilience
    networkMode: 'online',
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}
```

---

## Optimistic Updates

### Pattern for "Call Next" Action

```typescript
// hooks/useCallNext.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCallNext(queueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/queue/call-next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueId }),
      });
      if (!res.ok) throw new Error('Failed to call next');
      return res.json();
    },
    
    // Optimistic update
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['queue-entries', queueId] });
      
      // Snapshot previous value
      const previousEntries = queryClient.getQueryData(['queue-entries', queueId]);
      
      // Optimistically update (remove first waiting entry)
      queryClient.setQueryData(['queue-entries', queueId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          entries: old.entries.filter((e: any) => e.status !== 'WAITING' || e.id !== old.entries[0].id),
          stats: {
            ...old.stats,
            waiting: old.stats.waiting - 1,
            served: old.stats.served + 1,
          },
        };
      });
      
      return { previousEntries };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(['queue-entries', queueId], context.previousEntries);
      }
    },
    
    // Always refetch after mutation
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['queue-entries', queueId] });
      queryClient.invalidateQueries({ queryKey: ['queue', queueId] });
    },
  });
}
```

---

## Reconnection After Network Loss

### React Query Built-in Retry

React Query v5 handles reconnection automatically:

```typescript
// Default retry behavior
{
  retry: 3, // Retry 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
}
```

**Timeline:**
- Attempt 1: Immediate
- Attempt 2: After 2s
- Attempt 3: After 4s
- Attempt 4: After 8s (max 30s cap)

### Network Status Detection

```typescript
// hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
```

### UI Feedback for Reconnection

```typescript
// components/network-status.tsx
'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { Badge } from '@/components/ui/badge';

export function NetworkStatus() {
  const isOnline = useNetworkStatus();

  return (
    <Badge variant={isOnline ? 'default' : 'destructive'}>
      {isOnline ? 'Connected' : 'Offline - Will sync when reconnected'}
    </Badge>
  );
}
```

---

## Query Invalidation Patterns

### Manual Invalidation

```typescript
// After creating a queue
const queryClient = useQueryClient();

const createQueue = async (name: string) => {
  const res = await fetch('/api/queue', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  const queue = await res.json();
  
  // Invalidate admin's queue list
  queryClient.invalidateQueries({ queryKey: ['admin-queues'] });
  
  return queue;
};
```

### Targeted Invalidation

```typescript
// Invalidate specific query
queryClient.invalidateQueries({
  queryKey: ['queue-entries', queueId],
  exact: true, // Only invalidate exact match
});

// Invalidate all queue-related queries
queryClient.invalidateQueries({
  predicate: (query) => query.queryKey[0] === 'queue',
});
```

---

## Performance Optimization

### Selective Fetching

```typescript
// Only fetch necessary fields
const { data } = useQuery({
  queryKey: ['queue-entries', queueId],
  queryFn: async () => {
    const res = await fetch(`/api/queue/${queueId}/entries?fields=position,firstName,status`);
    return res.json();
  },
});
```

### Pagination for Large Queues

```typescript
// hooks/useQueueEntriesPaginated.ts
export function useQueueEntriesPaginated(queueId: string, page: number) {
  return useQuery({
    queryKey: ['queue-entries', queueId, page],
    queryFn: async () => {
      const res = await fetch(`/api/queue/${queueId}/entries?page=${page}&limit=50`);
      return res.json();
    },
    keepPreviousData: true, // Show previous page while loading new one
  });
}
```

---

## Debugging with Devtools

### React Query Devtools

```typescript
// Already included in providers.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

**Features:**
- View all active queries
- See query state (loading, success, error)
- Manually invalidate queries
- Inspect query cache
- View query timing

---

## Key Findings

1. **5-second polling** is optimal for queue dashboards
2. **Optimistic updates** provide instant UX feedback
3. **Exponential backoff** handles network issues gracefully
4. **Query invalidation** keeps cache fresh after mutations
5. **Devtools** are essential for debugging

---

## Recommendations for Phase 3

- Use TanStack Query v5 with 5s polling interval
- Implement optimistic updates for "Call Next" action
- Enable React Query Devtools in development
- Use exponential backoff for retries (default behavior)
- Invalidate queries after mutations
- Show network status indicator for admin dashboard
- Disable background polling to save battery

---

**Sources:**
- TanStack Query v5 Docs: https://tanstack.com/query/v5/docs
- React Query Best Practices: https://tkdodo.eu/blog/
- Next.js 16 + React Query: https://nextjs.org/docs/app/building-your-application/data-fetching
