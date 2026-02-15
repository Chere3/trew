'use client'

import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Send, Paperclip, Mic, Smile } from 'lucide-react'
import { useEffect, useState, useRef, KeyboardEvent } from 'react'
import { EmojiPicker } from './EmojiPicker'

export interface MessageComposerProps {
  onSend?: (message: string, attachments: File[]) => void
  onAttachment?: () => void
  onVoiceInput?: () => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  className?: string
  autoFocus?: boolean
}

function AttachmentPreviewImage({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file)
    setUrl(nextUrl)
    return () => URL.revokeObjectURL(nextUrl)
  }, [file])

  if (!url) return null

  return (
    <Image
      src={url}
      alt={file.name}
      width={80}
      height={80}
      className="w-full h-full object-cover"
      unoptimized
    />
  )
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
  const [files, setFiles] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((message.trim() || files.length > 0) && !disabled) {
      onSend?.(message.trim(), files)
      setMessage('')
      setFiles([])
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
    // Reset input value so same files can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
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

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    // Check if any clipboard item is an image
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          setFiles((prev) => [...prev, file])
        }
      }
    }
  }

  return (
    <div className={cn('bg-transparent p-4 pb-6', className)}>
      <div className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
        {files.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-border group"
              >
                {file.type.startsWith('image/') ? (
                  <AttachmentPreviewImage file={file} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary text-xs text-center p-1 break-words">
                    {file.name.split('.').pop()}
                  </div>
                )}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              multiple
            />
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none pr-20 rounded-xl border-primary/20 focus-visible:border-primary/40 bg-transparent"
              autoFocus={autoFocus}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={triggerFileSelect}
                className="h-7 w-7 p-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
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
            disabled={(!message.trim() && files.length === 0) || disabled}
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
