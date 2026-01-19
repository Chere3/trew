import type { Meta, StoryObj } from '@storybook/react'
import { PricingCard, pricingTiers, type BillingPeriod } from './Pricing'

const meta = {
  title: 'Landing/PricingCard',
  component: PricingCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Individual pricing tier card component displaying plan name, price, features, and CTA button. Supports monthly and annual billing with savings display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    billingPeriod: {
      control: 'select',
      options: ['monthly', 'annual'],
      description: 'Billing period for price calculation',
    },
  },
} satisfies Meta<typeof PricingCard>

export default meta
type Story = StoryObj<typeof meta>

// Starter Plan Stories
export const StarterMonthly: Story = {
  args: {
    tier: pricingTiers[0],
    billingPeriod: 'monthly' as BillingPeriod,
  },
}

export const StarterAnnual: Story = {
  args: {
    tier: pricingTiers[0],
    billingPeriod: 'annual' as BillingPeriod,
  },
}

// Pro Plan Stories (Most Popular)
export const ProMonthly: Story = {
  args: {
    tier: pricingTiers[1],
    billingPeriod: 'monthly' as BillingPeriod,
  },
}

export const ProAnnual: Story = {
  args: {
    tier: pricingTiers[1],
    billingPeriod: 'annual' as BillingPeriod,
  },
}

// Enterprise Plan Stories
export const EnterpriseMonthly: Story = {
  args: {
    tier: pricingTiers[2],
    billingPeriod: 'monthly' as BillingPeriod,
  },
}

export const EnterpriseAnnual: Story = {
  args: {
    tier: pricingTiers[2],
    billingPeriod: 'annual' as BillingPeriod,
  },
}

// All Cards Grid
export const AllCardsMonthly: Story = {
  args: {
    tier: pricingTiers[0],
    billingPeriod: 'monthly' as BillingPeriod,
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl p-6 bg-background">
      {pricingTiers.map((tier) => (
        <PricingCard key={tier.id} tier={tier} billingPeriod="monthly" />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'All pricing cards displayed in a grid with monthly billing.',
      },
    },
  },
}

export const AllCardsAnnual: Story = {
  args: {
    tier: pricingTiers[0],
    billingPeriod: 'annual' as BillingPeriod,
  },
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl p-6 bg-background">
      {pricingTiers.map((tier) => (
        <PricingCard key={tier.id} tier={tier} billingPeriod="annual" />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'All pricing cards displayed in a grid with annual billing showing savings.',
      },
    },
  },
}
