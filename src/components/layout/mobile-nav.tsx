'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, Users, Settings, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { handleSignOut } from '@/app/actions/auth'

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const navItems = React.useMemo(
    () => [
      { href: '/', label: 'Home', icon: Home },
      ...(user
        ? [
            { href: '/dashboard', label: 'Dashboard', icon: Home },
            { href: '/dashboard/queues', label: 'Queues', icon: Users },
            { href: '/dashboard/settings', label: 'Settings', icon: Settings },
          ]
        : []),
    ],
    [user]
  )

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex w-3/4 max-w-sm flex-col bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <Link
                href="/"
                className="text-lg font-bold hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Queue Automation
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile navigation">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              {user && (
                <div className="mt-4 border-t pt-4">
                  <div className="mb-4 flex items-center gap-3 px-4">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{user.name || user.email}</div>
                      {user.role === 'SUPER_ADMIN' && (
                        <div className="text-xs text-muted-foreground">Super Admin</div>
                      )}
                    </div>
                  </div>
                  <form action={handleSignOut}>
                    <Button type="submit" variant="outline" className="w-full justify-start gap-2">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </form>
                </div>
              )}
            </nav>

            <div className="flex items-center justify-between border-t p-4">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
