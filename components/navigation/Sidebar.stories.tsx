import type { Meta, StoryObj } from '@storybook/react'
import { Sidebar } from './Sidebar'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Sidebar component for navigation with collapsible state. Supports expanded and collapsed modes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Collapsed state',
    },
  },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">Home</Button>
        <Button variant="ghost" className="w-full justify-start">Messages</Button>
        <Button variant="ghost" className="w-full justify-start">Settings</Button>
      </div>
    ),
    collapsed: false,
  },
}

export const Playground: Story = {
  args: {
    children: (
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">Home</Button>
        <Button variant="ghost" className="w-full justify-start">Messages</Button>
        <Button variant="ghost" className="w-full justify-start">Settings</Button>
      </div>
    ),
    collapsed: false,
  },
}

export const Expanded: Story = {
  args: {
    children: (
      <div className="p-4 space-y-2">
        <Button variant="ghost" className="w-full justify-start">Home</Button>
        <Button variant="ghost" className="w-full justify-start">Messages</Button>
        <Button variant="ghost" className="w-full justify-start">Settings</Button>
      </div>
    ),
    collapsed: false,
  },
}

export const Collapsed: Story = {
  args: {
    children: (
      <div className="p-4 space-y-2">
        <Button variant="ghost" size="icon">D</Button>
        <Button variant="ghost" size="icon">C</Button>
        <Button variant="ghost" size="icon">S</Button>
      </div>
    ),
    collapsed: true,
  },
}