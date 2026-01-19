import type { Meta, StoryObj } from '@storybook/react'
import { SettingsPanel } from './SettingsPanel'

const meta = {
  title: 'User/SettingsPanel',
  component: SettingsPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'SettingsPanel component for displaying user settings with tabs and toggles.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SettingsPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <SettingsPanel />,
}

export const Playground: Story = {
  render: () => <SettingsPanel />,
}
