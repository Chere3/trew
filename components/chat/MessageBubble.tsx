'use client'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy, ThumbsUp, ThumbsDown, RefreshCw } from 'lucide-react'
import { useState } from 'react'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface MessageBubbleProps {
  role: MessageRole
  content: string
  timestamp?: Date
  avatar?: string
  avatarFallback?: string
  isStreaming?: boolean
  hasError?: boolean
  onRetry?: () => void
  onCopy?: () => void
  onFeedback?: (positive: boolean) => void
  className?: string
}

export function MessageBubble({
  role,
  content,
  timestamp,
  avatar,
  avatarFallback,
  isStreaming = false,
  hasError = false,
  onRetry,
  onCopy,
  onFeedback,
  className,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  const isUser = role === 'user'
  const isSystem = role === 'system'

  return (
    <div
      className={cn(
        'group flex gap-4 px-6 py-3 hover:bg-muted/20 transition-colors message-enter',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {!isSystem && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarImage src={avatar} alt={role} />
            <AvatarFallback className="text-xs font-medium">
              {avatarFallback || role[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {!isSystem && (
          <div className={cn('flex items-center gap-2 mb-1.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
            <span className="text-xs font-medium text-foreground/70">
              {role === 'user' ? 'You' : 'Assistant'}
            </span>
            {timestamp && (
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
        )}

        <div
          className={cn(
            'relative rounded-2xl px-5 py-3 max-w-[85%] sm:max-w-[75%]',
            'break-words',
            // User messages: Solid red background, structured, slightly elevated
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm shadow-soft'
              // System messages: Distinct muted styling, calm
              : isSystem
              ? 'bg-muted/40 text-muted-foreground rounded-bl-sm border border-border/30'
              // AI messages: Light background with border, slightly elevated, structured
              : 'bg-card text-foreground rounded-bl-sm border border-border/60 shadow-soft'
          )}
        >
          <div className="text-sm leading-[1.6] whitespace-pre-wrap">
            {content}
          </div>
          
          {isStreaming && (
            <span className="inline-flex items-center gap-1 ml-2">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse delay-150" />
            </span>
          )}
          
          {hasError && (
            <div className="mt-2 pt-2 border-t border-destructive/20">
              <p className="text-xs text-destructive font-medium">
                Failed to send message
              </p>
            </div>
          )}
        </div>

        {!isSystem && (
          <div
            className={cn(
              'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {onCopy && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Copy message"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            )}
            {hasError && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Retry"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {onFeedback && !hasError && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback(true)}
                  className="h-7 w-7 p-0 hover:bg-muted"
                  title="Good response"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback(false)}
                  className="h-7 w-7 p-0 hover:bg-muted"
                  title="Poor response"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
