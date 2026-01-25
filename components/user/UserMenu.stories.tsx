import type { Meta, StoryObj } from '@storybook/react'
import { UserMenu } from './UserMenu'

const meta = {
  title: 'User/UserMenu',
  component: UserMenu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'UserMenu component for displaying user dropdown menu with profile, settings, and logout options.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof UserMenu>

export default meta
type Story = StoryObj<typeof meta>

const sampleUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://github.com/shadcn.png',
  avatarFallback: 'JD',
}

export const Default: Story = {
  args: {
    user: sampleUser,
    onProfile: () => console.log('Profile'),
    onSettings: () => console.log('Settings'),
    onSignOut: () => console.log('Sign out'),
  },
}

export const Playground: Story = {
  args: {
    user: sampleUser,
    onProfile: () => console.log('Profile'),
    onSettings: () => console.log('Settings'),
    onBilling: () => console.log('Billing'),
    onSignOut: () => console.log('Sign out'),
  },
}

export const WithAvatar: Story = {
  args: {
    user: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://github.com/shadcn.png',
    },
    onProfile: () => console.log('Profile'),
    onSettings: () => console.log('Settings'),
    onSignOut: () => console.log('Sign out'),
  },
}

export const WithFallback: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatarFallback: 'JS',
    },
    onProfile: () => console.log('Profile'),
    onSettings: () => console.log('Settings'),
    onSignOut: () => console.log('Sign out'),
  },
}

export const AllActions: Story = {
  args: {
    user: sampleUser,
    onProfile: () => console.log('Profile'),
    onSettings: () => console.log('Settings'),
    onBilling: () => console.log('Billing'),
    onSignOut: () => console.log('Sign out'),
  },
}
