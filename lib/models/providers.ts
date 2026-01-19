// Provider icon and color mappings
import { Sparkles, Bot, Brain, Zap, Code, Cpu } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ProviderConfig {
  icon: LucideIcon;
  color: string;
  displayName: string;
  logoUrl?: string; // CDN URL for provider logo
}

// Provider name normalization - maps various provider name formats to standard names
const PROVIDER_NORMALIZATION: Record<string, string> = {
  openai: "openai",
  anthropic: "anthropic",
  google: "google",
  "google ai": "google",
  "google deepmind": "google",
  meta: "meta",
  mistral: "mistral",
  cohere: "cohere",
  perplexity: "perplexity",
  groq: "groq",
  xai: "xai",
  "x ai": "xai",
  minimax: "minimax",
  "minimax ai": "minimax",
  moonshot: "moonshot",
  "moonshot ai": "moonshot",
};

// Provider configuration mapping
export const PROVIDER_CONFIG: Record<string, ProviderConfig> = {
  openai: {
    icon: Sparkles,
    color: "text-green-600 dark:text-green-400",
    displayName: "OpenAI",
    logoUrl: "https://cdn.simpleicons.org/openai",
  },
  anthropic: {
    icon: Bot,
    color: "text-blue-600 dark:text-blue-400",
    displayName: "Anthropic",
    logoUrl: "https://cdn.simpleicons.org/anthropic",
  },
  google: {
    icon: Brain,
    color: "text-purple-600 dark:text-purple-400",
    displayName: "Google",
    logoUrl: "https://cdn.simpleicons.org/google",
  },
  meta: {
    icon: Code,
    color: "text-blue-500 dark:text-blue-300",
    displayName: "Meta",
    logoUrl: "https://cdn.simpleicons.org/meta",
  },
  mistral: {
    icon: Zap,
    color: "text-orange-600 dark:text-orange-400",
    displayName: "Mistral AI",
    // Using Clearbit logo CDN for less common providers
    logoUrl: "https://logo.clearbit.com/mistral.ai",
  },
  cohere: {
    icon: Cpu,
    color: "text-pink-600 dark:text-pink-400",
    displayName: "Cohere",
    // Using Clearbit logo CDN for less common providers
    logoUrl: "https://logo.clearbit.com/cohere.com",
  },
  perplexity: {
    icon: Brain,
    color: "text-indigo-600 dark:text-indigo-400",
    displayName: "Perplexity",
    // Using Clearbit logo CDN for less common providers
    logoUrl: "https://logo.clearbit.com/perplexity.ai",
  },
  groq: {
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
    displayName: "Groq",
    // Using Clearbit logo CDN for less common providers
    logoUrl: "https://logo.clearbit.com/groq.com",
  },
  xai: {
    icon: Sparkles,
    color: "text-gray-600 dark:text-gray-400",
    displayName: "xAI",
    // Using Clearbit logo CDN for less common providers
    logoUrl: "https://logo.clearbit.com/x.ai",
  },
  minimax: {
    icon: Brain,
    color: "text-cyan-600 dark:text-cyan-400",
    displayName: "MiniMax",
    // Using Clearbit logo CDN as fallback for less common providers
    logoUrl: "https://logo.clearbit.com/minimax.ai",
  },
  moonshot: {
    icon: Zap,
    color: "text-violet-600 dark:text-violet-400",
    displayName: "Moonshot AI",
    // Using Clearbit logo CDN as fallback for less common providers
    logoUrl: "https://logo.clearbit.com/moonshot.cn",
  },
};

// Default provider config for unknown providers
const DEFAULT_PROVIDER: ProviderConfig = {
  icon: Brain,
  color: "text-gray-600 dark:text-gray-400",
  displayName: "Unknown",
};

/**
 * Normalize provider name to standard format
 */
export function normalizeProviderName(provider: string): string {
  const normalized = provider.toLowerCase().trim();
  return PROVIDER_NORMALIZATION[normalized] || normalized;
}

/**
 * Get provider configuration
 */
export function getProviderConfig(provider: string): ProviderConfig {
  const normalized = normalizeProviderName(provider);
  return PROVIDER_CONFIG[normalized] || { ...DEFAULT_PROVIDER, displayName: provider };
}

/**
 * Get icon name as string (for serialization)
 */
export function getIconName(provider: string): string {
  const config = getProviderConfig(provider);
  // Map icon components to string names for serialization
  // Compare by reference to determine which icon it is
  const iconNames: Record<string, string> = {
    [Sparkles.toString()]: "Sparkles",
    [Bot.toString()]: "Bot",
    [Brain.toString()]: "Brain",
    [Zap.toString()]: "Zap",
    [Code.toString()]: "Code",
    [Cpu.toString()]: "Cpu",
  };
  
  // Use a simpler approach: check which icon matches
  if (config.icon === Sparkles) return "Sparkles";
  if (config.icon === Bot) return "Bot";
  if (config.icon === Brain) return "Brain";
  if (config.icon === Zap) return "Zap";
  if (config.icon === Code) return "Code";
  if (config.icon === Cpu) return "Cpu";
  
  return "Brain"; // Default
}
