import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth-queries'
import { signupSchema } from '@/lib/validators/auth'
import { authRateLimiter } from '@/lib/rate-limiter'

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  const isLimited = await authRateLimiter.isRateLimited(ip)

  if (isLimited) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()

    // Validate with Zod
    const validated = signupSchema.safeParse(body)
    if (!validated.success) {
      const errors = validated.error.issues.map((issue) => issue.message).join(', ')
      return NextResponse.json({ error: errors }, { status: 400 })
    }

    const { name, email, password } = validated.data

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase())
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain.' },
        { status: 409 }
      )
    }

    // Create user (role defaults to ADMIN for self-signup)
    const user = await createUser(email.toLowerCase(), password, name)

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user
    void passwordHash // intentionally excluded from response

    return NextResponse.json(
      {
        message: 'Akun berhasil dibuat',
        user: userWithoutPassword,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Gagal membuat akun. Silakan coba lagi.' }, { status: 500 })
  }
}
