import type { Meta, StoryObj } from '@storybook/react'
import { AttachmentPicker } from './AttachmentPicker'
import { useState } from 'react'

const meta = {
  title: 'Input/AttachmentPicker',
  component: AttachmentPicker,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'AttachmentPicker component for selecting and managing file attachments with preview and removal.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AttachmentPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [attachments, setAttachments] = useState<any[]>([])
    return (
      <AttachmentPicker
        attachments={attachments}
        onAttach={(files) => {
          const newAttachments = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            type: file.type.startsWith('image/') ? 'image' : 'file',
          }))
          setAttachments([...attachments, ...newAttachments])
        }}
        onRemove={(id) => {
          setAttachments(attachments.filter(a => a.id !== id))
        }}
      />
    )
  },
}

export const Playground: Story = {
  render: () => {
    const [attachments, setAttachments] = useState<any[]>([])
    return (
      <AttachmentPicker
        attachments={attachments}
        onAttach={(files) => {
          const newAttachments = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            type: file.type.startsWith('image/') ? 'image' : 'file',
          }))
          setAttachments([...attachments, ...newAttachments])
        }}
        onRemove={(id) => {
          setAttachments(attachments.filter(a => a.id !== id))
        }}
        maxFiles={5}
        maxSize={10}
      />
    )
  },
}

export const WithAttachments: Story = {
  render: () => {
    const [attachments, setAttachments] = useState([
      {
        id: '1',
        file: new File([''], 'document.pdf', { type: 'application/pdf' }),
        type: 'document' as const,
      },
      {
        id: '2',
        file: new File([''], 'image.jpg', { type: 'image/jpeg' }),
        type: 'image' as const,
      },
    ])
    return (
      <AttachmentPicker
        attachments={attachments}
        onAttach={(files) => {
          const newAttachments = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            type: file.type.startsWith('image/') ? ('image' as const) : ('document' as const),
          }))
          setAttachments([...attachments, ...newAttachments])
        }}
        onRemove={(id) => {
          setAttachments(attachments.filter(a => a.id !== id))
        }}
      />
    )
  },
}

export const ImageOnly: Story = {
  render: () => {
    const [attachments, setAttachments] = useState<any[]>([])
    return (
      <AttachmentPicker
        attachments={attachments}
        accept="image/*"
        onAttach={(files) => {
          const newAttachments = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            type: 'image' as const,
          }))
          setAttachments([...attachments, ...newAttachments])
        }}
        onRemove={(id) => {
          setAttachments(attachments.filter(a => a.id !== id))
        }}
      />
    )
  },
}
