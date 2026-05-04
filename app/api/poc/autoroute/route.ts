import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { selectOptimalModel, toRankedModel } from "@/lib/autorouter";
import type { AutorouteResult } from "@/lib/autorouter";

const getCachedModels = unstable_cache(
  async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/models`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }
    const data = await response.json();
    return data.models || [];
  },
  ["poc-autoroute-models"],
  { revalidate: 3600 }
);

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

  if (!FIREWORKS_API_KEY) {
    return NextResponse.json(
      { error: "FIREWORKS_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const models = await getCachedModels();

    const rankedModels = models.map(
      (m: {
        id: string;
        name: string;
        provider: string;
        intelligenceIndex?: number;
        codingIndex?: number;
        mathIndex?: number;
        reasoningIndex?: number;
      }) => toRankedModel(m)
    );

    const result: AutorouteResult = await selectOptimalModel(
      prompt,
      rankedModels,
      { fireworksApiKey: FIREWORKS_API_KEY }
    );

    return NextResponse.json({
      selectedModelId: result.selectedModelId,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning,
    });
  } catch (error) {
    console.error("PoC autoroute error:", error);
    return NextResponse.json(
      { error: "Failed to select model" },
      { status: 500 }
    );
  }
}
