'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import { useState } from 'react'

export interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchBar({
  onSearch,
  placeholder = 'Search...',
  className,
  debounceMs = 300,
}: SearchBarProps) {
  const [query, setQuery] = useState('')

  const handleChange = (value: string) => {
    setQuery(value)
    if (onSearch) {
      const timeoutId = setTimeout(() => {
        onSearch(value)
      }, debounceMs)
      return () => clearTimeout(timeoutId)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {query && (
        <button
          onClick={() => handleChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}
