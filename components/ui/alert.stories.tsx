import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertTitle, AlertDescription } from './alert'
import { Info, AlertCircle } from 'lucide-react'

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Alert component for displaying important messages to users. Supports default and destructive variants with optional icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive'],
      description: 'Alert variant',
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is a default alert message with an icon and description.
      </AlertDescription>
    </Alert>
  ),
}

export const Playground: Story = {
  render: (args) => (
    <Alert {...args}>
      <Info className="h-4 w-4" />
      <AlertTitle>Alert Title</AlertTitle>
      <AlertDescription>
        Alert description text goes here.
      </AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again later.
      </AlertDescription>
    </Alert>
  ),
}

export const WithoutIcon: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Simple Alert</AlertTitle>
      <AlertDescription>
        This alert doesn't include an icon.
      </AlertDescription>
    </Alert>
  ),
}

export const TitleOnly: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Alert Title Only</AlertTitle>
    </Alert>
  ),
}
