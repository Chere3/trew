import type { Meta, StoryObj } from '@storybook/react'
import { Progress } from './progress'

const meta = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Progress component for displaying task completion or loading states. Uses Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value (0-100)',
    },
  },
} satisfies Meta<typeof Progress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 50,
  },
}

export const Playground: Story = {
  args: {
    value: 50,
  },
}

export const Values: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <Progress value={0} />
        <p className="text-sm text-muted-foreground mt-2">0%</p>
      </div>
      <div>
        <Progress value={25} />
        <p className="text-sm text-muted-foreground mt-2">25%</p>
      </div>
      <div>
        <Progress value={50} />
        <p className="text-sm text-muted-foreground mt-2">50%</p>
      </div>
      <div>
        <Progress value={75} />
        <p className="text-sm text-muted-foreground mt-2">75%</p>
      </div>
      <div>
        <Progress value={100} />
        <p className="text-sm text-muted-foreground mt-2">100%</p>
      </div>
    </div>
  ),
}

export const Indeterminate: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <Progress value={undefined} />
      <p className="text-sm text-muted-foreground">Indeterminate progress</p>
    </div>
  ),
}
