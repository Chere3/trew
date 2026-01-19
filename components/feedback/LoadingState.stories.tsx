import type { Meta, StoryObj } from '@storybook/react'
import { LoadingState } from './LoadingState'

const meta = {
  title: 'Feedback/LoadingState',
  component: LoadingState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'LoadingState component for displaying loading indicators in various formats.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'skeleton', 'dots'],
      description: 'Loading variant',
    },
  },
} satisfies Meta<typeof LoadingState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <LoadingState />,
}

export const Playground: Story = {
  args: {
    variant: 'spinner',
    message: 'Loading...',
  },
}

export const Spinner: Story = {
  render: () => (
    <div className="space-y-4">
      <LoadingState variant="spinner" />
      <LoadingState variant="spinner" message="Loading data..." />
    </div>
  ),
}

export const Skeleton: Story = {
  render: () => <LoadingState variant="skeleton" />,
}

export const Dots: Story = {
  render: () => (
    <div className="space-y-4">
      <LoadingState variant="dots" />
      <LoadingState variant="dots" message="Processing..." />
    </div>
  ),
}

export const FullScreen: Story = {
  render: () => <LoadingState variant="spinner" message="Loading..." fullScreen />,
}
