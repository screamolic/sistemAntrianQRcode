# Phase 1 Context — Project Foundation & Auth

**Phase:** 1  
**Milestone:** v2.0  
**Created:** 1 April 2026  
**Status:** Ready for planning

---

## Decisions Summary

This document captures implementation decisions that downstream agents (researcher, planner) need to act without asking the user again.

---

## Database & ORM

### Drizzle Setup

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration approach | **Clean break** | Remove Prisma entirely, start fresh with Drizzle schema. v2.0 is greenfield build. |
| Connection method | **Direct PostgreSQL** | Standard Drizzle with Supabase connection string. Simple, performant, type-safe. |
| User data | **Fresh start** | Drop and recreate User table. Users re-register in new system. |
| Existing Prisma | **Remove completely** | Remove `@prisma/client`, `prisma` package, `prisma/` directory. |

### Supabase Configuration

- Use existing Supabase instance: `lzfrvgplqwhmgtzkvima.supabase.co`
- Database: `postgres` (default)
- Connection via environment variable `DATABASE_URL`
- SSL required (`sslmode=require`)

---

## Authentication

### NextAuth.js Configuration

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Session strategy | **JWT sessions** | Stateless, scales better, matches current setup. No DB session overhead. |
| Auth provider | **Credentials Provider** | Email/password authentication for MVP. OAuth deferred to Phase 2. |
| Password hashing | **bcryptjs** | Continue using existing bcryptjs (already installed). |
| Password requirements | **8+ characters minimum** | Simple requirement for MVP. Can strengthen in Phase 2. |

### Auth Pages

- **Login page**: `/login` — Email/password form
- **Signup page**: `/signup` — Registration for new staff accounts
- **Password reset**: Deferred (not in Phase 1)

### Role-Based Access Control

- **Roles**: `admin` and `staff`
- **Super admin**: Defined by `SUPER_ADMIN_EMAILS` env var (comma-separated)
- **Protected routes**: Middleware-based protection
- **Admin-only routes**: Explicit role checks in pages/APIs

---

## Security

### Input Validation

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Validation library | **Zod v4** | Already installed. Type-safe schemas. |
| Schema location | `/src/lib/validators/` | Dedicated directory for Zod schemas |
| Validation scope | **All user inputs** | Forms, API routes, server actions |

### Rate Limiting

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Approach | **Fresh implementation** | New rate limiter built for Drizzle. Don't migrate old code. |
| Storage | **In-memory (LRU cache)** | Simple for MVP. Can upgrade to Redis in Phase 2. |
| Limits | **100 req/15min per IP** | Standard rate limit for API routes |
| Auth routes | **Stricter limits** | 5 req/15min for login/signup to prevent brute force |

---

## Environment Variables

### Required (validated at startup)

```env
DATABASE_URL          # Supabase PostgreSQL connection
AUTH_SECRET           # NextAuth JWT signing secret
AUTH_URL              # Base URL for auth callbacks
```

### Required for Production

```env
SUPER_ADMIN_EMAILS    # Comma-separated admin emails
```

### Optional (Phase 1 doesn't need)

```env
EVOLUTION_API_URL     # WhatsApp notifications (Phase 5)
EVOLUTION_API_KEY
EVOLUTION_INSTANCE_NAME
CRON_SECRET           # Cron jobs (Phase 7)
```

---

## Seed Data

### Super Admin Seed Script

- **Purpose**: Create initial super admin for testing
- **Method**: npm script `npm run seed:admin`
- **Input**: Uses `SUPER_ADMIN_EMAILS` from env
- **Password**: Temporary password printed to console (force change on first login — Phase 2)

---

## File Structure

### New Files to Create

```
/src/lib/
  db/
    drizzle.ts           # Drizzle client configuration
    schema/
      users.ts           # User table schema
    index.ts             # DB exports
  validators/
    auth.ts              # Zod schemas for auth
  rate-limiter.ts        # Fresh rate limiter implementation
  auth.ts                # NextAuth configuration (updated)
  env.ts                 # Environment validation

/src/app/
  login/page.tsx         # Login page
  signup/page.tsx        # Signup page
  api/auth/[...nextauth]/route.ts  # NextAuth API route

/src/middleware.ts       # Route protection (updated)

/scripts/
  seed-admin.ts          # Super admin seed script
```

### Files to Remove

```
/prisma/                 # Prisma schema and migrations
prisma.config.ts         # Prisma configuration
src/lib/prisma.ts        # Prisma client singleton
```

---

## Dependencies

### To Install

```bash
# Drizzle ORM
npm install drizzle-orm postgres

# Drizzle Kit (dev)
npm install -D drizzle-kit
```

### To Remove

```bash
npm uninstall @prisma/client prisma @prisma/adapter-pg pg
```

---

## Success Criteria (from Roadmap)

Phase 1 is complete when:

1. ✅ Staff member can sign up with email/password and log in securely
2. ✅ Protected routes redirect unauthenticated users to login page
3. ✅ Admin-only routes reject Staff role users with 403 error
4. ✅ All form inputs are validated with Zod schemas showing appropriate error messages

---

## Technical Decisions for Planner

### Drizzle Schema Design

```typescript
// users table
{
  id: string (cuid2)
  email: string (unique, indexed)
  password: string (hashed)
  name: string
  role: 'admin' | 'staff'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### NextAuth JWT Token Shape

```typescript
{
  id: string
  email: string
  role: 'admin' | 'staff'
}
```

### Session Object Extension

```typescript
interface Session {
  user: {
    id: string
    email: string
    role: 'admin' | 'staff'
  }
}
```

---

## Migration Checklist

### Phase 1 Execution Steps

1. [ ] Install Drizzle dependencies
2. [ ] Remove Prisma dependencies
3. [ ] Create Drizzle configuration
4. [ ] Create User schema
5. [ ] Generate migration
6. [ ] Apply migration to Supabase
7. [ ] Update NextAuth config to use Drizzle
8. [ ] Create Zod validators
9. [ ] Create fresh rate limiter
10. [ ] Update middleware
11. [ ] Create login/signup pages
12. [ ] Create seed script
13. [ ] Test authentication flow
14. [ ] Remove old Prisma files

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase connection fails | Blocked on DB setup | Test connection string before starting. Use SSL mode. |
| NextAuth migration breaks auth | Users can't login | Fresh start — no existing users to migrate. Test thoroughly. |
| Rate limiter too strict | Legitimate users blocked | Start with generous limits, tune based on usage. |
| Zod v4 API changes | Validation errors | Check Zod v4 docs for breaking changes from v3. |

---

## Assumptions

- Supabase instance is accessible and has PostgreSQL running
- Node.js 18+ available (required for Next.js 15)
- Development on localhost:3090 (from .env AUTH_URL)
- bcryptjs works with Next.js 15 Server Components
- NextAuth.js v5 beta is stable enough for production use

---

## Open Questions (Deferred to Planning)

These will be answered by the planner agent:

1. Exact Drizzle configuration options (schema location, migrations folder)
2. Specific Zod schema patterns for auth validation
3. Rate limiter algorithm choice (sliding window vs token bucket)
4. Middleware route patterns for protected vs public routes

---

*Created: 1 April 2026*  
*Next: `/gsd-plan-phase 1` — Planner will use this context to create detailed implementation plan*
