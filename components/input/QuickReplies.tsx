'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickReply {
  id: string
  label: string
  value?: string
}

export interface QuickRepliesProps {
  replies: QuickReply[]
  onSelect?: (reply: QuickReply) => void
  className?: string
  variant?: 'default' | 'outline'
}

export function QuickReplies({
  replies,
  onSelect,
  className,
  variant = 'outline',
}: QuickRepliesProps) {
  if (replies.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap gap-2 p-4', className)}>
      {replies.map((reply) => (
        <Button
          key={reply.id}
          variant={variant}
          size="sm"
          onClick={() => onSelect?.(reply)}
          className="h-8 text-xs"
        >
          {reply.label}
        </Button>
      ))}
    </div>
  )
}
