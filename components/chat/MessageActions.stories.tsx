import type { Meta, StoryObj } from '@storybook/react'
import { MessageActions } from './MessageActions'

const meta = {
  title: 'Chat/MessageActions',
  component: MessageActions,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'MessageActions component for displaying action buttons on messages. Supports inline and dropdown variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['inline', 'dropdown'],
      description: 'Display variant',
    },
  },
} satisfies Meta<typeof MessageActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onCopy: () => console.log('Copy clicked'),
    onFeedback: (positive) => console.log('Feedback:', positive),
  },
}

export const Playground: Story = {
  args: {
    variant: 'inline',
    onCopy: () => console.log('Copy'),
    onRetry: () => console.log('Retry'),
    onFeedback: (positive) => console.log('Feedback:', positive),
  },
}

export const Inline: Story = {
  render: () => (
    <MessageActions
      variant="inline"
      onCopy={() => console.log('Copy')}
      onRetry={() => console.log('Retry')}
      onFeedback={(positive) => console.log('Feedback:', positive)}
    />
  ),
}

export const Dropdown: Story = {
  render: () => (
    <MessageActions
      variant="dropdown"
      onCopy={() => console.log('Copy')}
      onRetry={() => console.log('Retry')}
      onFeedback={(positive) => console.log('Feedback:', positive)}
      onDelete={() => console.log('Delete')}
      onEdit={() => console.log('Edit')}
    />
  ),
}

export const CopyOnly: Story = {
  render: () => (
    <MessageActions
      onCopy={() => console.log('Copy')}
    />
  ),
}

export const WithRetry: Story = {
  render: () => (
    <MessageActions
      onCopy={() => console.log('Copy')}
      onRetry={() => console.log('Retry')}
    />
  ),
}

export const AllActions: Story = {
  render: () => (
    <MessageActions
      onCopy={() => console.log('Copy')}
      onRetry={() => console.log('Retry')}
      onFeedback={(positive) => console.log('Feedback:', positive)}
      onDelete={() => console.log('Delete')}
      onEdit={() => console.log('Edit')}
    />
  ),
}
