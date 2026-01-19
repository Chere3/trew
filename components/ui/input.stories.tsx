import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Input component for text entry. Supports various input types and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'Input type',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
}

export const Playground: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    disabled: false,
  },
}

export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <Label htmlFor="text">Text</Label>
        <Input id="text" type="text" placeholder="Enter text" />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="Enter password" />
      </div>
      <div>
        <Label htmlFor="number">Number</Label>
        <Input id="number" type="number" placeholder="Enter number" />
      </div>
      <div>
        <Label htmlFor="search">Search</Label>
        <Input id="search" type="search" placeholder="Search..." />
      </div>
    </div>
  ),
}

export const States: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-md">
      <div>
        <Label>Normal</Label>
        <Input placeholder="Normal input" />
      </div>
      <div>
        <Label>Disabled</Label>
        <Input placeholder="Disabled input" disabled />
      </div>
      <div>
        <Label>With Value</Label>
        <Input defaultValue="Sample text" />
      </div>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-full max-w-md">
      <Label htmlFor="input-with-label">Label</Label>
      <Input id="input-with-label" placeholder="Input with label" />
    </div>
  ),
}
