'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface UserProfileProps {
  name: string
  email?: string
  avatar?: string
  avatarFallback?: string
  role?: string
  status?: 'online' | 'offline' | 'away'
  className?: string
}

export function UserProfile({
  name,
  email,
  avatar,
  avatarFallback,
  role,
  status,
  className,
}: UserProfileProps) {
  const initials = avatarFallback || name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {status && (
              <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background bg-green-500" />
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            {email && <p className="text-sm text-muted-foreground">{email}</p>}
            {role && (
              <Badge variant="secondary" className="mt-1">
                {role}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
