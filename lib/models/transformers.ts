import type { OpenRouterModel } from "./types";
import { getProviderConfig, getIconName } from "./providers";

/**
 * Transform OpenRouter model to internal Model interface
 */
export function transformOpenRouterModel(
  orModel: OpenRouterModel,
  rank?: number,
  intelligenceIndex?: number,
  codingIndex?: number,
  mathIndex?: number,
  flagship?: boolean
) {
  // Extract provider from ID (format: "provider/model-name")
  const [providerPart, modelNamePart] = orModel.id.split("/");
  const provider = providerPart || "Unknown";
  const providerConfig = getProviderConfig(provider);

  // Format context window
  const contextWindow = orModel.context_length
    ? `${(orModel.context_length / 1000).toFixed(0)}K`
    : undefined;

  // Determine speed based on pricing/performance (heuristic)
  let speed: "fast" | "medium" | "slow" = "medium";
  if (orModel.top_provider?.is_moderated === false) {
    speed = "fast";
  }

  return {
    id: orModel.id,
    name: orModel.name,
    provider: providerConfig.displayName,
    icon: getIconName(provider),
    color: providerConfig.color,
    description: orModel.description,
    capabilities: {
      contextWindow,
      speed,
      specialty: [],
    },
    openrouterId: orModel.id,
    canonicalSlug: orModel.canonical_slug,
    rank,
    intelligenceIndex,
    codingIndex,
    mathIndex,
    flagship,
  };
}

/**
 * Format context window number to string
 */
export function formatContextWindow(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return `${tokens}`;
}
