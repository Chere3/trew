'use client'

import { MessageBubbleSkeleton } from './MessageBubbleSkeleton'
import { cn } from '@/lib/utils'

export interface MessageListSkeletonProps {
  className?: string
  messageCount?: number
}

export function MessageListSkeleton({
  className,
  messageCount = 4,
}: MessageListSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full max-w-4xl mx-auto overflow-y-auto',
        className
      )}
      style={{
        height: '100%',
        minHeight: 0,
        maxHeight: '100%',
      }}
    >
      <div className="flex flex-col py-6 space-y-1">
        {Array.from({ length: messageCount }).map((_, i) => (
          <MessageBubbleSkeleton
            key={i}
            role={i % 2 === 0 ? 'user' : 'assistant'}
          />
        ))}
      </div>
    </div>
  )
}
