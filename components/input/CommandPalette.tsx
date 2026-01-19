'use client'

import { Input } from '@/components/ui/input'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useState, KeyboardEvent } from 'react'

export interface CommandOption {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  keywords?: string[]
}

export interface CommandPaletteProps {
  commands: CommandOption[]
  onSelect?: (command: CommandOption) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  className?: string
}

export function CommandPalette({
  commands,
  onSelect,
  open,
  onOpenChange,
  placeholder = 'Type a command or search...',
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('')

  const filteredCommands = commands.filter((cmd) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      cmd.label.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(searchLower))
    )
  })

  const handleSelect = (command: CommandOption) => {
    onSelect?.(command)
    setSearch('')
    onOpenChange?.(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onOpenChange?.(false)
      setSearch('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('p-0', className)}>
        <Command>
          <Input
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0"
          />
          <CommandList>
            <CommandEmpty>No commands found.</CommandEmpty>
            <CommandGroup>
              {filteredCommands.map((command) => (
                <CommandItem
                  key={command.id}
                  onSelect={() => handleSelect(command)}
                  className="flex items-center gap-2"
                >
                  {command.icon}
                  <div className="flex flex-col">
                    <span>{command.label}</span>
                    {command.description && (
                      <span className="text-xs text-muted-foreground">
                        {command.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
