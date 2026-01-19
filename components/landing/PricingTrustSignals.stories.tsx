import type { Meta, StoryObj } from '@storybook/react'
import { Shield, Zap, Check } from 'lucide-react'
import { Card } from '@/components/ui/card'

function TrustSignals() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 sm:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Cancel Anytime</h3>
          <p className="text-sm text-muted-foreground">No commitments or long-term contracts</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <h3 className="font-semibold text-foreground text-base sm:text-lg">No Hidden Fees</h3>
          <p className="text-sm text-muted-foreground">The price you see is what you pay</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Check className="h-8 w-8 text-primary" />
          <h3 className="font-semibold text-foreground text-base sm:text-lg">Money-Back Guarantee</h3>
          <p className="text-sm text-muted-foreground">30-day satisfaction guarantee</p>
        </div>
      </div>
    </div>
  )
}

const meta = {
  title: 'Landing/PricingTrustSignals',
  component: TrustSignals,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Trust signals section displaying three key guarantees: Cancel Anytime, No Hidden Fees, and Money-Back Guarantee. Responsive grid layout.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TrustSignals>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="w-full max-w-7xl p-6 bg-background">
      <TrustSignals />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

export const InCard: Story = {
  render: () => (
    <div className="w-full max-w-7xl p-6">
      <Card className="p-6">
        <TrustSignals />
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Trust signals displayed within a card container.',
      },
    },
  },
}
