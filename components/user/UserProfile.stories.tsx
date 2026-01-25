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
  args: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://github.com/shadcn.png',
    avatarFallback: 'JD',
    role: 'Developer',
    status: 'online',
  },
}

export const WithStatus: Story = {
  args: {
    name: 'Online User',
    email: 'online@example.com',
    avatar: 'https://github.com/shadcn.png',
    avatarFallback: 'JD',
    role: 'Developer',
    status: 'online',
  },
}

export const Minimal: Story = {
  args: {
    name: 'User Name',
  },
}

export const WithRole: Story = {
  args: {
    name: 'Online User',
    email: 'online@example.com',
    avatar: 'https://github.com/shadcn.png',
    avatarFallback: 'JD',
    role: 'Developer',
    status: 'online',
  },
}

