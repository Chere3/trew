import type { Meta, StoryObj } from '@storybook/react'
import { VoiceInput } from './VoiceInput'

const meta = {
  title: 'Input/VoiceInput',
  component: VoiceInput,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'VoiceInput component for voice recording and speech-to-text conversion using browser Speech Recognition API.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Disable voice input',
    },
    language: {
      control: 'text',
      description: 'Speech recognition language',
    },
  },
} satisfies Meta<typeof VoiceInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onTranscript: (text) => console.log('Transcript:', text),
  },
}

export const Playground: Story = {
  args: {
    onTranscript: (text) => console.log('Transcript:', text),
    onStart: () => console.log('Started'),
    onStop: () => console.log('Stopped'),
    onError: (error) => console.error('Error:', error),
    disabled: false,
    language: 'en-US',
  },
}

export const WithCallbacks: Story = {
  render: () => (
    <VoiceInput
      onStart={() => console.log('Recording started')}
      onStop={() => console.log('Recording stopped')}
      onTranscript={(text) => console.log('Transcript:', text)}
      onError={(error) => console.error('Error:', error)}
    />
  ),
}

export const Disabled: Story = {
  render: () => (
    <VoiceInput
      disabled={true}
      onTranscript={(text) => console.log('Transcript:', text)}
    />
  ),
}
