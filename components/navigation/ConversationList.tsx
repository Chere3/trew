'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MessageSquare, Plus, MoreHorizontal, Archive, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Conversation, ConversationListProps as ConversationListPropsType } from '@/lib/types'

export type { Conversation }
export type ConversationListProps = ConversationListPropsType

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onArchive,
  onDelete,
  className,
}: ConversationListProps) {
  return (
    <div className={cn('flex h-full flex-col', className)}>
      {onNew && (
        <div className="p-3">
          <Button onClick={onNew} className="w-full" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New conversation
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isSelected = selectedId === conversation.id
                return (
                  <div key={conversation.id} className="relative group">
                    <button
                      onClick={() => onSelect?.(conversation)}
                      className={cn(
                        'w-full rounded-md border px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-border bg-accent/70'
                          : 'border-transparent hover:border-border hover:bg-accent/40'
                      )}
                    >
                      <div className="flex items-start gap-2 pr-9">
                        <div
                          className={cn(
                            'mt-0.5 flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0',
                            isSelected ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          <span className={cn('text-sm', isSelected ? 'font-medium text-foreground' : 'text-foreground')}>
                            {conversation.title}
                          </span>
                          {conversation.preview && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{conversation.preview}</p>
                          )}
                        </div>
                      </div>
                    </button>

                    <div className={cn('absolute right-1 top-1.5 opacity-0 transition-opacity group-hover:opacity-100', isSelected && 'opacity-100')}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive?.(conversation.id); }}>
                            <Archive className="mr-2 h-4 w-4" />Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete?.(conversation.id); }} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
