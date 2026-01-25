import type { Meta, StoryObj } from '@storybook/react'
import { DateSeparator } from './DateSeparator'

const meta = {
  title: 'Chat/DateSeparator',
  component: DateSeparator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'DateSeparator component for dividing messages by date in chat conversations.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DateSeparator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    date: new Date(),
  },
}

export const Playground: Story = {
  args: {
    date: new Date(),
  },
}

export const Today: Story = {
  args: {
    date: new Date(),
  },
}

export const Yesterday: Story = {
  args: {
    date: (() => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    })(),
  },
}

export const PastDate: Story = {
  args: {
    date: (() => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 7)
      return pastDate
    })(),
  },
}

export const InConversation: Story = {
  args: {
    date: new Date(),
  },
  render: (args) => (
    <div className="space-y-4">
      <DateSeparator date={new Date(Date.now() - 172800000)} />
      <p className="text-sm">Previous messages...</p>
      <DateSeparator date={args.date} />
      <p className="text-sm">Today's messages...</p>
    </div>
  ),
}
