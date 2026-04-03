# Phase 1: Project Foundation & Auth - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning
**Mode:** Smart Discuss (autonomous)

<domain>
## Phase Boundary

Establish the authentication and security foundation for the Queue Management System. Includes: NextAuth.js Credentials provider with 3-role RBAC (SUPER_ADMIN, ADMIN, STAFF), Drizzle ORM connection to Supabase PostgreSQL, Route middleware protection, Login/Signup UI with Zod validation, Drizzle migration run successfully, Prisma cleanup, and seed script for development.

</domain>

<decisions>
## Implementation Decisions

### Role System
- 3 roles: SUPER_ADMIN, ADMIN, STAFF (uppercase enum values)
- Field name: `passwordHash` (not `password`) — consistent with schema & auth.ts already on disk
- Role enum stays UPPERCASE — consistent with middleware (checks `"SUPER_ADMIN"`)

### Authentication
- NextAuth.js JWT strategy (already configured)
- bcryptjs for password hashing (already imported)
- Login page: add Zod + react-hook-form for client-side validation (upgrade existing page)
- Redirect after login: `/dashboard` — consistent with existing middleware

### Forms & Validation
- Login form: upgrade to react-hook-form + Zod (currently uses raw useState)
- Signup page: create new with Zod validation + react-hook-form
- Signup API route: create at `/api/auth/signup`

### Database
- Run Drizzle migration to Supabase (schema already complete in disk)
- Delete `prisma.config.ts` (not needed for greenfield build)
- Create seed script for super admin account
- Create `src/env.ts` for env var validation at startup

### the Agent's Discretion
- Auth error page path: use existing `/auth/error` (already in auth.ts pages config)
- ID generation: use `@paralleldrive/cuid2` createId() — add $defaultFn to schema
- Signup page: auto-login after successful signup

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/auth.ts` — NextAuth fully configured (Credentials, JWT, callbacks for role)
- `src/lib/db/schema/` — 6 tables complete: users, counters, queues, queue-entries, notifications, job-logs
- `src/lib/db/index.ts` — DB + schema exports
- `src/middleware.ts` — Route protection for /dashboard, /admin, /super-admin
- `src/lib/rate-limiter.ts` — LRU-based rate limiting
- `src/app/(auth)/login/page.tsx` — Login page (needs Zod upgrade)
- shadcn/ui components: Button, Input, Label, Card, Alert — all available

### Established Patterns
- Auth group route: `src/app/(auth)/` route group
- Schema pattern: `pgTable` with `text('id').primaryKey()`, timestamps with timezone
- Imports use `@/` path alias consistently
- `"use client"` for interactive forms

### Integration Points
- Login page redirects to `/dashboard` (middleware and page consistent)
- Middleware reads `req.auth?.user?.role` for SUPER_ADMIN check
- `src/types/` directory exists for type augmentation

</code_context>

<specifics>
## Specific Ideas

- Schema IDs need `$defaultFn(() => createId())` — currently `text('id').primaryKey()` has no auto-generation
- PLAN.md Wave 1.1 specifies removing Prisma packages — check if actually installed first
- Seed script should create 1 SUPER_ADMIN account using SUPER_ADMIN_EMAILS env var

</specifics>

<deferred>
## Deferred Ideas

- OAuth integration (GitHub, Google) — Out of scope for MVP per PROJECT.md
- Password reset via email — Phase 2 consideration
- Session expiry configuration — defaults are acceptable for now

</deferred>
