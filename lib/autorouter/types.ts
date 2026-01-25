/**
 * Autorouter Type Definitions
 * 
 * Types for intelligent model routing based on task category classification
 * 
 * Re-exports from centralized types file for backward compatibility
 */

// Re-export types from centralized types file
export type {
    TaskCategory,
    CategoryClassification,
    RankedModel,
    CategoryModelAssignment,
    AutorouteResult,
    AutorouterConfig,
} from "@/lib/types";

// Re-export constants from centralized constants file
export { CATEGORY_PRIORITY, QUICK_MODEL_DEFAULT } from "@/lib/constants";
