import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getQueuesByAdminId } from '@/lib/auth-queries'
import { CreateQueueButton } from '@/components/queue/create-queue-button'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  interface QueueData {
    id: string
    name: string
    status: string
    entries: Array<{ id: string }>
  }

  const queues = (await getQueuesByAdminId(session.user.id)) as QueueData[]
  const activeQueues = queues.filter((q) => q.status === 'ACTIVE')
  const totalEntries = queues.reduce((sum, q) => sum + (q.entries?.length || 0), 0)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Page Header */}
      <header className="flex justify-between items-center" role="banner">
        <div>
          <h1 className="text-3xl font-bold" id="page-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground" aria-label="Welcome message">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        {session.user.role === 'SUPER_ADMIN' && (
          <span
            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
            role="status"
            aria-label="Super Administrator badge"
          >
            Super Admin
          </span>
        )}
      </header>

      {/* Stats Cards */}
      <section aria-labelledby="stats-heading" className="grid gap-6 md:grid-cols-3">
        <h2 id="stats-heading" className="sr-only">
          Statistics Overview
        </h2>

        <Card aria-labelledby="total-queues-label">
          <CardHeader>
            <CardTitle id="total-queues-label">Total Queues</CardTitle>
            <CardDescription>Active queues you&apos;ve created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" aria-live="polite">
              {queues.length}
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="active-today-label">
          <CardHeader>
            <CardTitle id="active-today-label">Active Today</CardTitle>
            <CardDescription>Queues with activity today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" aria-live="polite">
              {activeQueues.length}
            </div>
          </CardContent>
        </Card>

        <Card aria-labelledby="total-entries-label">
          <CardHeader>
            <CardTitle id="total-entries-label">Total Entries</CardTitle>
            <CardDescription>All queue entries across your queues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" aria-live="polite">
              {totalEntries}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Action Buttons */}
      <nav aria-label="Dashboard actions" className="flex gap-4">
        <CreateQueueButton />
        <Button variant="outline" asChild>
          <Link href="/dashboard/queues">View All Queues</Link>
        </Button>
      </nav>

      {/* Queues List */}
      {queues.length > 0 ? (
        <Card aria-labelledby="your-queues-label">
          <CardHeader>
            <CardTitle id="your-queues-label">Your Queues</CardTitle>
            <CardDescription>Recently created queues</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4" role="list" aria-label="Queue list">
              {queues.slice(0, 5).map((queue) => (
                <li key={queue.id}>
                  <div
                    className="flex justify-between items-center p-4 border rounded-lg"
                    role="listitem"
                  >
                    <div>
                      <h3 className="font-semibold">{queue.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {queue.entries?.length || 0} entries
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/queue/${queue.id}`} aria-label={`View ${queue.name} queue`}>
                          View
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/queue/${queue.id}`}
                          aria-label={`Manage ${queue.name} queue`}
                        >
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : (
        /* Empty State */
        <Card aria-labelledby="no-queues-label">
          <CardHeader>
            <CardTitle id="no-queues-label">No Queues Yet</CardTitle>
            <CardDescription>Create your first queue to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQueueButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
