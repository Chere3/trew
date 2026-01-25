
import { MarkdownRenderer } from '@/components/media/MarkdownRenderer'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Brain, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Thinking } from './Thinking'
import { TypingIndicator } from './TypingIndicator'
import { ModelRegenerateDropdown } from '@/components/input/ModelRegenerateDropdown'
import type { MessageRole, MessageBubbleProps as MessageBubblePropsType, Model } from '@/lib/types'
import { MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT, MESSAGE_ROLE_SYSTEM, DEFAULT_AVATAR_FALLBACK_USER, DEFAULT_AVATAR_FALLBACK_ASSISTANT } from '@/lib/constants'

export type { MessageRole }
export type MessageBubbleProps = MessageBubblePropsType

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
  onRegenerate,
  onRegenerateWithModel,
  className,
  attachments,
  modelName,
  modelId,
  providerIcon,
  id,
  availableModels = [],
  memorySaved,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const [showMemoryNotification, setShowMemoryNotification] = useState(!!memorySaved)

  // Auto-dismiss memory notification after 5 seconds
  useEffect(() => {
    if (memorySaved && showMemoryNotification) {
      const timer = setTimeout(() => {
        setShowMemoryNotification(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [memorySaved, showMemoryNotification])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  const isUser = role === MESSAGE_ROLE_USER
  const isSystem = role === MESSAGE_ROLE_SYSTEM

  // Parse content to extract thought process
  const { thought, mainContent, isThinking } = useMemo(() => {
    if (role !== MESSAGE_ROLE_ASSISTANT) {
      return { thought: null, mainContent: content, isThinking: false }
    }

    if (!content && isStreaming) {
      return { thought: null, mainContent: '', isThinking: true } // Treat empty streaming as "thinking" state initially
    }

    if (!content) {
      return { thought: null, mainContent: content, isThinking: false }
    }

    // Check for <think> block
    const thinkStart = content.indexOf('<think>')
    if (thinkStart === -1) {
      return { thought: null, mainContent: content, isThinking: false }
    }

    const thinkEnd = content.indexOf('</think>')

    if (thinkEnd === -1) {
      // Still thinking (streaming case where closing tag hasn't arrived)
      const thoughtContent = content.slice(thinkStart + 7)
      return {
        thought: thoughtContent,
        mainContent: '',
        isThinking: true
      }
    }

    // Finished thinking
    const thoughtContent = content.slice(thinkStart + 7, thinkEnd)
    const afterThink = content.slice(thinkEnd + 8)

    // Trim leading newline from main content if it exists
    const cleanMainContent = afterThink.startsWith('\n') ? afterThink.slice(1) : afterThink

    return {
      thought: thoughtContent,
      mainContent: cleanMainContent,
      isThinking: false
    }
  }, [content, role, isStreaming])

  // If content is empty and streaming, show typing indicator
  const showTypingIndicator = !content && isStreaming && role === MESSAGE_ROLE_ASSISTANT;

  return (
    <div
      id={id}
      className={cn(
        'group flex gap-4 px-6 py-3 hover:bg-muted/20 transition-colors message-enter',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {!isSystem && (
        <div className="flex-shrink-0">
          <Avatar className="h-8 w-8 ring-2 ring-background">
            {providerIcon ? (
              <div className="w-full h-full flex items-center justify-center bg-muted/50 p-1.5">
                {providerIcon}
              </div>
            ) : (
              <>
                <AvatarImage src={avatar} alt={role} />
                <AvatarFallback className="text-xs font-medium">
                  {avatarFallback || (isUser ? DEFAULT_AVATAR_FALLBACK_USER : DEFAULT_AVATAR_FALLBACK_ASSISTANT)}
                </AvatarFallback>
              </>
            )}
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
              {role === MESSAGE_ROLE_USER ? 'You' : (modelName || 'Assistant')}
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

        {thought && (
          <Thinking
            content={thought}
            isStreaming={isStreaming && isThinking}
          />
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
          {showMemoryNotification && memorySaved && (
            <div className="mb-3 -mt-1 -mx-1 rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
              <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Memory saved
                </div>
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                  {Object.keys(memorySaved.facts).slice(0, 3).map((key) => (
                    <div key={key} className="truncate">
                      • {key}
                    </div>
                  ))}
                  {Object.keys(memorySaved.facts).length > 3 && (
                    <div className="text-blue-600 dark:text-blue-400">
                      +{Object.keys(memorySaved.facts).length - 3} more
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMemoryNotification(false)}
                className="shrink-0 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {showTypingIndicator ? (
            <TypingIndicator className="px-0 py-1" />
          ) : (
            <div className="text-sm leading-[1.6] w-full">
              {/* Thinking moved out */}
              <MarkdownRenderer content={mainContent} />
            </div>
          )}

          {attachments && attachments.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div key={index} className="relative group/attachment">
                  {file.type.startsWith('image/') ? (
                    <div className="relative rounded-lg overflow-hidden border border-border/20 max-w-[200px] max-h-[200px]">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/10 border border-border/20">
                      <div className="w-8 h-8 rounded bg-background/20 flex items-center justify-center text-xs border border-border/20">
                        {file.name.split('.').pop()}
                      </div>
                      <span className="text-xs truncate max-w-[150px]">{file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isStreaming && !isThinking && !showTypingIndicator && (
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
            {isUser && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerate}
                className="h-7 w-7 p-0 hover:bg-muted"
                title="Regenerate response"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isUser && !isStreaming && onRegenerateWithModel && availableModels.length > 0 && (
              <ModelRegenerateDropdown
                models={availableModels}
                currentModelId={modelId}
                onModelSelect={onRegenerateWithModel}
              />
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

