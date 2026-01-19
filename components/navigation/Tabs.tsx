'use client'

import { Tabs as TabsPrimitive, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

export interface Tab {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: Tab[]
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  orientation = 'horizontal',
}: TabsProps) {
  return (
    <TabsPrimitive
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn(className)}
    >
      <TabsList orientation={orientation}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.content}
        </TabsContent>
      ))}
    </TabsPrimitive>
  )
}
