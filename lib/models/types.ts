// Type definitions for OpenRouter API response
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string | null;
  };
  top_provider?: {
    max_completion_tokens?: number | null;
    is_moderated?: boolean;
  };
  per_request_limits?: {
    prompt_tokens?: string;
    completion_tokens?: string;
  } | null;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
  created?: number;
  canonical_slug?: string;
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

// Type definitions for Artificial Analysis API response
export interface ArtificialAnalysisModel {
  id: string;
  name: string;
  slug: string;
  model_creator: {
    id: string;
    name: string;
    slug: string;
  };
  evaluations: {
    artificial_analysis_intelligence_index?: number;
    artificial_analysis_coding_index?: number;
    artificial_analysis_math_index?: number;
    artificial_analysis_reasoning_index?: number;
    [key: string]: number | undefined;
  };
  pricing?: {
    price_1m_blended_3_to_1?: number;
    price_1m_input_tokens?: number;
    price_1m_output_tokens?: number;
  };
  median_output_tokens_per_second?: number;
  median_time_to_first_token_seconds?: number;
  median_time_to_first_answer_token?: number;
}

export interface ArtificialAnalysisModelsResponse {
  status: number;
  data: ArtificialAnalysisModel[];
}

// Extended Model interface with OpenRouter-specific fields
export interface Model {
  id: string;
  name: string;
  provider: string;
  icon: string; // Icon component name instead of actual component for serialization
  color: string;
  description?: string;
  capabilities?: {
    contextWindow?: string;
    speed?: "fast" | "medium" | "slow";
    specialty?: string[];
  };
  // Artificial Analysis fields
  flagship?: boolean;
  rank?: number;
  intelligenceIndex?: number;
  codingIndex?: number;
  mathIndex?: number;
  // OpenRouter fields
  openrouterId?: string;
  canonicalSlug?: string;
}
