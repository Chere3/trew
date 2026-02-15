import type { Meta, StoryObj } from '@storybook/react'
import { ModelSelector } from './ModelSelector'
import { ModelSelectorSkeleton } from './ModelSelectorSkeleton'

const meta = {
  title: 'Input/ModelSelector',
  component: ModelSelector,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ModelSelector component for selecting AI models with search and grouping capabilities.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ModelSelector>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    selectedModelId: 'auto',
    onModelChange: (modelId) => console.log('Model changed:', modelId),
  },
}

export const Skeleton: Story = {
  args: {},
  render: (args) => <ModelSelectorSkeleton {...args} />,
}
