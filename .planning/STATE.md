# State — Milestone v2.0

## Current Status

**Milestone:** v2.0 — ARCHIVED ✅
**Status:** Complete & Archived
**Current Phase:** Auth refactor complete (username login, no signup)
**Last Updated:** 4 April 2026

---

## Phase Status

| Phase | Title | Status | Completed |
|-------|-------|--------|-----------|
| 1 | Project Foundation & Auth | ✅ Archived + Updated | 3 April 2026 |
| 2 | Database Schema & Drizzle Setup | ✅ Archived | 3 April 2026 |
| 3 | QR Code & Queue Entry | ✅ Archived | 3 April 2026 |
| 4 | Staff Dashboard & Queue Management | ✅ Archived | 3 April 2026 |
| 5 | Evolution-API WhatsApp Integration | ✅ Archived | 3 April 2026 |
| 6 | Real-time Updates & Queue Display | ✅ Archived | 3 April 2026 |
| 7 | Automation & Daily Reset | ✅ Archived | 3 April 2026 |
| 8 | Testing & Deployment | ✅ Archived | 3 April 2026 |

**Milestone v2.0: COMPLETE & ARCHIVED** ✅

---

## Auth Refactor Summary (4 April 2026)

**Changes made:**
- ✅ Removed `/signup` page and `/api/auth/signup` route
- ✅ Added `username` column to users table (migration `0002_add-username-to-users.sql`)
- ✅ Changed login from email-based to username-based
- ✅ Auto-seed default SUPER_ADMIN on first app start
  - Default: `username=admin`, `password=Admin123!`
  - Configurable via `DEFAULT_ADMIN_USERNAME`, `DEFAULT_ADMIN_PASSWORD` env vars
- ✅ Updated login page with username field + "Hubungi administrator" message
- ✅ Removed Sign Up link from header
- ✅ Updated e2e tests for username login
- ✅ Build passes (17 routes, no `/signup`)

**New files:**
- `src/lib/db/seed-on-first-run.ts` — Auto-seeds superuser if no users exist

**Updated requirements:**
- AUTH-01: ✅ Implemented (username/password)
- AUTH-02: ✅ Implemented (SUPER_ADMIN, ADMIN, STAFF)
- AUTH-03: ✅ Implemented (default superuser auto-seed)
- US-2 (Admin Signup): **REMOVED**
- US-13 (Default Superuser Auto-Seed): **ADDED**

---

## Active Context

**Milestone v2.0 delivered:**
- Full-stack queue management system
- NextAuth.js with 3-role RBAC (SUPER_ADMIN, ADMIN, STAFF)
- Username-based login (no email required)
- Default superuser auto-created on first run
- Drizzle ORM with 6 table schemas + `username` column
- Counter CRUD with QR code generation
- Mobile-responsive queue join page
- Staff dashboard APIs (call-next, mark-served, transfer)
- WhatsApp notification service (5 types)
- SSE real-time updates
- Automated cron jobs
- 9 unit tests passing
- Build passes, lint passes

**Outstanding:**
- Database migrations pending (Supabase DNS issue)
- End-to-end testing pending (tests updated for username login)
- Vercel deployment pending

---

## Next Action

**Ready for:** Milestone v2.1 planning or continue with infrastructure setup

**Suggested:** `/gsd-new-milestone` to start v2.1

---

## Blockers

- Supabase DNS resolution failure (non-blocking, infrastructure issue)

---

*Milestone v2.0 completed and archived on 3 April 2026*
*Auth refactored on 4 April 2026 — username login, no signup, auto-seed superuser*
