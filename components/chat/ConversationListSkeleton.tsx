'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ConversationListSkeletonProps {
  className?: string
  showNewButton?: boolean
  itemCount?: number
}

export function ConversationListSkeleton({
  className,
  showNewButton = true,
  itemCount = 4,
}: ConversationListSkeletonProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {showNewButton && (
        <div className="p-4">
          <Skeleton className="w-full h-9 rounded-lg" />
        </div>
      )}
      <div className="p-2 space-y-1">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div
            key={i}
            className="w-full p-3 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-6 rounded-full flex-shrink-0" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
