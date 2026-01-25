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
  args: {
    value: 50,
    max: 100,
    label: 'Progress',
    showValue: true,
    variant: 'default',
  },
}

export const Variants: Story = {
  args: {
    value: 50,
    max: 100,
    label: 'Progress',
    showValue: true,
    variant: 'default',
  },
}

export const Success: Story = {
  args: {
    value: 50,
    max: 100,
    label: 'Progress',
    showValue: true,
    variant: 'success',
  },
}

export const Error: Story = {
  args: {
    value: 65,
    label: 'Progress',
    showValue: false,
    variant: 'error',
  },
}

export const Warning: Story = {
  args: {
    value: 65,
    label: 'Progress',
    showValue: false,
    variant: 'warning',
  },
}
