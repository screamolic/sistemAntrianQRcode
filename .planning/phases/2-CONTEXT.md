# Phase 2: Database & Authentication — Context

**Phase Number:** 2
**Created:** 31 March 2026
**Mode:** Assumptions (auto)

---

## Decisions from Prior Context

The following decisions were already made in PROJECT.md and REQUIREMENTS.md:

### Stack Decisions (Locked)
1. **PostgreSQL** database (replacing MongoDB)
2. **Prisma ORM** for database access
3. **NextAuth.js** for authentication
4. **Credentials Provider** for email/password login
5. **JWT sessions** for stateless auth
6. **Vercel Postgres** for production hosting
7. **Local PostgreSQL** for development

### Security Requirements
1. Password hashing with bcrypt
2. Secure JWT tokens
3. Protected routes middleware
4. Role-based access control (Admin, Super Admin)
5. Session security flags

---

## Implementation Decisions (Auto-Selected)

### 2.1 Database Setup
**Decision:** Use Prisma with PostgreSQL
```bash
npm install prisma @prisma/client
npx prisma init
```

**Development:** Local PostgreSQL via Docker or installed
**Production:** Vercel Postgres integration

**DATABASE_URL format:**
- Dev: `postgresql://user:password@localhost:5432/queue_automation`
- Prod: `postgres://user:password@host:port/database?sslmode=require`

### 2.2 Prisma Schema Design
**Decision:** Three main models

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  queues    Queue[]
}

enum Role {
  ADMIN
  SUPER_ADMIN
}

model Queue {
  id         String        @id @default(cuid())
  name       String
  adminId    String
  admin      User          @relation(fields: [adminId], references: [id])
  isActive   Boolean       @default(true)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  entries    QueueEntry[]
}

model QueueEntry {
  id         String   @id @default(cuid())
  queueId    String
  queue      Queue    @relation(fields: [queueId], references: [id])
  phoneNumber String
  name       String?
  position   Int
  status     EntryStatus @default(WAITING)
  notifiedAt DateTime?
  servedAt   DateTime?
  createdAt  DateTime @default(now())
}

enum EntryStatus {
  WAITING
  SERVED
  NO_SHOW
}
```

### 2.3 NextAuth.js Configuration
**Decision:** Credentials Provider with JWT strategy

```typescript
providers: [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials, req) {
      // Find user by email
      // Verify password with bcrypt
      // Return user object without password
    }
  })
]
```

**Session Strategy:** JWT (stateless, works with Vercel edge)
**Token Encryption:** Enabled for security

### 2.4 Authentication UI
**Decision:** Simple, clean forms with shadcn/ui components

**Pages:**
- `/login` - Login form
- `/signup` - Admin signup (super admin approval required)
- `/auth/error` - Auth error page

**Components:**
- `LoginForm` - Email + password with validation
- `SignupForm` - Email, password, confirm password
- `UserMenu` - Dropdown with logout

### 2.5 Role-Based Access Control
**Decision:** Super admin detection via email whitelist

**Implementation:**
```typescript
const SUPER_ADMIN_EMAILS = process.env.SUPER_ADMIN_EMAILS?.split(',') || []

function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email)
}
```

**Middleware Protection:**
- `/dashboard/**` - Requires authentication
- `/admin/**` - Requires admin role
- `/super-admin/**` - Requires super admin role

---

## Gray Areas Resolved

### Q: PostgreSQL for local dev - Docker or direct install?
**A:** Developer choice - provide both options in setup docs. Docker is more consistent.

### Q: How to handle database migrations?
**A:** Prisma migrations - `npx prisma migrate dev` for development.

### Q: Session storage - database or JWT?
**A:** JWT tokens (stateless) - better for Vercel edge deployment.

### Q: Password reset flow?
**A:** Defer to Phase 4 (notifications) - implement with WhatsApp verification.

### Q: Email verification on signup?
**A:** Skip for MVP - super admin approves new admin accounts manually.

---

## Out of Scope (Deferred)

- Password reset flow (Phase 4 with notifications)
- OAuth providers (Google, GitHub) - credentials only for MVP
- Email verification - manual approval for now
- Two-factor authentication - post-MVP

---

## Success Criteria for Phase 2

1. ✅ PostgreSQL database running (local)
2. ✅ Prisma schema with migrations
3. ✅ User signup with password hashing (bcrypt)
4. ✅ Secure login with JWT sessions
5. ✅ Protected routes middleware
6. ✅ Super admin role detection working
7. ✅ NextAuth session accessible in client components
8. ✅ Role-based UI rendering

---

## Next Steps

1. Run `/gsd-plan-phase 2` - Research and create detailed plans
2. Execute plans with `/gsd-execute-phase 2`
3. Verify with `/gsd-verify-work 2`

---

*Generated autonomously - assumptions mode*
