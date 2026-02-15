'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ModelSelectorSkeletonProps {
  className?: string
}

export function ModelSelectorSkeleton({
  className,
}: ModelSelectorSkeletonProps) {
  return (
    <div className={cn('border-b border-border/50 bg-background/80 backdrop-blur-sm', className)}>
      <div className="px-4 py-2 flex justify-center">
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
    </div>
  )
}
