import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import { Send, Download, Trash2 } from 'lucide-react'
import { within, userEvent, expect } from '@storybook/test'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Tactile button component with retro-realistic styling. Features physical pressable appearance with gradients, shadows, and clear interaction states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child component',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Playground: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
  },
}

export const Interaction: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    await expect(button).toBeInTheDocument()
    await userEvent.click(button)
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Download className="h-4 w-4" />
        Download
      </Button>
      <Button variant="outline">
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
      <Button variant="ghost" size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
    </div>
  ),
}

export const Destructive: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="destructive">Delete Account</Button>
      <Button variant="destructive" size="sm">Remove</Button>
      <Button variant="destructive" disabled>Disabled</Button>
    </div>
  ),
}
