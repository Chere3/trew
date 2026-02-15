'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface MessageBubbleSkeletonProps {
  role?: 'user' | 'assistant' | 'system'
  className?: string
}

export function MessageBubbleSkeleton({
  role = 'assistant',
  className,
}: MessageBubbleSkeletonProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex gap-4 px-6 py-3',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      <div className="flex-shrink-0">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div className={cn('flex items-center gap-2 mb-1.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>

        <div
          className={cn(
            'rounded-2xl px-5 py-3 max-w-[85%] sm:max-w-[75%]',
            isUser
              ? 'bg-primary/20 rounded-br-sm'
              : 'bg-card rounded-bl-sm border border-border/60'
          )}
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <Skeleton className="h-7 w-7 rounded" />
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </div>
  )
}
