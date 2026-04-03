# Phase 1 Plan — Project Foundation & Auth

**Phase:** 1  
**Milestone:** v2.0  
**Created:** 1 April 2026  
**Status:** Ready for execution  

---

## Phase Overview

This phase establishes the foundational authentication and security layer for the Queue Automation system. We are migrating from Prisma to Drizzle ORM, implementing NextAuth.js with role-based access control, and setting up Zod validation for all user inputs.

### Goals
- Initialize Next.js 15 project with TypeScript strict mode
- Set up Drizzle ORM with Supabase PostgreSQL connection
- Implement NextAuth.js with Credentials Provider (email/password)
- Create User table with role-based access control (Admin, Staff)
- Set up Zod schemas for input validation
- Create basic layout with shadcn/ui components

### Requirements
- **AUTH-01**: Staff can authenticate with email/password (NextAuth.js)
- **AUTH-02**: Role-based access control (Admin, Staff)
- **SEC-01**: Input validation with Zod schemas

### Success Criteria
1. Staff member can sign up with email/password and log in securely
2. Protected routes redirect unauthenticated users to login page
3. Admin-only routes reject Staff role users with 403 error
4. All form inputs are validated with Zod schemas showing appropriate error messages

---

## Wave 1: Setup & Dependencies

**Goal:** Clean migration from Prisma to Drizzle ORM

### Wave 1.1: Remove Prisma Dependencies
**Task:** Uninstall all Prisma-related packages

```bash
npm uninstall @prisma/client prisma @prisma/adapter-pg pg
```

**Files to Remove:**
- `/prisma/` directory (entire folder)
- `/prisma.config.ts`
- `/src/lib/prisma.ts` (or wherever Prisma client is instantiated)

**Verification:**
- [ ] `package.json` no longer lists Prisma dependencies
- [ ] `node_modules/@prisma` directory removed
- [ ] No import statements reference `@prisma/client`

---

### Wave 1.2: Install Drizzle Dependencies
**Task:** Install Drizzle ORM and PostgreSQL driver

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

**Verification:**
- [ ] `drizzle-orm` and `postgres` added to dependencies
- [ ] `drizzle-kit` added to devDependencies
- [ ] `npm install` completes without errors

---

### Wave 1.3: Environment Configuration
**Task:** Update `.env` and `.env.example` with Drizzle configuration

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@lzfrvgplqwhmgtzkvima.supabase.co:5432/postgres?sslmode=require"

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3090"

# Super Admin
SUPER_ADMIN_EMAILS="admin@example.com,superadmin@example.com"
```

**Verification:**
- [ ] `.env` file contains all required variables
- [ ] `.env.example` updated with placeholder values
- [ ] `src/env.ts` validates all required variables at startup

---

## Wave 2: Database Layer

**Goal:** Configure Drizzle ORM and create User schema

### Wave 2.1: Create Drizzle Configuration
**File:** `/src/lib/db/drizzle.ts`

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 5,
})

export const db = drizzle(client, { schema })
```

**File:** `/src/lib/db/index.ts`

```typescript
export { db } from './drizzle'
export * from './schema'
```

**Verification:**
- [ ] Drizzle client initializes without errors
- [ ] Connection to Supabase PostgreSQL successful
- [ ] Schema exports work correctly

---

### Wave 2.2: Create User Schema
**File:** `/src/lib/db/schema/users.ts`

```typescript
import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

export const roleEnum = pgEnum('role', ['admin', 'staff'])

export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: roleEnum('role').notNull().default('staff'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

**Verification:**
- [ ] Schema compiles without TypeScript errors
- [ ] `cuid2` used for ID generation (matches existing dependency)
- [ ] Role enum restricts to 'admin' | 'staff'
- [ ] Email uniqueness enforced at database level

---

### Wave 2.3: Configure Drizzle Kit
**File:** `/drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

**Verification:**
- [ ] `drizzle-kit` can read configuration
- [ ] Schema path resolves correctly

---

### Wave 2.4: Generate and Apply Migration
**Task:** Create initial migration for User table

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

**Expected Output:**
- Migration file created: `/drizzle/meta/*.sql`
- Migration applied to Supabase database
- `users` table exists with correct schema

**Verification:**
- [ ] `drizzle/meta/0000_create_users_table.sql` generated
- [ ] Migration runs without errors
- [ ] Supabase table inspector shows `users` table
- [ ] Indexes created for `email` column

---

## Wave 3: Authentication

**Goal:** Implement NextAuth.js with Drizzle adapter and role-based access

### Wave 3.1: Create Zod Validators
**File:** `/src/lib/validators/auth.ts`

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
```

**Verification:**
- [ ] Schemas compile without errors
- [ ] Password validation rules match requirements
- [ ] Type exports work in components

---

### Wave 3.2: Create NextAuth Configuration
**File:** `/src/lib/auth.ts`

```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { loginSchema } from './validators/auth'

const superAdminEmails = process.env.SUPER_ADMIN_EMAILS
  ?.split(',')
  .map((e) => e.trim().toLowerCase())

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validated = loginSchema.safeParse(credentials)

        if (!validated.success) {
          return null
        }

        const { email, password } = validated.data

        const user = await db.query.users.findFirst({
          where: eq(users.email, email.toLowerCase()),
        })

        if (!user) {
          return null
        }

        const isMatch = await compare(password, user.password)

        if (!isMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'staff'
      }
      return session
    },
  },
})
```

**File:** `/src/types/next-auth.d.ts`

```typescript
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'admin' | 'staff'
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: 'admin' | 'staff'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'admin' | 'staff'
  }
}
```

**Verification:**
- [ ] NextAuth initializes without errors
- [ ] Credentials provider authenticates against database
- [ ] JWT token includes role
- [ ] Session object extended with role
- [ ] TypeScript types resolve correctly

---

### Wave 3.3: Create Auth API Route
**File:** `/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

**Verification:**
- [ ] Route handles GET/POST requests
- [ ] NextAuth endpoints accessible at `/api/auth/*`

---

### Wave 3.4: Create Rate Limiter
**File:** `/src/lib/rate-limit.ts`

```typescript
import { LRUCache } from 'lru-cache'

interface RateLimitOptions {
  interval: number // milliseconds
  maxRequests: number
}

class RateLimiter {
  private cache: LRUCache<string, number>
  private interval: number
  private maxRequests: number

  constructor(options: RateLimitOptions) {
    this.interval = options.interval
    this.maxRequests = maxRequests
    this.cache = new LRUCache({
      max: 10000,
      ttl: options.interval,
    })
  }

  async isRateLimited(identifier: string): Promise<boolean> {
    const current = this.cache.get(identifier) || 0

    if (current >= this.maxRequests) {
      return true
    }

    this.cache.set(identifier, current + 1)
    return false
  }

  getRemaining(identifier: string): number {
    const current = this.cache.get(identifier) || 0
    return Math.max(0, this.maxRequests - current)
  }
}

// Standard API rate limiter: 100 requests per 15 minutes
export const apiRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000,
  maxRequests: 100,
})

// Auth rate limiter: 5 requests per 15 minutes (brute force protection)
export const authRateLimiter = new RateLimiter({
  interval: 15 * 60 * 1000,
  maxRequests: 5,
})
```

**Verification:**
- [ ] Rate limiter tracks requests per identifier
- [ ] LRU cache auto-expires after interval
- [ ] Different limits for API vs auth routes

---

## Wave 4: UI & Routes

**Goal:** Create login/signup pages with shadcn/ui components

### Wave 4.1: Create Login Page
**File:** `/src/app/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Verification:**
- [ ] Login form renders with shadcn/ui components
- [ ] Zod validation shows error messages inline
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows error alert
- [ ] Loading state disables form

---

### Wave 4.2: Create Signup Page
**File:** `/src/app/signup/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { signupSchema, type SignupInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Signup failed')
      }

      // Auto-login after signup
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but login failed. Please login manually.')
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up for a new account to manage queues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                disabled={isLoading}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Verification:**
- [ ] Signup form renders with all fields
- [ ] Password requirements displayed
- [ ] Zod validation shows inline errors
- [ ] Successful signup creates account and auto-logs in
- [ ] Duplicate email shows appropriate error

---

### Wave 4.3: Create Signup API Route
**File:** `/src/app/api/auth/signup/route.ts`

```typescript
import { hash } from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { signupSchema } from '@/lib/validators/auth'
import { eq } from 'drizzle-orm'
import { authRateLimiter } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip ?? 'unknown'
  const isLimited = await authRateLimiter.isRateLimited(ip)

  if (isLimited) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const validated = signupSchema.parse(body)

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validated.email.toLowerCase()),
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 12)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validated.email.toLowerCase(),
        password: hashedPassword,
        name: validated.name,
        role: 'staff', // Default role
      })
      .returning()

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

**Verification:**
- [ ] Route validates input with Zod
- [ ] Duplicate email returns 409
- [ ] Password is hashed with bcrypt
- [ ] New user created with 'staff' role
- [ ] Rate limiting enforced

---

## Wave 5: Security & Testing

**Goal:** Implement middleware, seed script, and verify all functionality

### Wave 5.1: Create Middleware
**File:** `/src/middleware.ts`

```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((request) => {
  const { nextUrl } = request
  const isLoggedIn = !!request.auth
  const userRole = request.auth?.user?.role

  // Define protected routes
  const protectedRoutes = ['/admin', '/staff']
  const adminOnlyRoutes = ['/admin/settings', '/admin/counters']
  const authRoutes = ['/login', '/signup']

  // Check if trying to access auth routes while logged in
  if (authRoutes.some((route) => nextUrl.pathname.startsWith(route))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Check if trying to access protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Check admin-only routes
  const isAdminRoute = adminOnlyRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  if (isAdminRoute && isLoggedIn && userRole !== 'admin') {
    // Return 403 for API routes, redirect for pages
    if (nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (/.*)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
    '/api/admin/:path*',
  ],
}
```

**Verification:**
- [ ] Unauthenticated users redirected to `/login`
- [ ] Logged-in users redirected away from auth pages
- [ ] Staff users blocked from admin routes with 403
- [ ] API routes return JSON 403 errors
- [ ] Static files and auth endpoints excluded

---

### Wave 5.2: Create Super Admin Seed Script
**File:** `/scripts/seed-admin.ts`

```typescript
import { hash } from 'bcryptjs'
import { db } from '../src/lib/db'
import { users } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

async function seedSuperAdmin() {
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS
    ?.split(',')
    .map((e) => e.trim().toLowerCase())

  if (!superAdminEmails || superAdminEmails.length === 0) {
    console.log('No SUPER_ADMIN_EMAILS configured')
    return
  }

  const temporaryPassword = 'TempPass123!'
  const hashedPassword = await hash(temporaryPassword, 12)

  console.log('Seeding super admin accounts...')

  for (const email of superAdminEmails) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingUser) {
      // Update existing user to admin
      await db
        .update(users)
        .set({ role: 'admin' })
        .where(eq(users.email, email))
      console.log(`✓ Updated ${email} to admin role`)
    } else {
      // Create new admin user
      await db.insert(users).values({
        email,
        password: hashedPassword,
        name: 'Super Admin',
        role: 'admin',
      })
      console.log(`✓ Created admin account for ${email}`)
    }
  }

  console.log('\n⚠️  Temporary password for all super admins:')
  console.log(`   ${temporaryPassword}`)
  console.log('\n⚠️  Please change password on first login!')
}

seedSuperAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
```

**File:** `/package.json` (add script)

```json
{
  "scripts": {
    "seed:admin": "tsx scripts/seed-admin.ts"
  }
}
```

**Verification:**
- [ ] Script creates admin accounts from env var
- [ ] Existing users promoted to admin role
- [ ] Temporary password displayed in console
- [ ] Script runs without errors

---

### Wave 5.3: Create Environment Validation
**File:** `/src/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  SUPER_ADMIN_EMAILS: z.string().optional(),
})

export const env = envSchema.parse(process.env)

export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    console.error(result.error.format())
    process.exit(1)
  }
  console.log('✓ Environment variables validated')
}
```

**Verification:**
- [ ] Missing required variables cause startup failure
- [ ] Validation runs on app startup
- [ ] Clear error messages for missing variables

---

### Wave 5.4: Test Authentication Flow
**Manual Testing Checklist:**

1. **Signup Flow:**
   - [ ] Navigate to `/signup`
   - [ ] Submit form with invalid email → see validation error
   - [ ] Submit form with weak password → see validation error
   - [ ] Submit form with mismatched passwords → see validation error
   - [ ] Submit valid form → account created, redirected to dashboard

2. **Login Flow:**
   - [ ] Navigate to `/login`
   - [ ] Submit invalid credentials → see error
   - [ ] Submit valid credentials → redirected to dashboard

3. **Protected Routes:**
   - [ ] Logout, navigate to `/admin/dashboard` → redirected to login
   - [ ] Login as staff, navigate to `/admin/settings` → redirected to dashboard

4. **Role-Based Access:**
   - [ ] Login as admin, navigate to `/admin/settings` → page loads
   - [ ] Login as staff, try to access admin API → 403 error

5. **Rate Limiting:**
   - [ ] Make 6 rapid login attempts → 6th returns 429

---

## Verification Checklist

### Database Layer
- [ ] Drizzle ORM configured and connected to Supabase
- [ ] User schema matches specification
- [ ] Migration generated and applied successfully
- [ ] Email uniqueness enforced at database level
- [ ] Role enum restricts to 'admin' | 'staff'

### Authentication
- [ ] NextAuth.js configured with Credentials Provider
- [ ] JWT sessions working with role in token
- [ ] Login validates credentials against database
- [ ] Signup creates new user with hashed password
- [ ] Session includes user ID and role

### Security
- [ ] Zod schemas validate all user inputs
- [ ] Rate limiting protects auth routes (5 req/15min)
- [ ] Rate limiting protects API routes (100 req/15min)
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Environment variables validated at startup

### UI & Routes
- [ ] Login page renders with form validation
- [ ] Signup page renders with password requirements
- [ ] Error messages display inline
- [ ] Loading states disable form submission
- [ ] Auth API routes handle requests correctly

### Authorization
- [ ] Middleware redirects unauthenticated users
- [ ] Staff users blocked from admin routes (403)
- [ ] Admin users can access all routes
- [ ] API routes return JSON 403 errors
- [ ] Static files excluded from middleware

### Seed & Testing
- [ ] Super admin seed script creates accounts
- [ ] Temporary password displayed
- [ ] Manual test checklist passes
- [ ] No console errors during authentication flow

---

## File Manifest

### New Files to Create

| File Path | Purpose |
|-----------|---------|
| `/src/lib/db/drizzle.ts` | Drizzle client configuration |
| `/src/lib/db/index.ts` | Database exports |
| `/src/lib/db/schema/users.ts` | User table schema |
| `/src/lib/validators/auth.ts` | Zod schemas for authentication |
| `/src/lib/rate-limit.ts` | Rate limiting implementation |
| `/src/lib/auth.ts` | NextAuth.js configuration |
| `/src/types/next-auth.d.ts` | NextAuth type extensions |
| `/src/middleware.ts` | Route protection middleware |
| `/src/env.ts` | Environment validation |
| `/src/app/login/page.tsx` | Login page |
| `/src/app/signup/page.tsx` | Signup page |
| `/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route |
| `/src/app/api/auth/signup/route.ts` | Signup API route |
| `/scripts/seed-admin.ts` | Super admin seed script |
| `/drizzle.config.ts` | Drizzle Kit configuration |
| `/drizzle/meta/0000_create_users_table.sql` | Initial migration |

### Files to Remove

| File Path | Reason |
|-----------|--------|
| `/prisma/` (entire directory) | Migrating to Drizzle |
| `/prisma.config.ts` | Prisma configuration |
| `/src/lib/prisma.ts` | Prisma client singleton |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `/package.json` | Remove Prisma deps, add seed:admin script |
| `/.env` | Add DATABASE_URL, AUTH_SECRET |
| `/.env.example` | Update with Drizzle variables |

---

## Execution Order

### Wave Dependencies
```
Wave 1 (Setup) → Wave 2 (Database) → Wave 3 (Auth) → Wave 4 (UI) → Wave 5 (Security)
```

### Parallel Execution
- **Wave 1.1 & 1.2:** Can run together (remove Prisma, install Drizzle)
- **Wave 2.1 & 2.2:** Can run together (config + schema)
- **Wave 3.1 & 3.4:** Can run together (validators + rate limiter)
- **Wave 4.1 & 4.2:** Can run together (login + signup pages)
- **Wave 5.2 & 5.3:** Can run together (seed script + env validation)

### Sequential Execution
- Wave 2.4 (migration) must follow Wave 2.2 (schema)
- Wave 3.2 (NextAuth) must follow Wave 2.4 (migration applied)
- Wave 4.3 (signup API) must follow Wave 3.2 (NextAuth config)
- Wave 5.1 (middleware) must follow Wave 3.2 (NextAuth config)
- Wave 5.4 (testing) must follow all previous waves

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase connection fails | Blocked on DB setup | Test connection string before starting. Verify SSL mode. |
| NextAuth v5 breaking changes | Auth flow breaks | Check v5 beta docs, use handlers pattern |
| Zod v4 API changes | Validation errors | Review Zod v4 changelog before implementation |
| bcryptjs async in Server Components | Performance issues | Use await properly, consider edge runtime |
| Middleware infinite loops | App unusable | Test redirect logic carefully, use matcher config |

---

## Next Steps

After Phase 1 completion:
1. Run `/gsd-audit-milestone 1` to verify all deliverables
2. Run `/gsd-complete-milestone 1` to archive Phase 1
3. Run `/gsd-next` to advance to Phase 2: Database Schema & Drizzle Setup

---

*Created: 1 April 2026*  
*Phase: 1 of 8*  
*Milestone: v2.0*
