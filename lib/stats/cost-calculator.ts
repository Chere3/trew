import type { TokenUsageInput } from "./types";

/**
 * Model pricing information from OpenRouter
 */
export interface ModelPricing {
    prompt: string; // Price per 1M prompt tokens (e.g., "1.50")
    completion: string; // Price per 1M completion tokens (e.g., "6.00")
}

/**
 * Cache for model pricing to avoid repeated API calls
 */
const pricingCache: Map<string, { pricing: ModelPricing; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Get model pricing from OpenRouter API or cache
 */
export async function getModelPricing(
    modelId: string,
    openRouterApiKey?: string
): Promise<ModelPricing | null> {
    // Check cache first
    const cached = pricingCache.get(modelId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.pricing;
    }

    // If no API key, return null (cost will be 0)
    if (!openRouterApiKey) {
        return null;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            headers: {
                Authorization: `Bearer ${openRouterApiKey}`,
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch model pricing: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const model = data.data?.find((m: any) => m.id === modelId);

        if (model?.pricing) {
            const pricing: ModelPricing = {
                prompt: model.pricing.prompt || "0",
                completion: model.pricing.completion || "0",
            };

            // Update cache
            pricingCache.set(modelId, {
                pricing,
                timestamp: Date.now(),
            });

            return pricing;
        }
    } catch (error) {
        console.error("Error fetching model pricing:", error);
    }

    return null;
}

/**
 * Calculate cost for a message based on token usage and model pricing
 */
export function calculateMessageCost(
    usage: Pick<TokenUsageInput, "promptTokens" | "completionTokens" | "cachedTokens">,
    pricing: ModelPricing | null
): number {
    if (!pricing) {
        return 0;
    }

    const promptPricePerMillion = parseFloat(pricing.prompt) || 0;
    const completionPricePerMillion = parseFloat(pricing.completion) || 0;

    // Calculate prompt cost (excluding cached tokens which are typically cheaper)
    const nonCachedPromptTokens = usage.promptTokens - (usage.cachedTokens || 0);
    const promptCost = (nonCachedPromptTokens / 1_000_000) * promptPricePerMillion;

    // Cached tokens are typically 50% discount, but we'll use full price for simplicity
    // In production, you might want to fetch cached token pricing separately
    const cachedCost = ((usage.cachedTokens || 0) / 1_000_000) * promptPricePerMillion * 0.5;

    // Calculate completion cost
    const completionCost = (usage.completionTokens / 1_000_000) * completionPricePerMillion;

    return promptCost + cachedCost + completionCost;
}

/**
 * Calculate cost from OpenRouter usage object (if provided directly)
 */
export function calculateCostFromUsage(usageData: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cached_tokens?: number;
    total_cost?: number;
}): number {
    // If total_cost is provided directly, use it (most accurate)
    if (usageData.total_cost !== undefined) {
        return usageData.total_cost;
    }

    // Otherwise, we'd need pricing to calculate, return 0 for now
    // This will be handled by the caller using calculateMessageCost
    return 0;
}

/**
 * Clear the pricing cache (useful for testing or forced refresh)
 */
export function clearPricingCache() {
    pricingCache.clear();
}
