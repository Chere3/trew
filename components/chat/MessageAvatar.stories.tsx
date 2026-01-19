import type { Meta, StoryObj } from '@storybook/react'
import { MessageAvatar } from './MessageAvatar'

const meta = {
  title: 'Chat/MessageAvatar',
  component: MessageAvatar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MessageAvatar component for displaying user avatars in chat messages with online status indicators.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
    },
    isOnline: {
      control: 'boolean',
      description: 'Online status',
    },
  },
} satisfies Meta<typeof MessageAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    fallback: 'JD',
  },
}

export const Playground: Story = {
  args: {
    src: 'https://github.com/shadcn.png',
    fallback: 'CN',
    size: 'md',
    isOnline: true,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <MessageAvatar size="sm" fallback="SM" />
      <MessageAvatar size="md" fallback="MD" />
      <MessageAvatar size="lg" fallback="LG" />
    </div>
  ),
}

export const WithImage: Story = {
  render: () => (
    <div className="flex gap-4">
      <MessageAvatar
        src="https://github.com/shadcn.png"
        fallback="CN"
        isOnline={true}
      />
      <MessageAvatar
        src="https://github.com/vercel.png"
        fallback="VC"
        isOnline={false}
      />
    </div>
  ),
}

export const OnlineStatus: Story = {
  render: () => (
    <div className="flex gap-4">
      <MessageAvatar fallback="ON" isOnline={true} />
      <MessageAvatar fallback="OF" isOnline={false} />
      <MessageAvatar fallback="UN" isOnline={undefined} />
    </div>
  ),
}
