'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { ArchivedChatsList } from '@/components/chat/ArchivedChatsList'
import { MemoryManager } from './MemoryManager'
import { cn } from '@/lib/utils'
import { THINKING_COLLAPSED_DEFAULT_KEY } from '@/lib/constants'

export interface SettingsPanelProps {
  className?: string
  hideHeader?: boolean
}

export function SettingsPanel({ className, hideHeader = false }: SettingsPanelProps) {
  const [expandThinkingByDefault, setExpandThinkingByDefault] = useState(() => {
    if (typeof window === "undefined") return false
    const stored = localStorage.getItem(THINKING_COLLAPSED_DEFAULT_KEY)
    return stored === "true"
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    if (expandThinkingByDefault) {
      localStorage.setItem(THINKING_COLLAPSED_DEFAULT_KEY, "true")
    } else {
      localStorage.setItem(THINKING_COLLAPSED_DEFAULT_KEY, "false")
    }
  }, [expandThinkingByDefault])

  return (
    <div className={cn('h-full', className)}>
      {!hideHeader && (
        <div className="px-6 py-4 border-b border-border/10">
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
      )}

      <Tabs defaultValue="general" className="flex h-full" orientation="vertical">
        <div className="w-[240px] border-r border-border/10 bg-secondary/5 shrink-0 p-4 sticky top-0 h-full">
          <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
            <TabsTrigger
              value="general"
              className="w-full justify-start px-3 py-2 h-9 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-colors border-transparent text-muted-foreground"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="w-full justify-start px-3 py-2 h-9 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-colors border-transparent text-muted-foreground"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="w-full justify-start px-3 py-2 h-9 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-colors border-transparent text-muted-foreground"
            >
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="chats"
              className="w-full justify-start px-3 py-2 h-9 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-colors border-transparent text-muted-foreground"
            >
              Chats
            </TabsTrigger>
            <TabsTrigger
              value="memory"
              className="w-full justify-start px-3 py-2 h-9 font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-secondary/50 transition-colors border-transparent text-muted-foreground"
            >
              Memory
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            <TabsContent value="general" className="space-y-4 mt-0 border-0 p-0 shadow-none data-[state=active]:block">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-medium">General Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your general preferences
                </p>
              </div>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your account activity
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save conversations</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your conversation history
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Expand thinking by default</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically expand the thought process when messages are displayed
                      </p>
                    </div>
                    <Switch 
                      checked={expandThinkingByDefault}
                      onCheckedChange={setExpandThinkingByDefault}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chats" className="space-y-4 mt-0 border-0 p-0 shadow-none data-[state=active]:flex flex-col h-full">
              <div className="space-y-1 mb-6 shrink-0">
                <h3 className="text-lg font-medium">Chats</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your archived chats and history
                </p>
              </div>
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-0 h-full">
                  <ArchivedChatsList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 mt-0 border-0 p-0 shadow-none data-[state=active]:block">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-medium">Notification Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive notifications
                </p>
              </div>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in your browser
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4 mt-0 border-0 p-0 shadow-none data-[state=active]:block">
              <MemoryManager />
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-0 border-0 p-0 shadow-none data-[state=active]:block">
              <div className="space-y-1 mb-6">
                <h3 className="text-lg font-medium">Appearance</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the look and feel of the application
                </p>
              </div>
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred theme. Select &quot;System&quot; to follow your device&apos;s theme setting.
                    </p>
                    <ThemeToggle variant="dropdown" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
