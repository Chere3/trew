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
  render: () => (
    <Tabs defaultValue="all" className="w-full">
      <Tabs.List>
        <Tabs.Trigger value="all">All</Tabs.Trigger>
        <Tabs.Trigger value="active">Active</Tabs.Trigger>
        <Tabs.Trigger value="archived">Archived</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="all">All conversations</Tabs.Content>
      <Tabs.Content value="active">Active conversations</Tabs.Content>
      <Tabs.Content value="archived">Archived conversations</Tabs.Content>
    </Tabs>
  ),
}

export const Playground: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full">
      <Tabs.List>
        <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Tab 3</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">Content 1</Tabs.Content>
      <Tabs.Content value="tab2">Content 2</Tabs.Content>
      <Tabs.Content value="tab3">Content 3</Tabs.Content>
    </Tabs>
  ),
}
