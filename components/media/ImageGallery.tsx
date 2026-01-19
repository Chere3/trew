'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Image from 'next/image'

export interface ImageGalleryProps {
  images: Array<{
    id: string
    src: string
    alt?: string
    thumbnail?: string
  }>
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function ImageGallery({
  images,
  className,
  columns = 3,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  const handleImageClick = (index: number) => {
    setSelectedIndex(index)
  }

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length)
    }
  }

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length)
    }
  }

  return (
    <>
      <div className={cn(`grid gap-2 ${columnClasses[columns]}`, className)}>
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleImageClick(index)}
            className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
          >
            <Image
              src={image.thumbnail || image.src}
              alt={image.alt || `Image ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={() => setSelectedIndex(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedIndex !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="relative aspect-video">
                <Image
                  src={images[selectedIndex].src}
                  alt={images[selectedIndex].alt || `Image ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded">
                {selectedIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
