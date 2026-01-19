'use client'

import { cn } from '@/lib/utils'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { User, Settings, LogOut, CreditCard } from 'lucide-react'

export interface UserMenuProps {
  user: {
    name: string
    email?: string
    avatar?: string
    avatarFallback?: string
  }
  collapsed?: boolean
  onProfile?: () => void
  onSettings?: () => void
  onBilling?: () => void
  onSignOut?: () => void
}

export function UserMenu({
  user,
  collapsed,
  onProfile,
  onSettings,
  onBilling,
  onSignOut,
}: UserMenuProps) {
  const initials = user.avatarFallback || user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative flex items-center gap-3 w-full hover:bg-secondary/50",
            collapsed ? "h-10 w-10 p-0 justify-center rounded-xl" : "h-auto p-3 justify-start rounded-xl"
          )}
        >
          <Avatar className="h-9 w-9 border border-border/10 shadow-sm shrink-0">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">{initials}</AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex flex-col items-start min-w-0 text-left">
              <span className="text-sm font-semibold truncate w-full">{user.name}</span>
              {user.email && (
                <span className="text-xs text-muted-foreground truncate w-full opacity-80 decoration-0">
                  {user.email}
                </span>
              )}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60 p-1" align={collapsed ? "center" : "start"} side={collapsed ? "right" : "top"} forceMount>
        <div className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg mb-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 overflow-hidden">
            <p className="text-sm font-semibold truncate leading-none">{user.name}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate leading-none">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="my-1" />
        {onProfile && (
          <DropdownMenuItem onClick={onProfile} className="gap-2 p-2 cursor-pointer">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}
        {onSettings && (
          <DropdownMenuItem onClick={onSettings} className="gap-2 p-2 cursor-pointer">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}
        {onBilling && (
          <DropdownMenuItem onClick={onBilling} className="gap-2 p-2 cursor-pointer">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>Billing</span>
          </DropdownMenuItem>
        )}
        {onSignOut && (
          <>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem onClick={onSignOut} className="gap-2 p-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
