'use client'

import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'list' | 'text' | 'dashboard'
  count?: number
  className?: string
}

/**
 * Reusable loading skeleton component for various UI patterns
 */
export function LoadingSkeleton({ variant = 'card', count = 1, className }: LoadingSkeletonProps) {
  switch (variant) {
    case 'card':
      return (
        <div className={cn('space-y-4', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-6 shadow-sm"
              role="status"
              aria-label="Loading content"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-20 w-full mt-4" />
            </div>
          ))}
        </div>
      )

    case 'table':
      return (
        <div
          className={cn('rounded-lg border bg-card', className)}
          role="status"
          aria-label="Loading table"
        >
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-1/4" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'list':
      return (
        <div className={cn('space-y-3', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4"
              role="status"
              aria-label="Loading item"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )

    case 'text':
      return (
        <div className={cn('space-y-2', className)} role="status" aria-label="Loading text">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )

    case 'dashboard':
      return (
        <div className={cn('space-y-6', className)}>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-card p-6"
                role="status"
                aria-label="Loading stat"
              >
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <div className="rounded-lg border bg-card p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="rounded-lg border bg-card p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return (
        <div className={cn('space-y-2', className)} role="status" aria-label="Loading">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )
  }
}

/**
 * Page-level loading skeleton with full-screen layout
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col" role="status" aria-label="Loading page">
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <LoadingSkeleton variant="dashboard" />
      </main>
    </div>
  )
}

/**
 * Queue-specific loading skeleton
 */
export function QueueSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading queue">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-1/4" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
