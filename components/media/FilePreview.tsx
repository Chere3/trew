'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { File, Download, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilePreviewProps {
  file: {
    id: string
    name: string
    size?: number
    type?: string
    url?: string
  }
  onDownload?: () => void
  onRemove?: () => void
  className?: string
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilePreview({
  file,
  onDownload,
  onRemove,
  className,
}: FilePreviewProps) {
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-sm font-medium truncate">
              {file.name}
            </CardTitle>
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {file.type && <div>{file.type}</div>}
            {file.size && <div>{formatFileSize(file.size)}</div>}
          </div>
          {onDownload && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
