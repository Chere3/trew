import type { Meta, StoryObj } from '@storybook/react'
import { FAQItem, faqs } from './Pricing'

const meta = {
  title: 'Landing/FAQItem',
  component: FAQItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'FAQ accordion item component with question and expandable answer. Click to toggle open/closed state.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    question: {
      control: 'text',
      description: 'The FAQ question text',
    },
    answer: {
      control: 'text',
      description: 'The FAQ answer text',
    },
  },
} satisfies Meta<typeof FAQItem>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  args: {
    question: faqs[0].question,
    answer: faqs[0].answer,
  },
  parameters: {
    docs: {
      description: {
        story: 'FAQ item in closed state (default).',
      },
    },
  },
}

export const Open: Story = {
  args: {
    question: faqs[0].question,
    answer: faqs[0].answer,
  },
  render: (args) => {
    // We need to manually set it open, but since it's state-based, we'll show it in a wrapper
    return (
      <div className="w-full max-w-2xl">
        <FAQItem {...args} />
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Click the FAQ item above to see it open
        </p>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'FAQ item - click to toggle open/closed state.',
      },
    },
  },
}

export const AllFAQs: Story = {
  args: {
    question: faqs[0].question,
    answer: faqs[0].answer,
  },
  render: () => (
    <div className="w-full max-w-3xl space-y-4 p-6 bg-background">
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'All FAQ items displayed together in a list.',
      },
    },
  },
}

// Individual FAQ examples
export const AIModelsQuestion: Story = {
  args: {
    question: faqs[0].question,
    answer: faqs[0].answer,
  },
}

export const CancellationQuestion: Story = {
  args: {
    question: faqs[1].question,
    answer: faqs[1].answer,
  },
}

export const PlanSwitchingQuestion: Story = {
  args: {
    question: faqs[2].question,
    answer: faqs[2].answer,
  },
}

export const FreeTrialQuestion: Story = {
  args: {
    question: faqs[3].question,
    answer: faqs[3].answer,
  },
}

export const HiddenFeesQuestion: Story = {
  args: {
    question: faqs[4].question,
    answer: faqs[4].answer,
  },
}

export const AnnualDiscountQuestion: Story = {
  args: {
    question: faqs[5].question,
    answer: faqs[5].answer,
  },
}

export const ModelSwitchingQuestion: Story = {
  args: {
    question: faqs[6].question,
    answer: faqs[6].answer,
  },
}

export const PaymentMethodsQuestion: Story = {
  args: {
    question: faqs[7].question,
    answer: faqs[7].answer,
  },
}
