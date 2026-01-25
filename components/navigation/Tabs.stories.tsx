import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from '@/components/navigation/Tabs'

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tabs component for navigation tabs. Different from UI/Tabs - this is for navigation context.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    defaultValue: 'all',
    className: 'w-full',
    tabs: [
      { id: 'all', label: 'All', content: 'All conversations' },
      { id: 'active', label: 'Active', content: 'Active conversations' },
      { id: 'archived', label: 'Archived', content: 'Archived conversations' },
    ],
  },
}

export const Playground: Story = {
  args: {
    defaultValue: 'tab1',
    className: 'w-full',
    tabs: [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
      { id: 'tab2', label: 'Tab 2', content: 'Content 2' },
      { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
    ],
  },
}

export const Disabled: Story = {
  args: {
    defaultValue: 'tab1',
    className: 'w-full',
    tabs: [
      { id: 'tab1', label: 'Tab 1', content: 'Content 1' },
      { id: 'tab2', label: 'Tab 2', content: 'Content 2', disabled: true },
      { id: 'tab3', label: 'Tab 3', content: 'Content 3' },
    ],
  },
}

export const Empty: Story = {
  args: {
    defaultValue: 'tab1',
    className: 'w-full',
    tabs: [],
  },
}
