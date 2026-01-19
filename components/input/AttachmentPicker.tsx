'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, File, Image, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, ChangeEvent } from 'react'

export interface Attachment {
  id: string
  file: File
  preview?: string
  type: 'image' | 'file' | 'document'
}

export interface AttachmentPickerProps {
  onAttach?: (files: File[]) => void
  onRemove?: (id: string) => void
  attachments?: Attachment[]
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  className?: string
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function AttachmentPicker({
  onAttach,
  onRemove,
  attachments = [],
  accept,
  maxSize = 10,
  maxFiles = 5,
  className,
}: AttachmentPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setError(null)

    if (files.length + attachments.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const validFiles: File[] = []
    for (const file of files) {
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds ${maxSize}MB limit`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length > 0) {
      onAttach?.(validFiles)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (id: string) => {
    onRemove?.(id)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <File className="mr-2 h-4 w-4" />
        Attach Files
      </Button>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.file.type)
            return (
              <Card key={attachment.id} className="relative">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs truncate max-w-[100px]">
                      {attachment.file.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(attachment.id)}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
