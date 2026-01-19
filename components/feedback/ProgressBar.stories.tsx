import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ProgressBar component for displaying task progress with labels and variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Progress value',
    },
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error'],
      description: 'Progress variant',
    },
  },
} satisfies Meta<typeof ProgressBar>

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
    max: 100,
    label: 'Progress',
    showValue: true,
    variant: 'default',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <ProgressBar value={25} label="Upload Progress" />
      <ProgressBar value={50} label="Download Progress" />
      <ProgressBar value={75} label="Processing" />
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <ProgressBar value={60} label="Default" variant="default" />
      <ProgressBar value={80} label="Success" variant="success" />
      <ProgressBar value={40} label="Warning" variant="warning" />
      <ProgressBar value={20} label="Error" variant="error" />
    </div>
  ),
}

export const WithoutValue: Story = {
  render: () => (
    <ProgressBar value={65} label="Progress" showValue={false} />
  ),
}
