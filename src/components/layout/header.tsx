import { auth } from "@/lib/auth"
import { ThemeToggle } from "../theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signOut } from "@/lib/auth"
import { MobileNav } from "./mobile-nav"

export async function Header() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-xl font-bold hover:text-primary transition-colors"
          aria-label="Queue Automation - Home"
        >
          Queue Automation
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {session?.user && (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/queues" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Queues
              </Link>
              <Link 
                href="/dashboard/settings" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Desktop User Menu */}
          {session?.user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm" aria-label="User information">
                <div className="font-medium">{session.user.name || session.user.email}</div>
                {session.user.role === "SUPER_ADMIN" && (
                  <div className="text-xs text-muted-foreground" aria-label="Super Administrator role">
                    Super Admin
                  </div>
                )}
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" aria-label="Sign in to your account">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" aria-label="Create a new account">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <MobileNav user={session?.user} />
        </div>
      </div>
    </header>
  )
}
