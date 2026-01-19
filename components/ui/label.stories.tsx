import type { Meta, StoryObj } from '@storybook/react'
import { Label } from './label'
import { Input } from './input'

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Label component for form inputs. Provides accessible labeling for form controls.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Label',
  },
}

export const Playground: Story = {
  args: {
    children: 'Label',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="email@example.com" />
    </div>
  ),
}

export const MultipleLabels: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input id="message" placeholder="Enter your message" />
      </div>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <Label htmlFor="required">
        Required Field <span className="text-destructive">*</span>
      </Label>
      <Input id="required" placeholder="This field is required" />
    </div>
  ),
}
