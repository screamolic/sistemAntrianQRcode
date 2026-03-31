import { auth } from "@/lib/auth"
import { ThemeToggle } from "../theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signOut } from "@/lib/auth"

export async function Header() {
  const session = await auth()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          Queue Automation
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <div className="font-medium">{session.user.name || session.user.email}</div>
                {session.user.role === "SUPER_ADMIN" && (
                  <div className="text-xs text-muted-foreground">Super Admin</div>
                )}
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
