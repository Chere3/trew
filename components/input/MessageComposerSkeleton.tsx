'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface MessageComposerSkeletonProps {
  className?: string
}

export function MessageComposerSkeleton({
  className,
}: MessageComposerSkeletonProps) {
  return (
    <div className={cn('bg-transparent p-4 pb-6', className)}>
      <div className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Skeleton className="min-h-[44px] max-h-[200px] rounded-xl" />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
              <Skeleton className="h-7 w-7 rounded" />
            </div>
          </div>
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
