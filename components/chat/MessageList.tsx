import { useRef, useEffect, useCallback, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'
import { MessageBubble } from './MessageBubble'
import type { Message, MessageListProps as MessageListPropsType, Model } from '@/lib/types'
import { MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT } from '@/lib/constants'

export type { Message }
export type MessageListProps = MessageListPropsType

export function MessageList({
  messages,
  isLoadingOlder = false,
  className,
  availableModels = [],
  onRegenerate,
  onRegenerateWithModel,
  getProviderIcon,
  onScrollNearTop,
  hasMore = false,
}: MessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastScrollTopRef = useRef(0)
  const [containerHeight, setContainerHeight] = useState(600)
  const userMessageWithSpacerRef = useRef<string | null>(null) // Track which user message has the spacer
  const sizeCacheRef = useRef<Map<string, number>>(new Map())

  // Find the last user message to determine if we need to reserve space
  const lastUserMessage = messages.length > 0 
    ? [...messages].reverse().find(m => m.role === MESSAGE_ROLE_USER)
    : null
  const lastUserMessageIndex = lastUserMessage 
    ? messages.findIndex(msg => msg.id === lastUserMessage.id)
    : -1
  
  // Find the assistant message after the last user message
  const assistantMessageAfterUser = lastUserMessageIndex >= 0
    ? messages.slice(lastUserMessageIndex + 1).find(m => m.role === MESSAGE_ROLE_ASSISTANT)
    : null
  
  // Keep spacer only if:
  // 1. There's a user message that should have spacer (tracked in ref)
  // 2. AND (no assistant message after it OR assistant is still streaming)
  // This ensures spacer is removed once assistant message is complete
  const hasPendingAssistantMessage = lastUserMessage && 
    (userMessageWithSpacerRef.current === null || 
     userMessageWithSpacerRef.current === lastUserMessage.id) &&
    (!assistantMessageAfterUser || assistantMessageAfterUser.isStreaming === true)

  // Create virtualizer with optimized settings
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    // Use a stable key so measurements don't get associated to the wrong row
    // when messages are inserted/removed/replaced.
    getItemKey: (index) => messages[index]?.id ?? index,
    // Use cached measured size when available (fixes overlap when measurement cache fails/stales)
    estimateSize: (index) => {
      const id = messages[index]?.id
      if (!id) return 150
      return sizeCacheRef.current.get(id) ?? 150
    },
    overscan: 3, // Reduced from 5 to improve performance
  })

  // Wrap virtualizer's measureElement so we can keep a local size cache.
  const measureRowRef = useCallback(
    (el: HTMLDivElement | null) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(virtualizer as any).measureElement?.(el)
      } catch {}

      if (!el) return
      const idxAttr = el.getAttribute('data-index')
      const idx = idxAttr ? Number(idxAttr) : null
      const height = el.getBoundingClientRect().height
      const msgId = typeof idx === 'number' ? messages[idx]?.id : undefined

      if (msgId) {
        const prev = sizeCacheRef.current.get(msgId)
        if (typeof prev !== 'number' || Math.abs(prev - height) > 1) {
          sizeCacheRef.current.set(msgId, height)
          try {
            // Recompute layout using updated estimateSize cache
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(virtualizer as any).measure?.()
          } catch {}
        }
      }
    },
    [virtualizer, messages]
  )

  // Throttled scroll handler for loading older messages
  const handleScrollThrottled = useCallback(() => {
    // Cancel previous timeout if still pending
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const scrollElement = parentRef.current
      if (!scrollElement || !onScrollNearTop || !hasMore || isLoadingOlder) {
        scrollTimeoutRef.current = null
        return
      }

      const scrollTop = scrollElement.scrollTop
      // Only check if scroll position changed significantly (reduces checks)
      if (Math.abs(scrollTop - lastScrollTopRef.current) < 100) {
        scrollTimeoutRef.current = null
        return
      }

      lastScrollTopRef.current = scrollTop

      // Load more when within 200px of top
      if (scrollTop < 200) {
        onScrollNearTop()
      }
      scrollTimeoutRef.current = null
    }, 150) // Throttle to 150ms for better performance
  }, [onScrollNearTop, hasMore, isLoadingOlder])

  // Handle scroll detection for loading older messages with throttling
  useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement || !onScrollNearTop || !hasMore) return

    scrollElement.addEventListener('scroll', handleScrollThrottled, { passive: true })
    return () => {
      scrollElement.removeEventListener('scroll', handleScrollThrottled)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [handleScrollThrottled, onScrollNearTop, hasMore])

  // Track if this is the first render to scroll to bottom initially
  const isFirstRender = useRef(true)
  const lastMessageCountRef = useRef(messages.length)
  const lastUserMessageIdRef = useRef<string | null>(null)
  // The message `id` / `createdAt` are not stable (temp message can be replaced).
  // Use `lastUserMessageIndex` as the source of truth instead.
  const lastAutoScrolledUserIndexRef = useRef<number | null>(null)
  const prevAssistantStreamingRef = useRef<boolean>(false)
  const lockedScrollPositionRef = useRef<number | null>(null)
  const isLockingScrollRef = useRef(false)
  const isSpacerRemovingRef = useRef(false)

  // Track container height for spacer calculation
  useEffect(() => {
    const updateHeight = () => {
      if (parentRef.current) {
        setContainerHeight(parentRef.current.clientHeight)
      }
    }
    
    updateHeight()
    const resizeObserver = new ResizeObserver(updateHeight)
    if (parentRef.current) {
      resizeObserver.observe(parentRef.current)
    }
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [containerHeight])
  
  // Track hasPendingAssistantMessage changes and maintain scroll position when spacer is removed
  const prevHasPendingRef = useRef(hasPendingAssistantMessage)
  useEffect(() => {
    if (prevHasPendingRef.current !== hasPendingAssistantMessage) {
      const scrollElement = parentRef.current
      const wasPending = prevHasPendingRef.current
      const isPending = hasPendingAssistantMessage
      
      // When spacer is removed (was pending, now not), mark for scroll compensation
      if (wasPending && !isPending && scrollElement && lastUserMessageIdRef.current) {
        isSpacerRemovingRef.current = true
        
        // Clear the flag after a short delay to allow continuous lock to handle it
        setTimeout(() => {
          isSpacerRemovingRef.current = false
        }, 500)
      } else if (!isPending) {
        isSpacerRemovingRef.current = false
      }
      
      prevHasPendingRef.current = hasPendingAssistantMessage
    }
  }, [hasPendingAssistantMessage, assistantMessageAfterUser])

  // Autoscroll methodology v2 (source-of-truth):
  // - Don't trust `messages.length`, `id`, or `createdAt` alone; optimistic messages can be replaced.
  // - Use derived `lastUserMessageIndex` to decide which message to pin.
  useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return
    if (messages.length === 0) return

    const lastMsg = messages[messages.length - 1]
    const TARGET_TOP_OFFSET = 24 // matches `translate3d(... start + 24)` and `py-6`
    const isAssistantStreamingNow = Boolean(assistantMessageAfterUser?.isStreaming)
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // If items are dynamically changing size (esp. streaming content), force a re-measure pass.
    // This prevents stale estimated sizes from causing row overlap.
    if (isAssistantStreamingNow) {
      requestAnimationFrame(() => {
        try {
          // @tanstack/react-virtual exposes measure() to recompute item sizes for rendered elements.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(virtualizer as any).measure?.()
        } catch {}
      })
    }

    const alignMessageElementToTop = (msgId: string | undefined, reason: string, attempt: number = 0) => {
      if (!msgId) return
      const el = document.getElementById(`message-${msgId}`)
      const containerRect = scrollElement.getBoundingClientRect()
      const elRect = el?.getBoundingClientRect()
      const deltaTop = elRect ? elRect.top - containerRect.top : null
      const correction = typeof deltaTop === 'number' ? deltaTop - TARGET_TOP_OFFSET : null

      if (typeof correction === 'number' && Math.abs(correction) > 2) {
        scrollElement.scrollTop = scrollElement.scrollTop + correction

        if (attempt < 2) {
          requestAnimationFrame(() => {
            alignMessageElementToTop(msgId, reason, attempt + 1)
          })
        }
      }
    }

    const alignAfterScrollSettles = (msgId: string | undefined, reason: string) => {
      if (!msgId) return
      // Wait until smooth scrolling settles, then do a final pixel-perfect correction.
      // This prevents an immediate `scrollTop = ...` from cancelling the smooth animation.
      let frames = 0
      let stableFrames = 0
      let prev = scrollElement.scrollTop

      const tick = () => {
        frames += 1
        const cur = scrollElement.scrollTop
        if (Math.abs(cur - prev) < 0.5) stableFrames += 1
        else stableFrames = 0
        prev = cur

        if (stableFrames >= 2 || frames >= 60) {
          alignMessageElementToTop(msgId, reason)
          return
        }
        requestAnimationFrame(tick)
      }

      requestAnimationFrame(tick)
    }

    // If a new user message was appended, scroll the derived last user message to the top.
    if (lastMsg.role === MESSAGE_ROLE_USER && lastUserMessageIndex >= 0) {
      const idx = lastUserMessageIndex
      if (lastAutoScrolledUserIndexRef.current !== idx) {
        lastAutoScrolledUserIndexRef.current = idx
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(virtualizer as any)?.measure?.()
            } catch {}
            try {
              virtualizer.scrollToIndex(idx, {
                align: 'start',
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
              })
            } catch (error) {
              // ignore
            }
            alignAfterScrollSettles(messages[idx]?.id, 'after user scrollToIndex')
          })
        })
      }
    }

    // Re-scroll exactly once when assistant starts streaming (layout shifts)
    const assistantStreamingStarted = isAssistantStreamingNow && !prevAssistantStreamingRef.current
    prevAssistantStreamingRef.current = isAssistantStreamingNow

    if (assistantStreamingStarted && lastUserMessageIndex >= 0) {
      const idxToScroll = lastUserMessageIndex
      if (idxToScroll >= 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(virtualizer as any)?.measure?.()
            } catch {}
            try {
              // Keep this instant: during streaming we run periodic pin corrections,
              // which would cancel a smooth scroll anyway.
              virtualizer.scrollToIndex(idxToScroll, { align: 'start', behavior: 'auto' })
              requestAnimationFrame(() => {
                const msgId = messages[idxToScroll]?.id
                alignMessageElementToTop(msgId, 'after assistant-start re-scroll')
              })
            } catch (error) {
              // ignore
            }
          })
        })
      }
    }

    // During streaming, keep the pinned user message aligned (no lock loop; just correct on message updates)
    if (isAssistantStreamingNow && lastUserMessageIndex >= 0) {
      alignMessageElementToTop(messages[lastUserMessageIndex]?.id, 'assistant streaming tick')
    }
  }, [messages, assistantMessageAfterUser?.id, assistantMessageAfterUser?.isStreaming, virtualizer])

  // Auto-scroll user messages to top when added, reserve space for assistant
  useEffect(() => {
    if (messages.length === 0) return

    const scrollElement = parentRef.current
    if (!scrollElement) {
      return
    }

    const messageCountChanged = messages.length !== lastMessageCountRef.current
    lastMessageCountRef.current = messages.length

    // On first render, scroll to show the last user message at top if it exists
    if (isFirstRender.current) {
      isFirstRender.current = false
      // Wait for virtualizer to measure and render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (scrollElement && messages.length > 0) {
              // Find the last user message
              const lastUserMsg = [...messages].reverse().find(m => m.role === MESSAGE_ROLE_USER)
              if (lastUserMsg) {
                const element = document.getElementById(`message-${lastUserMsg.id}`)
                if (element) {
                  const elementRect = element.getBoundingClientRect()
                  const containerRect = scrollElement.getBoundingClientRect()
                  const relativeTop = elementRect.top - containerRect.top + scrollElement.scrollTop
                  scrollElement.scrollTop = relativeTop
                  lastUserMessageIdRef.current = lastUserMsg.id
                  userMessageWithSpacerRef.current = lastUserMsg.id
                }
              }
            }
          })
        })
      })
      return
    }

    // v1 autoscroll disabled: v2 handles all scrolling after mount
    return

    // Only check auto-scroll if messages actually changed
    if (!messageCountChanged) {
      return
    }

    // Check if the last message is a new user message
    const lastMsg = messages[messages.length - 1]
    const isNewUserMessage = lastMsg.role === MESSAGE_ROLE_USER && lastMsg.id !== lastUserMessageIdRef.current
    const isAssistantMessage = lastMsg.role === MESSAGE_ROLE_ASSISTANT

    if (isNewUserMessage) {
      lastUserMessageIdRef.current = lastMsg.id
      userMessageWithSpacerRef.current = lastMsg.id // Track this user message for spacer
      
      // Find the message index
      const messageIndex = messages.findIndex(m => m.id === lastMsg.id)
      
      // NEW METHODOLOGY: Use virtualizer's scrollToIndex API
      // This is the proper way to scroll in virtualized lists
      if (messageIndex >= 0) {
        // Wait for virtualizer to update, then scroll to the index
        // align: 'start' positions the item at the top of the container
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              virtualizer.scrollToIndex(messageIndex, {
                align: 'start',
                behavior: 'auto'
              })
            } catch (error) {
              // ignore
            }
          })
        })
      }
    } else if (isAssistantMessage && lastMsg.isStreaming && lastUserMessageIdRef.current) {
      // When assistant message starts streaming, re-scroll to user message using virtualizer API
      // This compensates for position shift when virtualizer recalculates
      const userMessageIndex = messages.findIndex(m => m.id === lastUserMessageIdRef.current)
      if (userMessageIndex >= 0) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            try {
              virtualizer.scrollToIndex(userMessageIndex, {
                align: 'start',
                behavior: 'auto'
              })
            } catch (error) {
              // ignore
            }
          })
        })
      }
    } else if (isAssistantMessage && !lastMsg.isStreaming && lastUserMessageIdRef.current) {
      // Assistant message finished streaming - clear any lock state
      isLockingScrollRef.current = false
      lockedScrollPositionRef.current = null
    }
    // Note: We don't auto-scroll when assistant messages are added/streaming
    // This keeps the user message at the top and space reserved below
  }, [messages.length, messages, hasPendingAssistantMessage, virtualizer.getTotalSize(), containerHeight])

  // Disabled continuous scroll lock - it was causing re-rendering issues
  // The scroll position will be maintained naturally by the virtualizer and spacer
  useEffect(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    // Only handle spacer removal compensation, no continuous scroll locking
    if (!isSpacerRemovingRef.current) return

    // Maintain scroll position on every frame
    // Recalculate target dynamically based on user message element to handle virtualizer recalculations
    const maintainScroll = () => {
      if (!scrollElement) return
      
      let targetScrollTop: number | null = null
      
      // Only handle spacer removal compensation
      if (isSpacerRemovingRef.current && lastUserMessageIdRef.current) {
        // Calculate user message position for spacer removal compensation
        const userElement = document.getElementById(`message-${lastUserMessageIdRef.current}`)
        if (userElement) {
          const userElementRect = userElement.getBoundingClientRect()
          const containerRect = scrollElement.getBoundingClientRect()
          targetScrollTop = userElementRect.top - containerRect.top + scrollElement.scrollTop
        }
      }
      
      if (targetScrollTop === null) return
      
      const currentScroll = scrollElement.scrollTop
      const diff = Math.abs(currentScroll - targetScrollTop)
      if (diff > 5) {
        scrollElement.scrollTop = targetScrollTop
      }
    }

    // Only run once for spacer removal, not continuously
    if (isSpacerRemovingRef.current) {
      maintainScroll()
    }
  }, [messages, hasPendingAssistantMessage])

  return (
    <div
      ref={parentRef}
      className={cn(
        'flex flex-col w-full max-w-4xl mx-auto overflow-y-auto',
        className
      )}
      style={{
        // Force GPU acceleration
        transform: 'translateZ(0)',
        // Ensure proper height - use 100% to fill parent, with min-height 0 for flex
        height: '100%',
        minHeight: 0,
        maxHeight: '100%',
      }}
    >
      {/* Loading indicator for older messages */}
      {isLoadingOlder && (
        <div className="flex justify-center py-2 sticky top-0 bg-background z-10">
          <div className="text-sm text-muted-foreground">Loading older messages...</div>
        </div>
      )}

      {/* Virtualized messages container */}
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize() + (hasPendingAssistantMessage ? containerHeight : 0)}px`,
          flexShrink: 0, // Prevent flex from constraining height
          minHeight: `${virtualizer.getTotalSize() + (hasPendingAssistantMessage ? containerHeight : 0)}px`, // Ensure minimum height
        }}
      >
        <div className="flex flex-col py-6 space-y-1">
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = messages[virtualItem.index]
            if (!message) return null

            return (
              <div
                key={message.id}
                data-index={virtualItem.index}
                ref={measureRowRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translate3d(0, ${virtualItem.start + 24}px, 0)`, // Use translate3d for GPU acceleration
                  willChange: 'transform', // Hint browser for optimization
                }}
              >
                <MessageBubble
                  id={`message-${message.id}`}
                  role={message.role}
                  content={message.content}
                  timestamp={new Date(message.createdAt)}
                  attachments={message.attachments}
                  isStreaming={message.isStreaming}
                  onCopy={() => {
                    navigator.clipboard.writeText(message.content)
                  }}
                  onRegenerate={
                    message.role === MESSAGE_ROLE_USER && onRegenerate
                      ? () => onRegenerate(message.id)
                      : undefined
                  }
                  onRegenerateWithModel={
                    message.role === MESSAGE_ROLE_ASSISTANT && onRegenerateWithModel
                      ? (modelId: string) => onRegenerateWithModel(message.id, modelId)
                      : undefined
                  }
                  modelName={
                    message.model
                      ? availableModels.find((m) => m.id === message.model)?.name ||
                        message.model
                      : undefined
                  }
                  modelId={message.model}
                  availableModels={availableModels}
                  providerIcon={getProviderIcon ? getProviderIcon(message) : undefined}
                  memorySaved={message.memorySaved}
                />
              </div>
            )
          })}
        </div>
        {/* Spacer to reserve space for assistant message when user message is at top */}
        {hasPendingAssistantMessage && (
          <div 
            className="w-full"
            style={{
              position: 'absolute',
              top: `${virtualizer.getTotalSize()}px`,
              left: 0,
              height: `${containerHeight}px`,
              minHeight: `${containerHeight}px`,
            }}
          />
        )}
      </div>
    </div>
  )
}
