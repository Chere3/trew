'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { MessageSquare, Plus } from 'lucide-react'

export interface Conversation {
  id: string
  title: string
  preview?: string
  timestamp?: Date
  unread?: number
}

export interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect?: (conversation: Conversation) => void
  onNew?: () => void
  className?: string
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
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
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new conversation to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const isSelected = selectedId === conversation.id;
                return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelect?.(conversation)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-all duration-200',
                      'hover:bg-muted/50 hover:shadow-sm',
                      isSelected && 'bg-muted/80 shadow-sm font-medium'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 mt-0.5 transition-colors',
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                      )}>
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={cn(
                            'text-sm truncate',
                            isSelected ? 'text-foreground font-semibold' : 'text-foreground'
                          )}>
                            {conversation.title}
                          </span>
                          {conversation.unread && conversation.unread > 0 && (
                            <span className="flex-shrink-0 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-medium min-w-[1.25rem] text-center">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        {conversation.preview && (
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {conversation.preview}
                          </p>
                        )}
                        {conversation.timestamp && (
                          <p className="text-xs text-muted-foreground/70">
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
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
