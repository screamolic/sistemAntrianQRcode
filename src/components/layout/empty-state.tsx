import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Inbox, Users, Calendar, AlertCircle, Plus } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  variant?: "default" | "queues" | "users" | "schedule" | "search" | "error"
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
  icon?: React.ReactNode
}

const variantConfig: Record<
  NonNullable<EmptyStateProps["variant"]>,
  {
    icon: React.ReactNode
    title: string
    description: string
  }
> = {
  default: {
    icon: <FileText className="h-12 w-12" aria-hidden="true" />,
    title: "No items",
    description: "There are no items to display yet.",
  },
  queues: {
    icon: <Inbox className="h-12 w-12" aria-hidden="true" />,
    title: "No queues yet",
    description: "Create your first queue to start managing visitors.",
  },
  users: {
    icon: <Users className="h-12 w-12" aria-hidden="true" />,
    title: "No users found",
    description: "There are no users matching your search criteria.",
  },
  schedule: {
    icon: <Calendar className="h-12 w-12" aria-hidden="true" />,
    title: "No scheduled items",
    description: "There are no scheduled items for this date.",
  },
  search: {
    icon: <AlertCircle className="h-12 w-12" aria-hidden="true" />,
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
  },
  error: {
    icon: <AlertCircle className="h-12 w-12" aria-hidden="true" />,
    title: "Something went wrong",
    description: "We couldn't load the content. Please try again.",
  },
}

/**
 * Empty state component for displaying when there's no content
 */
export function EmptyState({
  variant = "default",
  title,
  description,
  action,
  secondaryAction,
  className,
  icon,
}: EmptyStateProps) {
  const config = variantConfig[variant]

  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8 text-center",
        className
      )}
      role="status"
      aria-label={title || config.title}
    >
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted"
        aria-hidden="true"
      >
        {icon || config.icon}
      </div>

      <h3 className="mb-2 text-lg font-semibold">{title || config.title}</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        {description || config.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          <Button asChild={!!action.href} onClick={action.onClick}>
            {action.href ? (
              <Link href={action.href}>
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                {action.label}
              </Link>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
                {action.label}
              </>
            )}
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="outline"
            asChild={!!secondaryAction.href}
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.href ? (
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            ) : (
              secondaryAction.label
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Compact empty state for inline usage
 */
interface CompactEmptyStateProps {
  message?: string
  className?: string
}

export function CompactEmptyState({ message = "No items", className }: CompactEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-8 text-center text-sm text-muted-foreground",
        className
      )}
      role="status"
    >
      <Inbox className="h-4 w-4 mr-2" aria-hidden="true" />
      {message}
    </div>
  )
}

/**
 * Queue-specific empty state with quick actions
 */
interface QueueEmptyStateProps {
  onCreateQueue?: () => void
  className?: string
}

export function QueueEmptyState({ onCreateQueue, className }: QueueEmptyStateProps) {
  return (
    <EmptyState
      variant="queues"
      className={className}
      action={{
        label: "Create Queue",
        onClick: onCreateQueue,
        href: "/dashboard/queues/new",
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/docs/queues",
      }}
    />
  )
}
