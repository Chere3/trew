import type { Meta, StoryObj } from '@storybook/react'
import { QuickReplies } from './QuickReplies'

const meta = {
  title: 'Input/QuickReplies',
  component: QuickReplies,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'QuickReplies component for displaying quick reply suggestion buttons in chat interfaces.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Button variant',
    },
  },
} satisfies Meta<typeof QuickReplies>

export default meta
type Story = StoryObj<typeof meta>

const sampleReplies = [
  { id: '1', label: 'Yes, please' },
  { id: '2', label: 'No, thanks' },
  { id: '3', label: 'Maybe later' },
]

export const Default: Story = {
  args: {
    replies: sampleReplies,
    onSelect: (reply) => console.log('Selected:', reply),
  },
}

export const Playground: Story = {
  args: {
    replies: sampleReplies,
    variant: 'outline',
    onSelect: (reply) => console.log('Selected:', reply),
  },
}

export const DefaultVariant: Story = {
  render: () => (
    <QuickReplies
      replies={sampleReplies}
      variant="default"
      onSelect={(reply) => console.log('Selected:', reply)}
    />
  ),
}

export const OutlineVariant: Story = {
  render: () => (
    <QuickReplies
      replies={sampleReplies}
      variant="outline"
      onSelect={(reply) => console.log('Selected:', reply)}
    />
  ),
}

export const ManyReplies: Story = {
  render: () => (
    <QuickReplies
      replies={[
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' },
        { id: '3', label: 'Option 3' },
        { id: '4', label: 'Option 4' },
        { id: '5', label: 'Option 5' },
        { id: '6', label: 'Option 6' },
      ]}
      onSelect={(reply) => console.log('Selected:', reply)}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <QuickReplies
      replies={[]}
      onSelect={(reply) => console.log('Selected:', reply)}
    />
  ),
}
