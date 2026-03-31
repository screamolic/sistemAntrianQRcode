import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getQueuesByAdminId } from "@/lib/auth-queries"
import { CreateQueueButton } from "@/components/queue/create-queue-button"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const queues = await getQueuesByAdminId(session.user.id)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>
        {session.user.role === "SUPER_ADMIN" && (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            Super Admin
          </span>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Queues</CardTitle>
            <CardDescription>Active queues you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{queues.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Today</CardTitle>
            <CardDescription>Queues with activity today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {queues.filter((q: any) => q.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Entries</CardTitle>
            <CardDescription>All queue entries across your queues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {queues.reduce((sum: number, q: any) => sum + (q.entries?.length || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <CreateQueueButton />
        <Button variant="outline">View All Queues</Button>
      </div>

      {queues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Queues</CardTitle>
            <CardDescription>Recently created queues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {queues.slice(0, 5).map((queue: any) => (
                <div
                  key={queue.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{queue.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {queue.entries?.length || 0} entries
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/queue/${queue.id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/queue/${queue.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {queues.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Queues Yet</CardTitle>
            <CardDescription>
              Create your first queue to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQueueButton />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
