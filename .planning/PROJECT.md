# QueueAutomation Modernization

## What This Is

A **full rewrite** of the QueueAutomation QR Code-based Queue Management System — modernizing from Next.js 12 (Pages Router) to Next.js 15 (App Router) with TypeScript, Tailwind CSS + shadcn/ui, PostgreSQL + Prisma ORM, and NextAuth.js for authentication.

## Core Value

Enable businesses to manage physical queues digitally through QR code scanning, automated SMS notifications, and real-time queue management — with enterprise-grade security, performance, and developer experience.

## Context

### Current State (Legacy System)

**Stack:**
- Next.js 12.0.7 (Pages Router)
- React 17.0.2
- MongoDB 4.x (no ORM)
- Bootstrap + Semantic UI + MDB (overlapping frameworks)
- Twilio SMS API
- Cookie-based session (admin `_id` stored in browser)

**Critical Issues Identified:**
1. Plain text password storage in MongoDB
2. No API authentication — all endpoints publicly accessible
3. Cookie sessions without security flags (XSS/CSRF vulnerable)
4. SMS API without rate limiting (financial exposure)
5. No input sanitization (NoSQL injection risk)
6. Hardcoded super admin ID throughout codebase
7. 0% test coverage
8. Outdated dependencies (3+ years behind)

**Existing Features:**
- Admin authentication (login/signup)
- Queue creation with QR code generation
- User registration via QR scan
- FIFO queue management
- SMS notifications ("You are next")
- Daily queue auto-reset
- Super admin panel

### Target State (Modernized System)

**Stack:**
- Next.js 15 (App Router, Server Components, Server Actions)
- React 19
- TypeScript (strict mode)
- PostgreSQL + Prisma ORM
- Tailwind CSS + shadcn/ui
- NextAuth.js (email/password + OAuth ready)
- Evolution-API (self-hosted WhatsApp gateway)
- Vercel deployment
- Vitest + Playwright (testing)

**Improvements:**
- Type-safe full-stack development
- Secure authentication with NextAuth.js
- Database migrations with Prisma
- Modern UI/UX with accessible components
- API route handlers with proper validation
- Server-side rendering and streaming
- Comprehensive test coverage
- CI/CD pipeline with automated checks

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rewrite vs incremental | Security vulnerabilities too extensive; incremental would take 8-10 weeks vs 2-3 weeks for rewrite | Complete rewrite with modern stack |
| Next.js 15 App Router | Industry standard, better performance, Server Components reduce client bundle | Migrate from Pages Router |
| TypeScript | Type safety catches bugs early, better DX, self-documenting code | Full TypeScript conversion |
| Tailwind + shadcn/ui | Lightweight, customizable, modern design system | Replace Bootstrap/Semantic UI/MDB |
| PostgreSQL + Prisma | Better relational data integrity, Prisma provides type-safe queries | Migrate from MongoDB |
| NextAuth.js | Production-ready auth with OAuth support, secure sessions | Replace cookie-based auth |
| Vercel deployment | Optimized for Next.js, zero-config deployments, edge functions | Primary deployment target |
| Evolution-API over Twilio SMS | WhatsApp has higher open rates, self-hosted = no per-message costs, better for Indonesia market | Self-hosted WhatsApp gateway |

## Requirements

### Validated

(None yet — these are hypotheses from legacy system to be validated during rewrite)

- ✓ Admin can create and manage queues — existing (to be reimplemented)
- ✓ System generates QR codes for queue access — existing (to be reimplemented)
- ✓ Users can register via QR code scan — existing (to be reimplemented)
- ✓ Queue displays in FIFO order — existing (to be reimplemented)
- ✓ WhatsApp notification sent when user is next in line — existing (to be reimplemented)
- ✓ Queue resets daily — existing (to be reimplemented)

### Active

- [ ] Secure authentication with NextAuth.js (email/password, session management)
- [ ] Role-based access control (Admin, Super Admin)
- [ ] QR code generation with unique queue URLs
- [ ] Real-time queue updates (Server-Sent Events or WebSockets)
- [ ] WhatsApp notifications via Evolution-API (self-hosted)
- [ ] Daily automated queue cleanup (cron job)
- [ ] Mobile-responsive UI with accessibility (WCAG 2.1 AA)
- [ ] Input validation and sanitization (Zod schemas)
- [ ] API rate limiting and protection
- [ ] Comprehensive test coverage (80%+ unit, E2E critical paths)
- [ ] CI/CD pipeline with automated testing
- [ ] Performance optimization (Lighthouse 90+ scores)

### Out of Scope

- OAuth integration (Google, Facebook) — Phase 2 consideration
- Multi-language support (i18n) — Not required for initial launch
- Analytics dashboard — Phase 2 consideration
- Email notifications — WhatsApp only for MVP
- SMS notifications — Replaced by WhatsApp (Evolution-API)
- Native mobile apps — PWA consideration for Phase 2

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
