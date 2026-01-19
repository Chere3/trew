'use client'

import { useState, useEffect, useRef, useCallback, KeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getEmojisByCategory,
  searchEmojis,
  CATEGORIES,
  type Category,
  type EmojiItem,
} from '@/lib/emoji-data'

const STORAGE_KEY = 'trew-recent-emojis'
const MAX_RECENT_EMOJIS = 30

export interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  children?: React.ReactNode
  className?: string
}

function useRecentEmojis() {
  const [recentEmojis, setRecentEmojis] = useState<EmojiItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecentEmojis(parsed)
      }
    } catch (error) {
      console.error('Failed to load recent emojis:', error)
    }
  }, [])

  const addRecentEmoji = useCallback((emoji: EmojiItem) => {
    setRecentEmojis((prev) => {
      const filtered = prev.filter((e) => e.emoji !== emoji.emoji)
      const updated = [emoji, ...filtered].slice(0, MAX_RECENT_EMOJIS)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save recent emojis:', error)
      }
      return updated
    })
  }, [])

  return { recentEmojis, addRecentEmoji }
}

function EmojiGrid({
  emojis,
  onSelect,
  focusedIndex,
  onFocusChange,
  searchQuery,
}: {
  emojis: EmojiItem[]
  onSelect: (emoji: EmojiItem) => void
  focusedIndex: number
  onFocusChange: (index: number) => void
  searchQuery?: string
}) {
  const gridRef = useRef<HTMLDivElement>(null)
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  useEffect(() => {
    if (focusedIndex >= 0 && buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, index: number) => {
      const cols = 8 // 8 columns per row
      const totalEmojis = emojis.length

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          onFocusChange((index + 1) % totalEmojis)
          break
        case 'ArrowLeft':
          e.preventDefault()
          onFocusChange((index - 1 + totalEmojis) % totalEmojis)
          break
        case 'ArrowDown':
          e.preventDefault()
          const nextRow = Math.min(index + cols, totalEmojis - 1)
          onFocusChange(nextRow)
          break
        case 'ArrowUp':
          e.preventDefault()
          const prevRow = Math.max(index - cols, 0)
          onFocusChange(prevRow)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          onSelect(emojis[index])
          break
        case 'Home':
          e.preventDefault()
          onFocusChange(0)
          break
        case 'End':
          e.preventDefault()
          onFocusChange(totalEmojis - 1)
          break
      }
    },
    [emojis, onSelect, onFocusChange]
  )

  if (emojis.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {searchQuery ? 'No emojis found' : 'No emojis available'}
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label={searchQuery ? `Search results for "${searchQuery}"` : 'Emoji picker'}
      className="grid grid-cols-8 gap-1.5 p-3"
      onKeyDown={(e) => {
        if (focusedIndex >= 0) {
          handleKeyDown(e, focusedIndex)
        }
      }}
    >
      {emojis.map((emoji, index) => (
        <button
          key={`${emoji.emoji}-${index}`}
          ref={(el) => {
            buttonRefs.current[index] = el
          }}
          type="button"
          role="gridcell"
          aria-label={emoji.label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all',
        'hover:bg-accent/60 hover:scale-110',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'active:scale-95',
        focusedIndex === index && 'bg-accent/60 ring-2 ring-primary/40 ring-offset-1'
      )}
          onClick={() => onSelect(emoji)}
          onFocus={() => onFocusChange(index)}
        >
          {emoji.emoji}
        </button>
      ))}
    </div>
  )
}

export function EmojiPicker({ onEmojiSelect, children, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>(CATEGORIES[0])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { recentEmojis, addRecentEmoji } = useRecentEmojis()

  const searchResults = searchQuery
    ? searchEmojis(searchQuery).slice(0, 64) // Limit search results
    : []

  const categoryEmojis = getEmojisByCategory(selectedCategory).slice(0, 64) // Limit per category
  const displayEmojis = searchQuery ? searchResults : categoryEmojis

  const handleEmojiSelect = useCallback(
    (emoji: EmojiItem) => {
      addRecentEmoji(emoji)
      onEmojiSelect(emoji.emoji)
      setOpen(false)
      setSearchQuery('')
      setFocusedIndex(-1)
    },
    [onEmojiSelect, addRecentEmoji]
  )

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Focus search input when opening
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 0)
    } else {
      setSearchQuery('')
      setFocusedIndex(-1)
    }
  }, [])

  const handleSearchKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' && displayEmojis.length > 0) {
        e.preventDefault()
        setFocusedIndex(0)
        e.currentTarget.blur()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    },
    [displayEmojis.length]
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn('h-7 w-7 p-0', className)}
            aria-label="Open emoji picker"
            aria-haspopup="dialog"
            aria-expanded={open}
          >
            😊
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[352px] p-0"
        align="start"
        side="top"
        sideOffset={8}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          searchInputRef.current?.focus()
        }}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
        }}
      >
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="border-b border-border/50 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search emojis..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setFocusedIndex(-1)
                }}
                onKeyDown={handleSearchKeyDown}
                className="pl-9 rounded-xl border-primary/20 focus-visible:border-primary/40"
                aria-label="Search emojis"
              />
            </div>
          </div>

          {/* Category Tabs or Recently Used */}
          {!searchQuery && (
            <Tabs
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value as Category)
                setFocusedIndex(-1)
              }}
              className="w-full"
            >
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="h-auto min-w-full justify-start rounded-none border-b border-border/50 bg-transparent px-3 py-1 inline-flex">
                  {CATEGORIES.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="px-3 py-2 text-xs rounded-lg data-[state=active]:bg-accent/50 data-[state=active]:text-foreground"
                      aria-label={`${category} category`}
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Recently Used Section */}
              {recentEmojis.length > 0 && selectedCategory === CATEGORIES[0] && (
                <div className="border-b border-border/50 p-3">
                  <div className="mb-2 text-xs font-medium text-muted-foreground">
                    Recently Used
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentEmojis.slice(0, 12).map((emoji, index) => (
                      <button
                        key={`recent-${emoji.emoji}-${index}`}
                        type="button"
                        aria-label={`${emoji.label}, recently used`}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-xl text-lg transition-all',
                          'hover:bg-accent/60 hover:scale-110',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                          'active:scale-95'
                        )}
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {CATEGORIES.map((category) => (
                <TabsContent key={category} value={category} className="mt-0">
                  <ScrollArea className="h-[280px]">
                    <EmojiGrid
                      emojis={getEmojisByCategory(category).slice(0, 64)}
                      onSelect={handleEmojiSelect}
                      focusedIndex={focusedIndex}
                      onFocusChange={setFocusedIndex}
                    />
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {/* Search Results */}
          {searchQuery && (
            <ScrollArea className="h-[280px]">
              <EmojiGrid
                emojis={searchResults}
                onSelect={handleEmojiSelect}
                focusedIndex={focusedIndex}
                onFocusChange={setFocusedIndex}
                searchQuery={searchQuery}
              />
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
