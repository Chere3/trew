import type { OpenRouterModel, ArtificialAnalysisModel } from "./types";

// Cache for normalized strings to avoid repeated operations
const normalizeCache = new Map<string, string>();

/**
 * Normalize string for matching: lowercase, remove spaces/hyphens/underscores/dots
 * Cached for performance
 */
function normalize(str: string): string {
  if (!str) return "";
  if (normalizeCache.has(str)) return normalizeCache.get(str)!;
  const normalized = str.toLowerCase().replace(/[\s\-_\.]/g, "");
  normalizeCache.set(str, normalized);
  return normalized;
}

/**
 * Index structures for O(1) lookups
 */
interface MatchIndices {
  slugIndex: Map<string, ArtificialAnalysisModel>;
  nameIndex: Map<string, ArtificialAnalysisModel>;
  providerNameIndex: Map<string, Map<string, ArtificialAnalysisModel>>;
}

/**
 * Build index maps from Artificial Analysis models (O(m) time complexity)
 */
function buildIndices(aaModels: ArtificialAnalysisModel[]): MatchIndices {
  const slugIndex = new Map<string, ArtificialAnalysisModel>();
  const nameIndex = new Map<string, ArtificialAnalysisModel>();
  const providerNameIndex = new Map<string, Map<string, ArtificialAnalysisModel>>();

  for (const model of aaModels) {
    // Index by slug
    const normalizedSlug = normalize(model.slug);
    if (normalizedSlug) {
      slugIndex.set(normalizedSlug, model);
    }

    // Index by name
    const normalizedName = normalize(model.name);
    if (normalizedName) {
      nameIndex.set(normalizedName, model);
    }

    // Index by provider + name
    const normalizedProvider = normalize(model.model_creator.slug || model.model_creator.name);
    if (normalizedProvider && normalizedName) {
      if (!providerNameIndex.has(normalizedProvider)) {
        providerNameIndex.set(normalizedProvider, new Map());
      }
      const providerMap = providerNameIndex.get(normalizedProvider)!;
      providerMap.set(normalizedName, model);
    }
  }

  return { slugIndex, nameIndex, providerNameIndex };
}

/**
 * Match OpenRouter models with Artificial Analysis models
 * Time Complexity: O(n + m) where n = OpenRouter models, m = Artificial Analysis models
 */
export function matchFlagshipModels(
  orModels: OpenRouterModel[],
  aaModels: ArtificialAnalysisModel[]


): Map<string, { rank: number; intelligenceIndex: number; codingIndex: number; mathIndex: number; flagship: boolean }> {
  // Build indices: O(m)
  const indices = buildIndices(aaModels);

  // Determine flagship threshold (top 20 models or intelligence_index > 60)
  const sortedByIntelligence = [...aaModels]
    .filter((m) => m.evaluations.artificial_analysis_intelligence_index != null)
    .sort(
      (a, b) =>
        (b.evaluations.artificial_analysis_intelligence_index || 0) -
        (a.evaluations.artificial_analysis_intelligence_index || 0)
    );

  const flagshipThreshold = Math.max(20, Math.floor(sortedByIntelligence.length * 0.1));
  const intelligenceThreshold = 60;

  // Create rank map: model slug -> rank
  const rankMap = new Map<string, number>();
  sortedByIntelligence.forEach((model, index) => {
    rankMap.set(model.slug, index + 1);
  });

  // Match OpenRouter models: O(n)
  const matches = new Map<
    string,
    { rank: number; intelligenceIndex: number; codingIndex: number; mathIndex: number; flagship: boolean }
  >();
  const matchedAAModels = new Set<string>(); // Track matched AA models to avoid duplicates

  for (const orModel of orModels) {
    let matched = false;
    let matchedAAModel: ArtificialAnalysisModel | null = null;

    // Strategy 1: Slug lookup (O(1))
    // Try full canonical slug first, then try extracting model part (remove provider prefix and date suffix)
    if (orModel.canonical_slug) {
      // Try full canonical slug
      const normalizedSlug = normalize(orModel.canonical_slug);
      matchedAAModel = indices.slugIndex.get(normalizedSlug) || null;

      // If not found, try extracting just the model part (remove provider/date)
      if (!matchedAAModel) {
        // Extract model part: "openai/gpt-5.2-20251211" -> "gpt-5.2"
        // Remove provider prefix and date suffix (format: YYYYMMDD)
        const slugParts = orModel.canonical_slug.split("/");
        if (slugParts.length >= 2) {
          let modelPart = slugParts.slice(1).join("/");
          // Remove date suffix pattern: -YYYYMMDD or -YYYYMMDDHHMMSS
          modelPart = modelPart.replace(/-\d{8}(\d{6})?$/, "");
          const normalizedModelPart = normalize(modelPart);
          matchedAAModel = indices.slugIndex.get(normalizedModelPart) || null;
        }
      }

      if (matchedAAModel && !matchedAAModels.has(matchedAAModel.id)) {
        matched = true;
      }
    }

    // Strategy 2: ID-based name lookup (O(1))
    // Try exact match first, then try prefix match (for AA names with suffixes like "(xhigh)")
    if (!matched && orModel.id) {
      const parts = orModel.id.split("/");
      if (parts.length >= 2) {
        const modelNamePart = parts.slice(1).join("/"); // Handle nested paths
        const normalizedName = normalize(modelNamePart);
        matchedAAModel = indices.nameIndex.get(normalizedName) || null;

        // If exact match not found, try prefix match (for names like "GPT-5.2 (xhigh)")
        if (!matchedAAModel) {
          for (const [aaNormalizedName, aaModel] of indices.nameIndex.entries()) {
            if (aaNormalizedName.startsWith(normalizedName) && !matchedAAModels.has(aaModel.id)) {
              matchedAAModel = aaModel;
              break;
            }
          }
        }

        if (matchedAAModel && !matchedAAModels.has(matchedAAModel.id)) {
          matched = true;
        }
      }
    }

    // Strategy 3: Provider + name lookup (O(1))
    // Try exact match first, then try prefix match (for AA names with suffixes)
    if (!matched && orModel.id) {
      const parts = orModel.id.split("/");
      if (parts.length >= 2) {
        const providerPart = normalize(parts[0]);
        const modelNamePart = normalize(parts.slice(1).join("/"));
        const providerMap = indices.providerNameIndex.get(providerPart);
        if (providerMap) {
          matchedAAModel = providerMap.get(modelNamePart) || null;

          // If exact match not found, try prefix match
          if (!matchedAAModel) {
            for (const [aaNormalizedName, aaModel] of providerMap.entries()) {
              if (aaNormalizedName.startsWith(modelNamePart) && !matchedAAModels.has(aaModel.id)) {
                matchedAAModel = aaModel;
                break;
              }
            }
          }
        }
        if (matchedAAModel && !matchedAAModels.has(matchedAAModel.id)) {
          matched = true;
        }
      }
    }

    // Strategy 4: Model name part against AA slug index (O(1))
    // This catches cases where OpenRouter model name matches AA slug
    // e.g., "gpt-5.2" (OR) matches "gpt-5-2" (AA slug)
    if (!matched && orModel.id) {
      const parts = orModel.id.split("/");
      if (parts.length >= 2) {
        const modelNamePart = parts.slice(1).join("/");
        const normalizedModelName = normalize(modelNamePart);
        matchedAAModel = indices.slugIndex.get(normalizedModelName) || null;
        if (matchedAAModel && !matchedAAModels.has(matchedAAModel.id)) {
          matched = true;
        }
      }
    }

    // If matched, assign rank and flagship status
    if (matched && matchedAAModel) {
      const rank = rankMap.get(matchedAAModel.slug) || 9999;
      const intelligenceIndex =
        matchedAAModel.evaluations.artificial_analysis_intelligence_index || 0;
      const codingIndex =
        matchedAAModel.evaluations.artificial_analysis_coding_index || 0;
      const mathIndex =
        matchedAAModel.evaluations.artificial_analysis_math_index || 0;
      const flagship =
        rank <= flagshipThreshold || intelligenceIndex >= intelligenceThreshold;

      matches.set(orModel.id, {
        rank,
        intelligenceIndex,
        codingIndex,
        mathIndex,
        flagship,
      });

      matchedAAModels.add(matchedAAModel.id);
    }
  }

  return matches;
}
