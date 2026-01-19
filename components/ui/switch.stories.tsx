import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './switch'
import { Label } from './label'

const meta = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Switch component for toggling boolean values. Uses Radix UI primitives for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable the switch',
    },
    checked: {
      control: 'boolean',
      description: 'Checked state',
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Switch />,
}

export const Playground: Story = {
  args: {
    disabled: false,
  },
}

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="unchecked" />
        <Label htmlFor="unchecked">Unchecked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="checked" defaultChecked />
        <Label htmlFor="checked">Checked</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="disabled" disabled />
        <Label htmlFor="disabled">Disabled</Label>
      </div>
      <div className="flex items-center gap-2">
        <Switch id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked">Disabled Checked</Label>
      </div>
    </div>
  ),
}

export const WithLabels: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="notifications">Enable notifications</Label>
        <Switch id="notifications" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="dark-mode">Dark mode</Label>
        <Switch id="dark-mode" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-save">Auto-save</Label>
        <Switch id="auto-save" />
      </div>
    </div>
  ),
}
