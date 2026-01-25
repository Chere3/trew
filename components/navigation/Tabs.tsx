'use client'

import { Tabs as TabsPrimitive, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Tab, TabsProps as TabsPropsType } from '@/lib/types'

export type { Tab }
export type TabsProps = TabsPropsType

export function Tabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
}: TabsProps) {
  return (
    <TabsPrimitive
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn(className)}
    >
      <TabsList>
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
