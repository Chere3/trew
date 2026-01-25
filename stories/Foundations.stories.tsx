import type { Meta, StoryObj } from '@storybook/react-vite'
import { colors, typography, spacing } from '@/components/foundations'

const meta = {
  title: 'Foundations/Design Tokens',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(colors.primary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div
                className="h-16 w-full rounded border"
                style={{ backgroundColor: value }}
              />
              <div className="text-xs mt-1">{key}</div>
              <div className="text-xs text-muted-foreground">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

export const Typography: Story = {
  render: () => (
    <div className="space-y-4">
      {Object.entries(typography.fontSize).map(([key, value]) => (
        <div key={key}>
          <div className="text-sm text-muted-foreground mb-1">{key}</div>
          <div style={{ fontSize: value[0], lineHeight: value[1].lineHeight }}>
            The quick brown fox jumps over the lazy dog
          </div>
        </div>
      ))}
    </div>
  ),
}

export const Spacing: Story = {
  render: () => (
    <div className="space-y-4">
      {Object.entries(spacing).map(([key, value]) => (
        <div key={key} className="flex items-center gap-4">
          <div className="w-20 text-sm font-mono">{key}</div>
          <div className="w-32 text-xs text-muted-foreground font-mono">{value}</div>
          <div
            className="bg-primary h-4"
            style={{ width: value }}
          />
        </div>
      ))}
    </div>
  ),
}
