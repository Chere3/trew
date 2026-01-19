'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Mic, Smile } from 'lucide-react'
import { useState, useRef, KeyboardEvent } from 'react'
import { EmojiPicker } from './EmojiPicker'

export interface MessageComposerProps {
  onSend?: (message: string) => void
  onAttachment?: () => void
  onVoiceInput?: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  className?: string
  autoFocus?: boolean
}

export function MessageComposer({
  onSend,
  onAttachment,
  onVoiceInput,
  placeholder = 'Type your message...',
  disabled = false,
  maxLength,
  className,
  autoFocus = false,
}: MessageComposerProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend?.(message.trim())
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (maxLength && value.length > maxLength) {
      return
    }
    setMessage(value)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = message

    // Insert emoji at cursor position
    const newValue =
      currentValue.substring(0, start) + emoji + currentValue.substring(end)

    // Check maxLength if set
    if (maxLength && newValue.length > maxLength) {
      return
    }

    setMessage(newValue)

    // Set cursor position after inserted emoji
    setTimeout(() => {
      const newCursorPos = start + emoji.length
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)

      // Auto-resize textarea
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }, 0)
  }

  return (
    <div className={cn('bg-transparent p-4 pb-6', className)}>
      <div className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none pr-20 rounded-xl border-primary/20 focus-visible:border-primary/40 bg-transparent"
              autoFocus={autoFocus}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              {onAttachment && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onAttachment}
                  className="h-7 w-7 p-0"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              )}
              {onVoiceInput && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onVoiceInput}
                  className="h-7 w-7 p-0"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              )}
              <EmojiPicker onEmojiSelect={handleEmojiSelect}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  aria-label="Open emoji picker"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </EmojiPicker>
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {maxLength && (
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {message.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}
