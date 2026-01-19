'use client'

import { Button } from '@/components/ui/button'
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export interface MessageActionsProps {
  onCopy?: () => void
  onRetry?: () => void
  onFeedback?: (positive: boolean) => void
  onDelete?: () => void
  onEdit?: () => void
  className?: string
  variant?: 'inline' | 'dropdown'
}

export function MessageActions({
  onCopy,
  onRetry,
  onFeedback,
  onDelete,
  onEdit,
  className,
  variant = 'inline',
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (onCopy) {
      onCopy()
    } else {
      // Fallback copy functionality
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn('h-7 w-7 p-0', className)}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onCopy && (
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied!' : 'Copy'}
            </DropdownMenuItem>
          )}
          {onRetry && (
            <DropdownMenuItem onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </DropdownMenuItem>
          )}
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          )}
          {onFeedback && (
            <>
              <DropdownMenuItem onClick={() => onFeedback(true)}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Good response
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFeedback(false)}>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Poor response
              </DropdownMenuItem>
            </>
          )}
          {onDelete && (
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {onCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0 hover:bg-muted rounded-full"
          title={copied ? 'Copied!' : 'Copy'}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      )}
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-7 w-7 p-0 hover:bg-muted rounded-full"
          title="Retry"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
      {onFeedback && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(true)}
            className="h-7 w-7 p-0 hover:bg-muted rounded-full"
            title="Good response"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback(false)}
            className="h-7 w-7 p-0 hover:bg-muted rounded-full"
            title="Poor response"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  )
}
