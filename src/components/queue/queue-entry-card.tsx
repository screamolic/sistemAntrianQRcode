'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserX } from 'lucide-react'

interface QueueEntry {
  id: string
  firstName: string
  lastName: string
  phone: string
  position: number
}

interface QueueEntryCardProps {
  entry: QueueEntry
  onRemove?: (entryId: string) => void
  isRemoving?: boolean
}

export function QueueEntryCard({ entry, onRemove, isRemoving }: QueueEntryCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-lg px-3 py-1 min-w-[3rem] text-center">
            #{entry.position}
          </Badge>
          <div>
            <p className="font-semibold">
              {entry.firstName} {entry.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{entry.phone}</p>
          </div>
        </div>
        {onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRemove(entry.id)}
            disabled={isRemoving}
          >
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
