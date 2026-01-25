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
    <div className={cn('flex flex-col h-full', className)}>
      {onNew && (
        <div className="p-4">
          <Button
            onClick={onNew}
            className="w-full shadow-sm hover:shadow-md transition-shadow"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Conversation
          </Button>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="p-2 overflow-visible">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new conversation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1 overflow-visible">
              {conversations.map((conversation) => {
                const isSelected = selectedId === conversation.id;
                return (
                  <div
                    key={conversation.id}
                    className="relative group overflow-visible"
                  >
                    <button
                      onClick={() => onSelect?.(conversation)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-all duration-200',
                        'hover:bg-muted/50 hover:shadow-sm cursor-pointer',
                        'overflow-visible relative',
                        isSelected && 'bg-muted/80 shadow-sm font-medium'
                      )}
                    >
                      <div className="flex items-start gap-2 pr-12">
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5 transition-colors',
                          isSelected
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/50 text-muted-foreground'
                        )}>
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                          <div className="flex items-start gap-2 mb-1 min-w-0">
                            <span className={cn(
                              'text-sm flex-1 min-w-0',
                              isSelected ? 'text-foreground font-semibold' : 'text-foreground'
                            )}
                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {conversation.title}
                            </span>
                            {conversation.unread && conversation.unread > 0 && (
                              <span className="flex-shrink-0 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium min-w-[1.25rem] text-center mt-0.5">
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                          {conversation.preview && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-1"
                            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                              {conversation.preview}
                            </p>
                          )}
                          {conversation.timestamp && (
                            <p className="text-xs text-muted-foreground/70 truncate">
                              {conversation.timestamp.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                ...(conversation.timestamp.getTime() < Date.now() - 86400000 && {
                                  year: 'numeric'
                                })
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Action Menu */}
                    <div className={cn(
                      "absolute right-1 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-auto",
                      isSelected && "opacity-100"
                    )}
                    style={{ pointerEvents: 'auto' }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 flex-shrink-0 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive?.(conversation.id); }}>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onDelete?.(conversation.id); }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
