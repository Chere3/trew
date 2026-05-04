import { NextResponse } from "next/server";
import { selectOptimalModel, toRankedModel } from "@/lib/autorouter";
import { quickClassify } from "@/lib/autorouter/classifier";
import type { AutorouteResult } from "@/lib/autorouter";

/**
 * Static, offline model catalogue for the PoC.
 *
 * Avoids hitting OpenRouter / Fireworks at all — useful on corporate
 * networks where TLS interception breaks outbound HTTPS from Node
 * (UNABLE_TO_GET_ISSUER_CERT_LOCALLY).
 *
 * Indices are coarse approximations (0-100) just to give the
 * autorouter something to rank by per category.
 */
const FALLBACK_MODELS = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    intelligenceIndex: 80,
    codingIndex: 78,
    mathIndex: 80,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    intelligenceIndex: 65,
    codingIndex: 60,
    mathIndex: 60,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    intelligenceIndex: 85,
    codingIndex: 88,
    mathIndex: 78,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    intelligenceIndex: 60,
    codingIndex: 55,
    mathIndex: 50,
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    intelligenceIndex: 75,
    codingIndex: 70,
    mathIndex: 82,
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "deepseek",
    intelligenceIndex: 82,
    codingIndex: 85,
    mathIndex: 90,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "meta",
    intelligenceIndex: 70,
    codingIndex: 65,
    mathIndex: 70,
  },
];

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "Prompt is required" },
      { status: 400 }
    );
  }

  const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

  try {
    const rankedModels = FALLBACK_MODELS.map((m) => toRankedModel(m));

    let result: AutorouteResult;

    if (FIREWORKS_API_KEY) {
      try {
        result = await selectOptimalModel(prompt, rankedModels, {
          fireworksApiKey: FIREWORKS_API_KEY,
        });
      } catch (e) {
        console.warn(
          "[poc/autoroute] AI classifier unavailable, falling back to heuristic:",
          e
        );
        result = heuristicSelect(prompt, rankedModels);
      }
    } else {
      result = heuristicSelect(prompt, rankedModels);
    }

    const matched = FALLBACK_MODELS.find((m) => m.id === result.selectedModelId);

    return NextResponse.json({
      selectedModelId: result.selectedModelId,
      modelName: matched?.name ?? result.selectedModelId,
      provider: matched?.provider,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning,
      offline: !FIREWORKS_API_KEY,
    });
  } catch (error) {
    console.error("PoC autoroute error:", error);
    return NextResponse.json(
      { error: "Failed to select model" },
      { status: 500 }
    );
  }
}

/**
 * Pure offline routing: heuristic classifier + best model in that category.
 */
function heuristicSelect(
  prompt: string,
  rankedModels: ReturnType<typeof toRankedModel>[]
): AutorouteResult {
  const quick = quickClassify(prompt) ?? {
    category: "general" as const,
    confidence: 0.5,
    reasoning: "No heuristic match; defaulting to general",
  };

  const pickBy = (key: "codingIndex" | "mathIndex" | "intelligenceIndex") =>
    [...rankedModels]
      .filter((m) => typeof m[key] === "number")
      .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))[0];

  const choice =
    quick.category === "coding"
      ? pickBy("codingIndex")
      : quick.category === "math_reasoning"
        ? pickBy("mathIndex")
        : quick.category === "quick"
          ? [...rankedModels].sort(
              (a, b) =>
                (a.intelligenceIndex ?? 0) - (b.intelligenceIndex ?? 0)
            )[0]
          : pickBy("intelligenceIndex");

  return {
    selectedModelId: choice?.id ?? rankedModels[0].id,
    category: quick.category,
    confidence: quick.confidence,
    reasoning: quick.reasoning ?? "",
    assignments: {
      coding: pickBy("codingIndex")?.id ?? null,
      math_reasoning: pickBy("mathIndex")?.id ?? null,
      general: pickBy("intelligenceIndex")?.id ?? null,
      quick: rankedModels[rankedModels.length - 1]?.id ?? null,
    },
  };
}
