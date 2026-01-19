import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface MessageListProps {
  children: ReactNode
  className?: string
}

export function MessageList({ children, className }: MessageListProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-full max-w-4xl mx-auto',
        'min-h-0 overflow-y-auto',
        className
      )}
    >
      <div className="flex flex-col py-6 space-y-1">
        {children}
      </div>
    </div>
  )
}
