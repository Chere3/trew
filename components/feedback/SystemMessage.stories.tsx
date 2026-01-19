import type { Meta, StoryObj } from '@storybook/react'
import { SystemMessage } from './SystemMessage'

const meta = {
  title: 'Feedback/SystemMessage',
  component: SystemMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SystemMessage>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    message: 'This is an informational message',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    message: 'Operation completed successfully',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    message: 'Please review this action before proceeding',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    message: 'An error occurred while processing your request',
  },
}
