import type { Meta, StoryObj } from '@storybook/react'
import { Navbar } from './Navbar'

const meta = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Professional sticky navbar component matching the landing page design. Features backdrop blur, responsive mobile menu, and navigation links with CTA button.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ctaLabel: {
      control: 'text',
      description: 'Text for the call-to-action button',
    },
    navItems: {
      control: 'object',
      description: 'Array of navigation items with label and href',
    },
  },
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ctaLabel: 'Get Started',
  },
}

export const Playground: Story = {
  args: {
    ctaLabel: 'Sign Up',
    navItems: [
      { label: 'Home', href: '#' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
  },
}

export const WithScroll: Story = {
  render: () => (
    <div>
      <Navbar />
      <div className="min-h-[200vh] bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="space-y-12">
            <section className="space-y-4">
              <h2 className="text-4xl font-bold text-foreground">Scroll down to see the sticky navbar</h2>
              <p className="text-lg text-muted-foreground">
                The navbar stays fixed at the top as you scroll. Notice how it maintains its backdrop blur effect.
              </p>
            </section>
            {Array.from({ length: 10 }).map((_, i) => (
              <section key={i} className="space-y-4">
                <h3 className="text-2xl font-semibold text-foreground">Section {i + 1}</h3>
                <p className="text-muted-foreground">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
}

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Mobile View</h2>
            <p className="text-lg text-muted-foreground">
              On mobile devices, the navigation links are hidden and accessible through the hamburger menu.
              Click the menu icon in the navbar to see the mobile menu.
            </p>
            <p className="text-muted-foreground">
              Resize your viewport to see the mobile menu in action.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
}

export const WithCustomLogo: Story = {
  render: () => (
    <Navbar
      logo={
        <a href="#" className="flex items-center gap-2 group">
          <span className="h-8 w-8 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
            <span className="text-primary font-bold text-lg">T</span>
          </span>
          <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            Trew
          </span>
        </a>
      }
    />
  ),
}

export const WithCustomNavItems: Story = {
  args: {
    navItems: [
      { label: 'Products', href: '#products' },
      { label: 'Solutions', href: '#solutions' },
      { label: 'Resources', href: '#resources' },
      { label: 'Blog', href: '#blog' },
      { label: 'Support', href: '#support' },
    ],
    ctaLabel: 'Start Free Trial',
  },
}
