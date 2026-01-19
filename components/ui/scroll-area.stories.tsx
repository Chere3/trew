import type { Meta, StoryObj } from '@storybook/react'
import { ScrollArea } from './scroll-area'

const meta = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ScrollArea component for creating custom scrollable containers. Uses Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ScrollArea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="text-sm">
            Item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Playground: Story = {
  render: () => (
    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
      <div className="space-y-2">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="text-sm">
            Scrollable content item {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const LongContent: Story = {
  render: () => (
    <ScrollArea className="h-[300px] w-[400px] rounded-md border p-4">
      <div className="space-y-4">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Section {i + 1}</h3>
            <p className="text-sm text-muted-foreground">
              This is a longer content section that demonstrates scrolling behavior.
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}

export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-[350px] whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="shrink-0 w-[200px] border rounded-lg p-4">
            Card {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
}
