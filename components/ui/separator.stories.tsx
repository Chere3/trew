import type { Meta, StoryObj } from '@storybook/react'
import { Separator } from './separator'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Separator component for dividing content sections. Supports horizontal and vertical orientations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Separator orientation',
    },
    decorative: {
      control: 'boolean',
      description: 'Whether separator is decorative',
    },
  },
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Separator />,
}

export const Playground: Story = {
  args: {
    orientation: 'horizontal',
    decorative: true,
  },
}

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <div>Content above</div>
      <Separator />
      <div>Content below</div>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center gap-4 h-20">
      <div>Left</div>
      <Separator orientation="vertical" />
      <div>Right</div>
    </div>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="border rounded-lg p-4 space-y-4">
      <div>Header content</div>
      <Separator />
      <div>Body content</div>
      <Separator />
      <div>Footer content</div>
    </div>
  ),
}
