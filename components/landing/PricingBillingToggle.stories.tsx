import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BillingPeriod } from './Pricing'

function BillingToggle({ 
  billingPeriod, 
  onBillingPeriodChange 
}: { 
  billingPeriod: BillingPeriod
  onBillingPeriodChange: (period: BillingPeriod) => void 
}) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className={cn(
        "text-sm font-medium transition-colors",
        billingPeriod === "monthly" ? "text-foreground" : "text-muted-foreground"
      )}>
        Monthly
      </span>
      <Switch
        checked={billingPeriod === "annual"}
        onCheckedChange={(checked) => onBillingPeriodChange(checked ? "annual" : "monthly")}
        aria-label="Toggle billing period"
      />
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-sm font-medium transition-colors",
          billingPeriod === "annual" ? "text-foreground" : "text-muted-foreground"
        )}>
          Annual
        </span>
        {billingPeriod === "annual" && (
          <Badge variant="secondary" className="text-xs">
            Save up to 20%
          </Badge>
        )}
      </div>
    </div>
  )
}

const meta = {
  title: 'Landing/PricingBillingToggle',
  component: BillingToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Billing period toggle component for switching between monthly and annual pricing. Shows savings badge when annual is selected.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BillingToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Monthly: Story = {
  args: {
    billingPeriod: 'monthly' as BillingPeriod,
    onBillingPeriodChange: () => {},
  },
  render: (args) => {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(args.billingPeriod)
    return <BillingToggle billingPeriod={billingPeriod} onBillingPeriodChange={setBillingPeriod} />
  },
  parameters: {
    docs: {
      description: {
        story: 'Billing toggle set to monthly billing.',
      },
    },
  },
}

export const Annual: Story = {
  args: {
    billingPeriod: 'annual' as BillingPeriod,
    onBillingPeriodChange: () => {},
  },
  render: (args) => {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(args.billingPeriod)
    return <BillingToggle billingPeriod={billingPeriod} onBillingPeriodChange={setBillingPeriod} />
  },
  parameters: {
    docs: {
      description: {
        story: 'Billing toggle set to annual billing with savings badge displayed.',
      },
    },
  },
}

export const Interactive: Story = {
  args: {
    billingPeriod: 'annual' as BillingPeriod,
    onBillingPeriodChange: () => {},
  },
  render: () => {
    const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('annual')
    return (
      <div className="space-y-4">
        <BillingToggle billingPeriod={billingPeriod} onBillingPeriodChange={setBillingPeriod} />
        <p className="text-sm text-muted-foreground text-center">
          Current selection: <strong>{billingPeriod}</strong>
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive billing toggle - click the switch to toggle between monthly and annual.',
      },
    },
  },
}
