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
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">Home</Button>
          <Button variant="ghost" className="w-full justify-start">Messages</Button>
          <Button variant="ghost" className="w-full justify-start">Settings</Button>
        </div>
      </Sidebar>
      <div className="flex-1 p-8">Main content area</div>
    </div>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <div className="flex h-screen">
      <Sidebar {...args}>
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">Item 1</Button>
          <Button variant="ghost" className="w-full justify-start">Item 2</Button>
          <Button variant="ghost" className="w-full justify-start">Item 3</Button>
        </div>
      </Sidebar>
      <div className="flex-1 p-8">Content</div>
    </div>
  ),
}

export const Expanded: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar collapsed={false}>
        <div className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Conversations
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            Settings
          </Button>
        </div>
      </Sidebar>
      <div className="flex-1 p-8">Main content</div>
    </div>
  ),
}

export const Collapsed: Story = {
  render: () => (
    <div className="flex h-screen">
      <Sidebar collapsed={true}>
        <div className="p-4 space-y-2">
          <Button variant="ghost" size="icon">D</Button>
          <Button variant="ghost" size="icon">C</Button>
          <Button variant="ghost" size="icon">S</Button>
        </div>
      </Sidebar>
      <div className="flex-1 p-8">Main content</div>
    </div>
  ),
}
