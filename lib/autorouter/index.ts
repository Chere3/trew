/**
 * Autorouter - Main Entry Point
 * 
 * Intelligent model routing based on task classification
 */

import type { AutorouteResult, RankedModel, AutorouterConfig, CategoryModelAssignment } from "./types";
import { classifyPrompt, quickClassify } from "./classifier";
import { assignModelsToCategories, selectModel, toRankedModel } from "./model-selector";

export { type AutorouteResult, type RankedModel, type AutorouterConfig } from "./types";
export { toRankedModel } from "./model-selector";

// Cache for model assignments (refreshed when models change)
let cachedAssignments: CategoryModelAssignment | null = null;
let cachedModelsHash: string | null = null;

/**
 * Compute a simple hash for cache invalidation
 */
function computeModelsHash(models: RankedModel[]): string {
    return models.map(m => `${m.id}:${m.intelligenceIndex}:${m.codingIndex}:${m.mathIndex}`).join("|");
}

/**
 * Get or compute model assignments
 */
function getAssignments(models: RankedModel[]): CategoryModelAssignment {
    const hash = computeModelsHash(models);

    if (cachedAssignments && cachedModelsHash === hash) {
        return cachedAssignments;
    }

    console.log("[Autorouter] Computing new model assignments...");
    cachedAssignments = assignModelsToCategories(models);
    cachedModelsHash = hash;

    return cachedAssignments;
}

/**
 * Select the optimal model for a given prompt
 * 
 * @param prompt - The user's message to analyze
 * @param models - Available models with rankings
 * @param config - Autorouter configuration with API keys
 * @returns The selected model and classification details
 */
export async function selectOptimalModel(
    prompt: string,
    models: RankedModel[],
    config: AutorouterConfig
): Promise<AutorouteResult> {
    // Get fallback model (first ranked model by intelligence)
    const sortedByIntelligence = [...models]
        .filter(m => m.intelligenceIndex != null)
        .sort((a, b) => (b.intelligenceIndex || 0) - (a.intelligenceIndex || 0));

    const fallbackModelId = sortedByIntelligence[0]?.id || models[0]?.id || "openai/gpt-4o";

    // Get model assignments
    const assignments = getAssignments(models);

    // Try quick heuristic classification first
    const quickResult = quickClassify(prompt);

    if (quickResult && quickResult.confidence >= 0.65) {
        console.log(`[Autorouter] Quick classification: ${quickResult.category} (${quickResult.confidence})`);
        return selectModel(quickResult, assignments, fallbackModelId);
    }

    // Use AI classification
    const classification = await classifyPrompt(prompt, config);
    console.log(`[Autorouter] AI classification: ${classification.category} (${classification.confidence})`);

    return selectModel(classification, assignments, fallbackModelId);
}

/**
 * Get the current model assignments (useful for display)
 */
export function getCurrentAssignments(models: RankedModel[]): CategoryModelAssignment {
    return getAssignments(models);
}

/**
 * Clear the assignments cache (call when models are updated)
 */
export function clearAssignmentsCache(): void {
    cachedAssignments = null;
    cachedModelsHash = null;
}
