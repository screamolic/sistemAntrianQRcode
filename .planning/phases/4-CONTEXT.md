# Phase 4 Context: Notifications & Automation

## Decision Summary

This document captures implementation decisions for Phase 4. These decisions are locked and ready for downstream agents (researcher, planner) to act without asking the user again.

---

## Core Decision: WhatsApp over SMS

**Decision:** Use Evolution-API (self-hosted WhatsApp gateway) instead of Twilio SMS

**Rationale:**
- Higher open rates for WhatsApp vs SMS (98% vs 20%)
- No per-message costs (self-hosted vs Twilio pricing)
- Better for Indonesia market (WhatsApp dominance)
- Rich media support (can send queue QR codes, links)
- Two-way communication potential (users can reply)

**Trade-offs Accepted:**
- Must maintain own Evolution-API instance (Docker)
- WhatsApp Business API connection required
- Connection stability depends on self-hosted instance
- Meta/WhatsApp policy compliance needed

---

## Architecture Decisions

### Evolution-API Deployment

| Aspect | Decision |
|--------|----------|
| Deployment | Docker container |
| Hosting | Same VPS as database (or local development) |
| Connection | WhatsApp Business API via QR code pairing |
| API Access | REST API from Next.js backend |

### Notification Service

| Aspect | Decision |
|--------|----------|
| Pattern | Service layer with queue integration |
| Trigger | Position 3 in queue (user is "next") |
| Rate Limiting | 1 message per 5 minutes per user |
| Retry Strategy | 3 retries with exponential backoff |
| Fallback | Log failure, notify admin on dashboard |

### Message Templates

| Template | Content |
|----------|---------|
| `queue_next` | "Be ready you are next in queue at [queueName]. Please proceed to the counter." |
| `queue_welcome` | "You joined queue at [queueName]. Your position: #[position]. Total waiting: [count] people." |
| `queue_update` | "Queue update: Your position is now #[position]. Estimated wait: [time] minutes." |

---

## Technical Decisions

### Evolution-API Configuration

```yaml
version: '3.8'
services:
  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgresql://...
      - API_KEY=<generated>
    volumes:
      - evolution_data:/evolution/storage
```

### Next.js Integration

| Layer | Implementation |
|-------|----------------|
| API Route | `/api/notifications/whatsapp` |
| Service | `lib/whatsapp.ts` |
| Queue Hook | Trigger on position change in `useQueue` hook |
| Rate Limit | `express-rate-limit` middleware |

### Database Schema Addition

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  queueId   String
  type      String   // 'queue_next', 'queue_welcome', 'queue_update'
  status    String   // 'pending', 'sent', 'failed'
  sentAt    DateTime?
  attempts  Int      @default(0)
  errorMessage String?
  
  user User @relation(fields: [userId], references: [id])
  queue Queue @relation(fields: [queueId], references: [id])
}
```

---

## Security Decisions

| Concern | Mitigation |
|---------|------------|
| API Key exposure | Store in environment variables, never commit |
| Rate limiting abuse | Per-user + per-IP limits |
| Phone number privacy | Encrypt at rest, mask in logs |
| Message spam | User opt-in required, unsubscribe option |
| Connection hijacking | Evolution-API authentication, IP whitelist |

---

## Deployment Decisions

| Component | Hosting |
|-----------|---------|
| Next.js App | Vercel (edge + serverless) |
| Evolution-API | VPS (same as PostgreSQL or local) |
| PostgreSQL | Vercel Postgres or Supabase |
| Cron Jobs | Vercel Cron (daily cleanup) |

**Note:** Evolution-API cannot run on Vercel (requires persistent WebSocket connection). Must be deployed on VPS with Docker.

---

## Testing Decisions

| Test Type | Coverage |
|-----------|----------|
| Unit | WhatsApp service functions, rate limiting |
| Integration | Evolution-API connection, message sending |
| E2E | Full notification flow (queue join → position change → message) |
| Manual | QR code pairing, message delivery verification |

---

## Out of Scope (Phase 4)

- Two-way WhatsApp communication (user replies)
- Broadcast messages to all queue members
- Rich media messages (images, documents)
- WhatsApp button templates
- Multi-language message templates

These can be added in Phase 2 or as post-MVP enhancements.

---

## Research Handoff

**For Researcher Agent:**
Research the following before planning:
1. Evolution-API latest version and deployment best practices
2. WhatsApp Business API connection process
3. Message template approval requirements
4. Rate limiting strategies for notification services
5. VPS options for Evolution-API hosting (cost, reliability)

**For Planner Agent:**
Create plans for:
1. Evolution-API Docker setup
2. Next.js WhatsApp service integration
3. Rate limiting implementation
4. Notification database schema + Prisma migration
5. Vercel cron job for daily cleanup
6. Error handling and retry logic

---

## Verification Criteria

Phase 4 is complete when:
- [ ] Evolution-API running in Docker
- [ ] WhatsApp connection established (QR paired)
- [ ] Test message sent successfully from Next.js
- [ ] Notification triggered at position 3
- [ ] Rate limiting working (tested with rapid requests)
- [ ] Failed messages logged and retried
- [ ] Daily cron job configured and tested
- [ ] Notification preferences UI allows opt-out

---

*Created: 31 March 2026 — Phase 4 Context for WhatsApp Notifications*
