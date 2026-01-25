import type { Meta, StoryObj } from '@storybook/react'
import { ImageGallery } from './ImageGallery'

const meta = {
  title: 'Media/ImageGallery',
  component: ImageGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ImageGallery component for displaying images in a grid with lightbox view.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      control: 'select',
      options: [1, 2, 3, 4],
      description: 'Number of columns',
    },
  },
} satisfies Meta<typeof ImageGallery>

export default meta
type Story = StoryObj<typeof meta>

const sampleImages = [
  { id: '1', src: 'https://via.placeholder.com/300', alt: 'Image 1' },
  { id: '2', src: 'https://via.placeholder.com/300', alt: 'Image 2' },
  { id: '3', src: 'https://via.placeholder.com/300', alt: 'Image 3' },
  { id: '4', src: 'https://via.placeholder.com/300', alt: 'Image 4' },
]

export const Default: Story = {
  args: {
    images: sampleImages,
  },
}

export const Playground: Story = {
  args: {
    images: sampleImages,
    columns: 3,
  },
}

export const Columns: Story = {
  args: {
    images: sampleImages,
    columns: 3,
  },
}

export const ManyImages: Story = {
  args: {
    images: Array.from({ length: 12 }).map((_, i) => ({
      id: String(i + 1),
      src: `https://via.placeholder.com/300?text=Image+${i + 1}`,
      alt: `Image ${i + 1}`,
    }))
  },
}
