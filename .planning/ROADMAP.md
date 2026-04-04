# Roadmap — Milestone v2.0: Service Center Queue System with Drizzle + Evolution-API

## Milestone Overview

**Milestone:** v2.0  
**Title:** Service Center Queue System with Drizzle + Evolution-API  
**Goal:** Build a greenfield Service Center Queue Management System with QR code entry, comprehensive WhatsApp notifications via Evolution-API, multi-counter support, and Drizzle ORM for database operations.

**Target Features:**
- QR code scanning for queue entry (customer joins via mobile web)
- WhatsApp notifications via Evolution-API (join confirmation, queue position updates, turn called, service completed, feedback request)
- Multi-counter support with separate queues per counter
- Staff dashboard for queue management (call next, mark served, transfer)
- Real-time queue updates
- Daily automated queue reset
- NextAuth.js authentication with role-based access control
- Drizzle ORM for type-safe database operations
- Supabase PostgreSQL hosting
- Vercel deployment

**Granularity:** Standard (6-8 phases)  
**Mode:** YOLO (auto-advance enabled)

---

## Phase Summary

| Phase | Title | Requirements | Success Criteria |
|-------|-------|--------------|------------------|
| 1 | Project Foundation & Auth | AUTH-01, AUTH-02, AUTH-03, SEC-01 | Staff can log in with username/password; Roles are enforced on protected routes; Default superuser auto-created; All inputs validated with Zod |
| 2 | Database Schema & Drizzle Setup | SEC-02 | Drizzle schema matches production tables; Migrations run successfully; Rate limiting protects API endpoints |
| 3 | QR Code & Queue Entry | QUEUE-01, QUEUE-02, UI-01 | Admin can generate QR codes for counters; Customers can join queue via mobile scan; Queue view is mobile-responsive |
| 4 | Staff Dashboard & Queue Management | QUEUE-03, STAFF-01, STAFF-02, STAFF-03, STAFF-04, UI-02 | Staff can view counter queue in FIFO order; Staff can call next customer; Staff can mark as served; Staff can transfer between counters; Dashboard meets WCAG 2.1 AA |
| 5 | Evolution-API WhatsApp Integration | WA-01, WA-02, WA-03, WA-04, WA-05 | Customers receive join confirmation; Customers receive "2-3 ahead" notification; Customers receive "turn called" notification; Customers receive completion notification; Customers receive feedback request |
| 6 | Real-time Updates & Queue Display | QUEUE-04 | Queue updates propagate in real-time via SSE; No manual refresh required |
| 7 | Automation & Daily Reset | QUEUE-05 | Queue resets automatically at midnight; Old entries are cleaned up; Cleanup is logged |
| 8 | Testing & Deployment | TEST-01, TEST-02 | Unit test coverage >80%; E2E tests cover critical paths; App deployed to Vercel; Supabase database connected |

---

## Phase Details

### Phase 1: Project Foundation & Auth

**Goals:**
- Initialize Next.js 15 project with TypeScript strict mode
- Set up Drizzle ORM with Supabase PostgreSQL connection
- Implement NextAuth.js with Credentials Provider (username/password)
- Create User table with role-based access control (SUPER_ADMIN, ADMIN, STAFF)
- Set up Zod schemas for input validation
- Create basic layout with shadcn/ui components
- Auto-seed default superuser on first app start

**Requirements:**
- AUTH-01: Staff can authenticate with username/password (NextAuth.js)
- AUTH-02: Role-based access control (SUPER_ADMIN, ADMIN, STAFF)
- AUTH-03: Default superuser auto-created on first app start
- SEC-01: Input validation with Zod schemas

**Success Criteria:**
1. Staff member can log in with username/password securely
2. Default SUPER_ADMIN created automatically on first run
3. Protected routes redirect unauthenticated users to login page
4. Admin-only routes reject non-SUPER_ADMIN users with 403 error
5. All form inputs are validated with Zod schemas showing appropriate error messages
6. No signup page — access controlled by admin only

**Deliverables:**
- `/src/lib/db/drizzle.ts` - Drizzle database configuration
- `/src/lib/db/schema/users.ts` - User table schema (with username)
- `/src/lib/auth.ts` - NextAuth.js configuration (username-based)
- `/src/lib/validators/auth.ts` - Zod schemas for auth
- `/src/lib/db/seed-on-first-run.ts` - Auto-seed superuser
- `/src/app/api/auth/[...nextauth]/route.ts` - Auth API route
- `/src/app/login/page.tsx` - Login page (username field)
- `/src/middleware.ts` - Route protection middleware

---

### Phase 2: Database Schema & Drizzle Setup

**Goals:**
- Complete Drizzle schema for all tables (User, Counter, Queue, QueueEntry)
- Create database migrations with Drizzle Kit
- Set up Supabase PostgreSQL instance
- Implement rate limiting middleware for API routes
- Create seed scripts for development data

**Requirements:**
- SEC-02: API rate limiting

**Success Criteria:**
1. Drizzle schema includes all tables with proper relationships and indexes
2. `drizzle-kit generate` produces migration files without errors
3. Migrations apply successfully to Supabase database
4. API routes return 429 Too Many Requests after exceeding rate limit (100 req/15min per IP)

**Deliverables:**
- `/src/lib/db/schema/counters.ts` - Counter table schema
- `/src/lib/db/schema/queues.ts` - Queue and QueueEntry table schemas
- `/drizzle/meta/*.sql` - Migration files
- `/src/lib/rate-limit.ts` - Rate limiting utility
- `/src/scripts/seed.ts` - Database seed script
- `/src/lib/db/index.ts` - Database exports

---

### Phase 3: QR Code & Queue Entry

**Goals:**
- Implement counter creation with QR code generation
- Create customer-facing queue join flow (mobile web)
- Generate unique QR codes linking to queue join pages
- Build mobile-responsive queue position display

**Requirements:**
- QUEUE-01: Admin can create service counters with unique QR codes
- QUEUE-02: Customer scans QR code to join queue via mobile web
- UI-01: Mobile-responsive customer queue view

**Success Criteria:**
1. Admin can create a counter, and system generates a downloadable QR code image
2. Customer scanning QR code lands on mobile-friendly join page
3. Customer can enter phone number and join queue, receiving confirmation
4. Queue view displays current position, total count, and estimated wait on mobile devices

**Deliverables:**
- `/src/app/admin/counters/create/page.tsx` - Counter creation form
- `/src/app/api/counters/route.ts` - Counter CRUD API
- `/src/lib/qr.ts` - QR code generation utility
- `/src/app/q/[counterId]/page.tsx` - Customer queue join page
- `/src/app/api/queue/join/route.ts` - Queue join API
- `/src/components/qr-code-generator.tsx` - QR code display component
- `/src/components/queue-position-display.tsx` - Customer queue view

---

### Phase 4: Staff Dashboard & Queue Management

**Goals:**
- Build staff dashboard for counter queue management
- Implement "Call Next" functionality
- Implement "Mark Served" functionality
- Implement queue transfer between counters
- Ensure WCAG 2.1 AA accessibility compliance

**Requirements:**
- QUEUE-03: Queue displays in FIFO order per counter
- STAFF-01: Staff dashboard to view assigned counter queue
- STAFF-02: Staff can call next customer
- STAFF-03: Staff can mark customer as served
- STAFF-04: Staff can transfer customer to different counter
- UI-02: Accessible staff dashboard (WCAG 2.1 AA)

**Success Criteria:**
1. Staff dashboard shows queue entries in FIFO order with customer details
2. Clicking "Call Next" removes first person from queue and triggers WhatsApp notification
3. Clicking "Mark Served" updates customer status to served
4. "Transfer" modal allows selecting different counter and moves customer
5. Dashboard is fully navigable via keyboard with proper ARIA labels
6. Color contrast ratios meet 4.5:1 minimum

**Deliverables:**
- `/src/app/admin/dashboard/page.tsx` - Staff dashboard
- `/src/app/api/queue/call-next/route.ts` - Call next API
- `/src/app/api/queue/mark-served/route.ts` - Mark served API
- `/src/app/api/queue/transfer/route.ts` - Transfer API
- `/src/components/staff/queue-list.tsx` - Queue list component
- `/src/components/staff/transfer-modal.tsx` - Transfer dialog
- `/src/lib/accessibility.ts` - Accessibility utilities

---

### Phase 5: Evolution-API WhatsApp Integration

**Goals:**
- Set up Evolution-API connection and configuration
- Implement all 5 WhatsApp notification types
- Create message templates for each notification type
- Handle delivery failures and retries

**Requirements:**
- WA-01: WhatsApp notification when customer joins queue (confirmation)
- WA-02: WhatsApp notification when turn is approaching (2-3 people ahead)
- WA-03: WhatsApp notification when it's customer's turn
- WA-04: WhatsApp notification when service is completed
- WA-05: WhatsApp feedback request after completion

**Success Criteria:**
1. Customer receives WhatsApp message immediately after joining queue with position number
2. Customer receives "2-3 people ahead" notification when position reaches 3
3. Customer receives "Your turn is now" notification when called by staff
4. Customer receives "Service completed" notification after being marked served
5. Customer receives feedback request with survey link 1 hour after completion
6. Failed messages are logged and retried up to 3 times

**Deliverables:**
- `/src/lib/whatsapp/evolution-api.ts` - Evolution-API client
- `/src/lib/whatsapp/templates.ts` - Message templates
- `/src/app/api/whatsapp/send/route.ts` - WhatsApp send API
- `/src/lib/whatsapp/notifications.ts` - Notification orchestration
- `/src/types/whatsapp.ts` - WhatsApp type definitions
- `/src/scripts/test-whatsapp.ts` - WhatsApp integration test script

---

### Phase 6: Real-time Updates & Queue Display

**Goals:**
- Implement Server-Sent Events (SSE) for real-time queue updates
- Create public queue display screen
- Handle reconnection and offline states
- Optimize for low-latency updates

**Requirements:**
- QUEUE-04: Real-time queue updates (Server-Sent Events)

**Success Criteria:**
1. Staff dashboard updates automatically when customer joins queue (no manual refresh)
2. Queue position display updates in real-time when position changes
3. Connection drops trigger automatic reconnection with exponential backoff
4. Updates propagate within 2 seconds of database change

**Deliverables:**
- `/src/app/api/sse/queue-updates/route.ts` - SSE endpoint
- `/src/hooks/use-queue-updates.ts` - SSE client hook
- `/src/app/display/[counterId]/page.tsx` - Public queue display
- `/src/lib/sse.ts` - SSE utilities
- `/src/components/queue-display-board.tsx` - Display board component

---

### Phase 7: Automation & Daily Reset

**Goals:**
- Implement cron job for daily queue reset
- Create cleanup logic for old queue entries
- Set up logging for automated tasks
- Configure timezone-aware scheduling

**Requirements:**
- QUEUE-05: Daily automated queue reset

**Success Criteria:**
1. Queue entries older than 24 hours are automatically deleted at midnight (WIB timezone)
2. Reset job logs success/failure to database
3. Admin receives notification if reset job fails
4. Manual reset trigger available in admin panel for testing

**Deliverables:**
- `/src/lib/cron/daily-reset.ts` - Daily reset job
- `/src/app/api/admin/reset-queue/route.ts` - Manual reset API
- `/src/lib/cron/scheduler.ts` - Cron scheduler setup
- `/src/lib/logger.ts` - Logging utility
- `/src/app/admin/settings/page.tsx` - Settings page with reset trigger

---

### Phase 8: Testing & Deployment

**Goals:**
- Write unit tests for critical business logic
- Create E2E tests for critical user paths
- Set up Vercel deployment configuration
- Configure Supabase production database
- Achieve Lighthouse score >90

**Requirements:**
- TEST-01: Unit tests for critical logic (80%+ coverage)
- TEST-02: E2E tests for critical user paths

**Success Criteria:**
1. Unit test coverage report shows >80% for src/ directory
2. E2E tests pass for: login, create counter, join queue, call next, mark served
3. App deploys successfully to Vercel production environment
4. Production database connected and migrations applied
5. Lighthouse audit scores: Performance >90, Accessibility >90, Best Practices >90, SEO >90

**Deliverables:**
- `/src/**/*.test.ts` - Unit test files
- `/tests/e2e/**/*.spec.ts` - Playwright E2E tests
- `/vercel.json` - Vercel configuration
- `/src/env.ts` - Environment variable validation
- `/playwright.config.ts` - Playwright configuration
- `.github/workflows/ci.yml` - CI/CD pipeline
- `/lighthouserc.json` - Lighthouse CI configuration

---

## Traceability Matrix

### Requirements Coverage

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | ✅ Implemented |
| AUTH-02 | Phase 1 | ✅ Implemented |
| AUTH-03 | Phase 1 | ✅ Implemented |
| QUEUE-01 | Phase 3 | Mapped |
| QUEUE-02 | Phase 3 | Mapped |
| QUEUE-03 | Phase 4 | Mapped |
| QUEUE-04 | Phase 6 | Mapped |
| QUEUE-05 | Phase 7 | Mapped |
| WA-01 | Phase 5 | Mapped |
| WA-02 | Phase 5 | Mapped |
| WA-03 | Phase 5 | Mapped |
| WA-04 | Phase 5 | Mapped |
| WA-05 | Phase 5 | Mapped |
| STAFF-01 | Phase 4 | Mapped |
| STAFF-02 | Phase 4 | Mapped |
| STAFF-03 | Phase 4 | Mapped |
| STAFF-04 | Phase 4 | Mapped |
| UI-01 | Phase 3 | Mapped |
| UI-02 | Phase 4 | Mapped |
| SEC-01 | Phase 1 | Mapped |
| SEC-02 | Phase 2 | Mapped |
| TEST-01 | Phase 8 | Mapped |
| TEST-02 | Phase 8 | Mapped |

**Coverage:** 23/23 Active requirements mapped (100%)

### User Story Coverage

| User Story | Related Requirements | Phase |
|------------|---------------------|-------|
| US-1: Admin Login | AUTH-01 | Phase 1 |
| US-2: ~~Admin Signup~~ | — | **REMOVED** |
| US-3: Super Admin Access | AUTH-02 | Phase 1 |
| US-4: Logout | AUTH-01 | Phase 1 |
| US-5: Create Queue | QUEUE-01 | Phase 3 |
| US-6: View Queue | QUEUE-03, STAFF-01 | Phase 4, 6 |
| US-7: Call Next Person | STAFF-02, WA-03 | Phase 4, 5 |
| US-9: Scan QR to Join | QUEUE-02 | Phase 3 |
| US-10: Queue Position Updates | QUEUE-04, UI-01 | Phase 3, 6 |
| US-11: WhatsApp Notification | WA-01, WA-02, WA-03 | Phase 5 |
| US-12: Daily Queue Reset | QUEUE-05 | Phase 7 |
| US-13: Default Superuser Auto-Seed | AUTH-03 | Phase 1 |

**Coverage:** 12/12 User Stories mapped (1 removed: US-2)

---

## Dependencies & Risks

### External Dependencies
- **Supabase**: PostgreSQL hosting with realtime features
- **Evolution-API**: Self-hosted WhatsApp gateway (requires VPS)
- **Vercel**: Frontend deployment and serverless functions
- **NextAuth.js**: Authentication provider

### Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Evolution-API downtime | WhatsApp notifications fail | Implement retry logic, queue messages, fallback to SMS |
| Supabase connection limits | Queue joins fail under load | Use connection pooling, implement queuing |
| SSE connection drops | Real-time updates fail | Implement reconnection logic, fallback to polling |
| Vercel serverless timeout | Long-running operations fail | Use background jobs, optimize query performance |

### Assumptions
- Evolution-API instance is accessible from Vercel serverless functions
- Supabase PostgreSQL supports required realtime features
- Staff have stable internet connection for dashboard access
- Customers have WhatsApp installed on mobile devices

---

## Success Metrics

### Milestone Completion Criteria
- [ ] All 8 phases completed and verified
- [ ] 100% Active requirements implemented
- [ ] Unit test coverage >80%
- [ ] E2E tests pass for all critical paths
- [ ] Lighthouse scores >90 in all categories
- [ ] Production deployment successful on Vercel
- [ ] WhatsApp notifications working end-to-end
- [ ] Daily reset automation functional

### Performance Targets
- API response time: <200ms (p95)
- Database queries: <50ms (p95)
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Real-time update latency: <2s

---

*Created: 1 April 2026*
*Last Updated: 4 April 2026 — Auth refactor (username login, AUTH-03 added, signup removed)*
*Milestone: v2.0*
