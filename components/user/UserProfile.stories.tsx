import type { Meta, StoryObj } from '@storybook/react'
import { UserProfile } from './UserProfile'

const meta = {
  title: 'User/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'UserProfile component for displaying user information in a card format with avatar and status.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserProfile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
}

export const Playground: Story = {
  args: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://github.com/shadcn.png',
    avatarFallback: 'JD',
    role: 'Administrator',
    status: 'online',
  },
}

export const WithAvatar: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <UserProfile
        name="John Doe"
        email="john.doe@example.com"
        avatar="https://github.com/shadcn.png"
        role="Developer"
        status="online"
      />
      <UserProfile
        name="Jane Smith"
        email="jane.smith@example.com"
        avatarFallback="JS"
        role="Designer"
        status="away"
      />
    </div>
  ),
}

export const WithStatus: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <UserProfile
        name="Online User"
        email="online@example.com"
        status="online"
      />
      <UserProfile
        name="Offline User"
        email="offline@example.com"
        status="offline"
      />
      <UserProfile
        name="Away User"
        email="away@example.com"
        status="away"
      />
    </div>
  ),
}

export const Minimal: Story = {
  render: () => (
    <UserProfile
      name="User Name"
    />
  ),
}
