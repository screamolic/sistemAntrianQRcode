import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
  const { nextUrl } = req
  const cookieName =
    process.env.NODE_ENV === 'production'
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token'

  const token = req.cookies.get(cookieName)?.value

  let userRole: string | null = null
  let isLoggedIn = false

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
      const { payload } = await jwtVerify(token, secret)
      userRole = payload.role as string | null
      isLoggedIn = !!payload
    } catch {
      // Token invalid
      isLoggedIn = false
    }
  }

  // Define protected routes
  const isAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isSuperAdminRoute = nextUrl.pathname.startsWith('/super-admin')
  const isAuthPageRoute = nextUrl.pathname === '/login' || nextUrl.pathname === '/signup'

  // Allow auth API routes
  if (isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPageRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Protect dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Protect admin routes
  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Protect super admin routes
  if (isSuperAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
