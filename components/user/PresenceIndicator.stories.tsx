import type { Meta, StoryObj } from '@storybook/react'
import { PresenceIndicator } from './PresenceIndicator'

const meta = {
  title: 'User/PresenceIndicator',
  component: PresenceIndicator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'PresenceIndicator component for showing user online status with different states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
      description: 'Presence status',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Indicator size',
    },
  },
} satisfies Meta<typeof PresenceIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    status: 'online',
  },
}

export const Playground: Story = {
  args: {
    status: 'online',
    size: 'md',
  },
}

export const Statuses: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="online" />
        <span className="text-xs">Online</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="offline" />
        <span className="text-xs">Offline</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="away" />
        <span className="text-xs">Away</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="busy" />
        <span className="text-xs">Busy</span>
      </div>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="online" size="sm" />
        <span className="text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="online" size="md" />
        <span className="text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PresenceIndicator status="online" size="lg" />
        <span className="text-xs">Large</span>
      </div>
    </div>
  ),
}

export const WithAvatar: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          JD
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator status="online" size="sm" />
        </div>
      </div>
      <div className="relative">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          AB
        </div>
        <div className="absolute -bottom-0.5 -right-0.5">
          <PresenceIndicator status="away" size="sm" />
        </div>
      </div>
    </div>
  ),
}
