'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Users, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { signOut } from '@/lib/auth'

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
}

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Queues',
    href: '/dashboard/queues',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  // Close menu on route change
  React.useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </Button>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-0 z-50 bg-background md:hidden',
          open ? 'opacity-100 visible' : 'opacity-0 invisible',
          'transition-all duration-300'
        )}
      >
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="text-xl font-bold" onClick={() => setOpen(false)}>
              Queue Automation
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-lg font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          {user && (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center gap-3 px-4 py-3 mb-4 rounded-lg bg-muted">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.name || user.email}</div>
                  {user.role === 'SUPER_ADMIN' && (
                    <div className="text-xs text-muted-foreground">Super Admin</div>
                  )}
                </div>
              </div>

              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <Button type="submit" variant="outline" className="w-full justify-start gap-3">
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  Sign Out
                </Button>
              </form>
            </div>
          )}

          {!user && (
            <div className="mt-8 pt-8 border-t space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
