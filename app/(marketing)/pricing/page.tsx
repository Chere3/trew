import type { Metadata } from "next";
import { Pricing } from "@/components/landing/Pricing";

export const metadata: Metadata = {
  title: "Pricing - Trew | Unified AI Subscription Plans",
  description: "Choose the perfect plan for your AI needs. Access GPT-4, Claude, Gemini, and more in one unified subscription. Save hundreds monthly. Cancel anytime. No hidden fees.",
  openGraph: {
    title: "Pricing - Trew | Unified AI Subscription Plans",
    description: "Choose the perfect plan for your AI needs. Access GPT-4, Claude, Gemini, and more in one unified subscription.",
    type: "website",
  },
};

// Structured data for SEO
const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Trew",
  "url": "https://trew.ai",
  "logo": "https://trew.ai/logo.png",
  "description": "Unified AI platform providing access to GPT-4, Claude, Gemini, and more in one subscription.",
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What AI models are included in Trew?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Trew provides access to flagship models, other models, and outdated models depending on your plan. The free tier includes flagship models, while paid plans unlock additional model categories. All models are available in one unified subscription, allowing you to switch between them seamlessly."
      }
    },
    {
      "@type": "Question",
      "name": "How are messages counted?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Message counts are estimated based on typical usage patterns. The actual number of messages you can send may vary depending on message length and complexity. We provide generous limits to ensure you can use Trew effectively for your needs."
      }
    },
    {
      "@type": "Question",
      "name": "Can I cancel my subscription anytime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can cancel your subscription at any time with no commitments or long-term contracts. There are no cancellation fees or penalties."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if I switch plans?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a free trial?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a free trial period so you can experience all features before committing to a paid plan."
      }
    },
    {
      "@type": "Question",
      "name": "Are there any hidden fees?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, there are no hidden fees. The price you see is the price you pay. No setup fees, no overage charges, and no surprise costs."
      }
    },
    {
      "@type": "Question",
      "name": "Do you offer annual billing discounts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer significant savings when you choose annual billing. Annual plans typically save you 2 months compared to monthly billing."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch between AI models mid-conversation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, one of Trew's key features is seamless model switching. You can switch between GPT-4, Claude, and Gemini during a conversation without losing context."
      }
    },
    {
      "@type": "Question",
      "name": "What payment methods do you accept?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept all major credit cards, debit cards, and PayPal. All payments are processed securely through our payment partners."
      }
    }
  ]
};

// Product/Service schemas for each pricing tier
const productSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Trew Free Plan",
    "description": "Perfect for trying out AI models. Includes flagship models, 250 messages/month, and unlimited conversations.",
    "provider": {
      "@type": "Organization",
      "name": "Trew"
    },
    "offers": {
      "@type": "Offer",
      "name": "Free Plan",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "url": "https://trew.ai/pricing"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Trew Starter Plan",
    "description": "Perfect for individuals getting started with AI. Includes flagship models, other models, 5,000 messages/month, and unlimited conversations.",
    "provider": {
      "@type": "Organization",
      "name": "Trew"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Starter Plan - Monthly",
        "price": "19",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1M",
        "url": "https://trew.ai/pricing"
      },
      {
        "@type": "Offer",
        "name": "Starter Plan - Annual",
        "price": "180",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1Y",
        "url": "https://trew.ai/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Trew Pro Plan",
    "description": "For professionals who need more messages and advanced features. Includes flagship models, other models, outdated models, unlimited messages, priority support, and API access.",
    "provider": {
      "@type": "Organization",
      "name": "Trew"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Pro Plan - Monthly",
        "price": "29",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1M",
        "url": "https://trew.ai/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro Plan - Annual",
        "price": "288",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1Y",
        "url": "https://trew.ai/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Trew Enterprise Plan",
    "description": "Advanced features for teams and organizations. Includes flagship models, other models, outdated models, unlimited messages, team collaboration, custom integrations, dedicated support, and SLA guarantee.",
    "provider": {
      "@type": "Organization",
      "name": "Trew"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Enterprise Plan - Monthly",
        "price": "99",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1M",
        "url": "https://trew.ai/pricing"
      },
      {
        "@type": "Offer",
        "name": "Enterprise Plan - Annual",
        "price": "948",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "priceValidUntil": "2025-12-31",
        "billingIncrement": "P1Y",
        "url": "https://trew.ai/pricing"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2847"
    }
  }
];

export default function PricingPage() {
  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingStructuredData) }}
      />
      
      {/* Product/Service Schemas for each pricing tier */}
      {productSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <Pricing />
    </>
  );
}
