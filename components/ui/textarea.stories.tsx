import type { Meta, StoryObj } from '@storybook/react'
import { Textarea } from './textarea'
import { Label } from './label'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Textarea component for multi-line text input. Supports resizing and various states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the textarea',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    rows: {
      control: 'number',
      description: 'Number of visible rows',
    },
  },
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Playground: Story = {
  args: {
    placeholder: 'Enter text...',
    disabled: false,
    rows: 4,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <Label>Small (3 rows)</Label>
        <Textarea rows={3} placeholder="Small textarea" />
      </div>
      <div>
        <Label>Default (4 rows)</Label>
        <Textarea rows={4} placeholder="Default textarea" />
      </div>
      <div>
        <Label>Large (6 rows)</Label>
        <Textarea rows={6} placeholder="Large textarea" />
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <Label>Normal</Label>
        <Textarea placeholder="Normal textarea" />
      </div>
      <div>
        <Label>Disabled</Label>
        <Textarea placeholder="Disabled textarea" disabled />
      </div>
      <div>
        <Label>With Value</Label>
        <Textarea defaultValue="This is some sample text that has been pre-filled in the textarea component." />
      </div>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <Label htmlFor="textarea-with-label">Message</Label>
      <Textarea id="textarea-with-label" placeholder="Enter your message..." />
    </div>
  ),
}
