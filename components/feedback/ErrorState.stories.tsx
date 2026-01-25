import type { Meta, StoryObj } from '@storybook/react'
import { ErrorState } from './ErrorState'

const meta = {
  title: 'Feedback/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ErrorState component for displaying error messages with optional retry functionality.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    message: 'An error occurred while processing your request.',
  },
}

export const Playground: Story = {
  args: {
    title: 'Error',
    message: 'Something went wrong',
    onRetry: () => console.log('Retry clicked'),
  },
}

export const WithRetry: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
    onRetry: () => console.log('Retry clicked'),
  },
}

export const WithoutRetry: Story = {
  args: {
    message: 'An unexpected error occurred.',
  },
}

export const CustomTitleAndRetry: Story = {
  args: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection.',
    onRetry: () => console.log('Retry clicked'),
  },
}

export const CustomTitleAndMessage: Story = {
  args: {
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection.',
  },
}
