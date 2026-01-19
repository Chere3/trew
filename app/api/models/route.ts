import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import type { OpenRouterModelsResponse, ArtificialAnalysisModelsResponse, Model } from "@/lib/models/types";
import { transformOpenRouterModel } from "@/lib/models/transformers";
import { matchFlagshipModels } from "@/lib/models/matcher";

// Cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Fetch OpenRouter models
 */
async function fetchOpenRouterModels(): Promise<OpenRouterModelsResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers,
    next: { revalidate: CACHE_TTL },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch Artificial Analysis models
 */
async function fetchArtificialAnalysisModels(): Promise<ArtificialAnalysisModelsResponse> {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY;

  if (!apiKey) {
    throw new Error("ARTIFICIAL_ANALYSIS_API_KEY is not configured");
  }

  const response = await fetch("https://artificialanalysis.ai/api/v2/data/llms/models", {
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    next: { revalidate: CACHE_TTL * 24 }, // 24 hours for rankings
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Invalid Artificial Analysis API key");
    }
    if (response.status === 429) {
      throw new Error("Artificial Analysis API rate limit exceeded");
    }
    throw new Error(`Artificial Analysis API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Sort models according to plan: flagship first by rank, then non-flagship by rank, then alphabetical
 */
function sortModels(models: Model[]): Model[] {
  return models.sort((a, b) => {
    // Flagship models first
    if (a.flagship && !b.flagship) return -1;
    if (!a.flagship && b.flagship) return 1;

    // If both have ranks, sort by rank ascending
    if (a.rank != null && b.rank != null) {
      return a.rank - b.rank;
    }
    if (a.rank != null) return -1;
    if (b.rank != null) return 1;

    // Otherwise sort alphabetically by provider, then name
    if (a.provider !== b.provider) {
      return a.provider.localeCompare(b.provider);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get cached models (prevents multiple API calls)
 */
const getCachedModels = unstable_cache(
  async (): Promise<Model[]> => {
    try {
      // Fetch both APIs in parallel
      const [orResponse, aaResponse] = await Promise.all([
        fetchOpenRouterModels(),
        fetchArtificialAnalysisModels(),
      ]);

      // Match models
      const matches = matchFlagshipModels(orResponse.data, aaResponse.data);

      // Transform OpenRouter models and apply matches
      const models: Model[] = orResponse.data.map((orModel) => {
        const match = matches.get(orModel.id);
        return transformOpenRouterModel(
          orModel,
          match?.rank,
          match?.intelligenceIndex,
          match?.codingIndex,
          match?.mathIndex,
          match?.flagship
        );
      });

      // Sort models
      return sortModels(models);
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },
  ["models-list"],
  {
    revalidate: CACHE_TTL,
    tags: ["models"],
  }
);

export async function GET() {
  try {
    const models = await getCachedModels();
    return NextResponse.json({ models }, { status: 200 });
  } catch (error) {
    console.error("Models API error:", error);

    // Return error response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // If it's an API key error, return 500 with message
    if (errorMessage.includes("API key")) {
      return NextResponse.json(
        { error: errorMessage, models: [] },
        { status: 500 }
      );
    }

    // If it's a rate limit, return 429
    if (errorMessage.includes("rate limit")) {
      return NextResponse.json(
        { error: errorMessage, models: [] },
        { status: 429 }
      );
    }

    // Other errors
    return NextResponse.json(
      { error: "Failed to fetch models", models: [] },
      { status: 500 }
    );
  }
}
