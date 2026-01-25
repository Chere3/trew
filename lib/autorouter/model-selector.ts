/**
 * Model Selector
 * 
 * Selects the optimal model for each category without repeating models
 */

import type {
    TaskCategory,
    RankedModel,
    CategoryModelAssignment,
    AutorouteResult,
    CategoryClassification
} from "./types";
import { CATEGORY_PRIORITY, QUICK_MODEL_DEFAULT } from "./types";

/**
 * Get the ranking index for a model based on category
 */
function getCategoryScore(model: RankedModel, category: TaskCategory): number {
    switch (category) {
        case "coding":
            return model.codingIndex ?? model.intelligenceIndex ?? 0;
        case "math_reasoning":
            return model.mathIndex ?? model.reasoningIndex ?? model.intelligenceIndex ?? 0;
        case "general":
            return model.intelligenceIndex ?? 0;
        case "quick":
            // For quick tasks, prefer any decent model (will be overridden by default)
            return model.intelligenceIndex ?? 0;
    }
}

/**
 * Select the best model for each category without repeating models
 * 
 * Algorithm:
 * 1. For each category in priority order (coding > math > general > quick)
 * 2. Sort available models by their category-specific index
 * 3. Assign the top model to that category
 * 4. Remove the assigned model from the available pool
 */
export function assignModelsToCategories(models: RankedModel[]): CategoryModelAssignment {
    const assignments: CategoryModelAssignment = {
        coding: null,
        math_reasoning: null,
        general: null,
        quick: null,
    };

    // Filter to models with at least one index
    const rankedModels = models.filter(m =>
        m.intelligenceIndex != null ||
        m.codingIndex != null ||
        m.mathIndex != null ||
        m.reasoningIndex != null
    );

    if (rankedModels.length === 0) {
        console.warn("No ranked models available for assignment");
        return assignments;
    }

    const usedModelIds = new Set<string>();

    for (const category of CATEGORY_PRIORITY) {
        // Get available models (not yet assigned)
        const availableModels = rankedModels.filter(m => !usedModelIds.has(m.id));

        if (availableModels.length === 0) {
            console.warn(`No available models for category: ${category}`);
            continue;
        }

        // Sort by category-specific score (descending)
        const sorted = [...availableModels].sort((a, b) => {
            // For general/quick, prefer models that are NOT primarily reasoning models
            if (category === "general" || category === "quick") {
                const aIsReasoning = a.reasoningIndex != null;
                const bIsReasoning = b.reasoningIndex != null;

                if (aIsReasoning !== bIsReasoning) {
                    return aIsReasoning ? 1 : -1; // Prefer non-reasoning (false comes first)
                }
            }

            return getCategoryScore(b, category) - getCategoryScore(a, category);
        });

        // Assign the top model
        let topModel = sorted[0];

        // For "general" tasks, prefer a mid-level model (e.g., 3rd or 4th best)
        // This reserves the top models for complex reasoning/coding and saves costs/latency
        if (category === "general" && sorted.length >= 3) {
            const midIndex = Math.min(2, sorted.length - 1); // Pick 3rd best (index 2)
            topModel = sorted[midIndex];
            console.log(`[Autorouter] Optimized General Selection: chosing ${topModel.name} (rank ${midIndex + 1}) instead of ${sorted[0].name}`);
        }

        assignments[category] = topModel.id;
        usedModelIds.add(topModel.id);

        console.log(`[Autorouter] Assigned ${category}: ${topModel.name} (score: ${getCategoryScore(topModel, category)})`);
    }

    return assignments;
}

/**
 * Select the optimal model based on classification
 */
export function selectModel(
    classification: CategoryClassification,
    assignments: CategoryModelAssignment,
    fallbackModelId: string
): AutorouteResult {
    const { category, confidence, reasoning } = classification;

    // Get the assigned model for this category
    let selectedModelId = assignments[category];

    // If no model assigned for this category, use fallback
    if (!selectedModelId) {
        console.warn(`No model assigned for category ${category}, using fallback`);
        selectedModelId = fallbackModelId;
    }

    // For quick tasks with high confidence, always use a fast/cheap model
    // This prevents simple prompts from using expensive models
    if (category === "quick" && confidence >= 0.85) {
        selectedModelId = QUICK_MODEL_DEFAULT;
        console.log(`[Autorouter] Using fast model for quick task: ${selectedModelId}`);
    }

    return {
        selectedModelId,
        category,
        confidence,
        reasoning: reasoning || `Selected for ${category} task`,
        assignments,
    };
}

/**
 * Transform Model interface to RankedModel
 */
export function toRankedModel(model: {
    id: string;
    name: string;
    provider: string;
    intelligenceIndex?: number;
    codingIndex?: number;
    mathIndex?: number;
    reasoningIndex?: number;
}): RankedModel {
    return {
        id: model.id,
        name: model.name,
        provider: model.provider,
        intelligenceIndex: model.intelligenceIndex,
        codingIndex: model.codingIndex,
        mathIndex: model.mathIndex,
        reasoningIndex: model.reasoningIndex,
    };
}
