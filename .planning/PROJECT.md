# QueueAutomation - Service Center Queue System

## What This Is

A **greenfield build** of a QR Code-based Queue Management System for service centers — built with Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui, PostgreSQL + Drizzle ORM, NextAuth.js for authentication, and Evolution-API for WhatsApp notifications.

## Core Value

Enable service center customers to join queues via QR code scan and receive automated WhatsApp notifications at every step — reducing wait times, improving customer experience, and giving staff complete queue control.

## Context

### Build Approach

**Greenfield Development:**
- Building from scratch with modern best practices
- No legacy code constraints
- Clean architecture from day one

**Target Stack:**
- Next.js 15 (App Router, Server Components, Server Actions)
- React 19
- TypeScript (strict mode)
- PostgreSQL + Drizzle ORM (type-safe queries)
- Tailwind CSS + shadcn/ui
- NextAuth.js (email/password + OAuth ready)
- Evolution-API (self-hosted WhatsApp gateway)
- Supabase (PostgreSQL hosting)
- Vercel deployment
- Vitest + Playwright (testing)

**Key Features:**
- QR code scanning for queue entry
- WhatsApp notifications via Evolution-API (join confirmation, queue updates, completion, feedback)
- Multi-counter support for staff
- Single location focus
- Real-time queue display
- Automated queue management

### Deployment Target

- **Frontend**: Vercel (optimized for Next.js)
- **Database**: Supabase (PostgreSQL with realtime features)
- **WhatsApp Gateway**: Evolution-API self-hosted on VPS
- **Environment**: Production-ready with CI/CD

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Greenfield build vs modernization | Existing code is Next.js 12 with Prisma; building fresh with Drizzle and clean architecture | Complete new implementation |
| Drizzle ORM over Prisma | Lighter weight, better TypeScript inference, SQL-like queries, faster runtime | Primary ORM for database |
| Next.js 15 App Router | Industry standard, Server Components reduce client bundle, better performance | Modern React patterns |
| Supabase for PostgreSQL | Managed hosting, realtime features, easy integration with Drizzle | Database hosting |
| Evolution-API over Twilio | WhatsApp has higher open rates in Indonesia, self-hosted = no per-message costs | Self-hosted WhatsApp gateway |
| Vercel deployment | Optimized for Next.js, zero-config deployments, edge functions | Primary deployment target |
| Multi-counter support | Service centers need parallel service points with separate queues | Core feature from Phase 1 |
| All WhatsApp notifications | Complete customer journey: join confirmation, queue position updates, completion, feedback | Better customer experience |

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH-01**: Staff can authenticate with email/password (NextAuth.js)
- [ ] **AUTH-02**: Role-based access control (Admin, Staff)
- [ ] **QUEUE-01**: Admin can create service counters with unique QR codes
- [ ] **QUEUE-02**: Customer scans QR code to join queue via mobile web
- [ ] **QUEUE-03**: Queue displays in FIFO order per counter
- [ ] **QUEUE-04**: Real-time queue updates (Server-Sent Events)
- [ ] **QUEUE-05**: Daily automated queue reset
- [ ] **WA-01**: WhatsApp notification when customer joins queue (confirmation)
- [ ] **WA-02**: WhatsApp notification when turn is approaching (2-3 people ahead)
- [ ] **WA-03**: WhatsApp notification when it's customer's turn
- [ ] **WA-04**: WhatsApp notification when service is completed
- [ ] **WA-05**: WhatsApp feedback request after completion
- [ ] **STAFF-01**: Staff dashboard to view assigned counter queue
- [ ] **STAFF-02**: Staff can call next customer
- [ ] **STAFF-03**: Staff can mark customer as served
- [ ] **STAFF-04**: Staff can transfer customer to different counter
- [ ] **UI-01**: Mobile-responsive customer queue view
- [ ] **UI-02**: Accessible staff dashboard (WCAG 2.1 AA)
- [ ] **SEC-01**: Input validation with Zod schemas
- [ ] **SEC-02**: API rate limiting
- [ ] **TEST-01**: Unit tests for critical logic (80%+ coverage)
- [ ] **TEST-02**: E2E tests for critical user paths

### Out of Scope

- Multi-location support — Single location focus for MVP
- OAuth integration — Phase 2 consideration
- Email notifications — WhatsApp only for MVP
- Native mobile apps — Mobile web PWA sufficient
- Analytics dashboard — Phase 2 consideration
- Appointment scheduling — Walk-in queue only for MVP

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

*Last updated: 31 March 2026 after initialization*
