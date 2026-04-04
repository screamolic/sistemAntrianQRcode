import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginSchema } from '@/lib/validators/auth'

// Lazy-load database connection to avoid bundling in middleware
async function getDb() {
  const { db } = await import('./db')
  const { users } = await import('@/lib/db/schema')
  const { eq } = await import('drizzle-orm')
  return { db, users, eq }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input with Zod
        const validated = loginSchema.safeParse(credentials)
        if (!validated.success) {
          return null
        }

        const { username, password } = validated.data

        try {
          const { db, users, eq } = await getDb()
          const bcrypt = await import('bcryptjs')

          const results = await db
            .select()
            .from(users)
            .where(eq(users.username, username.toLowerCase()))
            .limit(1)

          const user = results[0]
          if (!user) return null

          const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
          if (!isPasswordValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
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
        session.user.role = token.role as 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
})
