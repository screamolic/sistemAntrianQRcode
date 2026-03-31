import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  // Redirect logged-in users to dashboard
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <section className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight">
              Queue Automation System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modern queue management with QR codes, real-time updates, and WhatsApp notifications.
              Built for efficiency, designed for simplicity.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>QR Code Join</CardTitle>
                <CardDescription>
                  Users scan QR code to join queue instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No app download required. Works on any smartphone with a camera.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Updates</CardTitle>
                <CardDescription>
                  Live queue position tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Automatic updates every 5 seconds. Never miss your turn.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Notifications</CardTitle>
                <CardDescription>
                  Automated alerts when it's almost your turn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get notified when you're 3rd in line. Powered by Evolution-API.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Built with modern technologies for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 md:grid-cols-2">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Next.js 16 App Router
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  TypeScript Strict Mode
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  PostgreSQL + Prisma ORM
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  NextAuth.js Authentication
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Tailwind CSS + shadcn/ui
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Dark Mode Support
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
