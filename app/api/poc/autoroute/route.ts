import { NextResponse } from "next/server";
import { selectOptimalModel, toRankedModel } from "@/lib/autorouter";
import { quickClassify } from "@/lib/autorouter/classifier";
import type { AutorouteResult } from "@/lib/autorouter";
import { POC_MODELS } from "@/app/poc/poc-models";

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
    const rankedModels = POC_MODELS.map((m) => toRankedModel(m));
    const allowedIds = new Set(POC_MODELS.map((m) => m.id));

    let result: AutorouteResult;
    let classifier: "ai" | "heuristic" | "ai-fallback" = "heuristic";

    if (FIREWORKS_API_KEY) {
      try {
        result = await selectOptimalModel(prompt, rankedModels, {
          fireworksApiKey: FIREWORKS_API_KEY,
        });
        classifier = "ai";

        // classifyPrompt swallows network/auth errors and returns this
        // sentinel reasoning. When that happens (e.g. invalid Fireworks
        // key → 401), prefer the heuristic over a blanket "general".
        if (result.reasoning === "Default classification due to error") {
          console.warn(
            "[poc/autoroute] AI classifier returned default; falling back to heuristic. Check FIREWORKS_API_KEY."
          );
          result = heuristicSelect(prompt, rankedModels);
          classifier = "ai-fallback";
        }
      } catch (e) {
        console.warn(
          "[poc/autoroute] AI classifier threw, falling back to heuristic:",
          e
        );
        result = heuristicSelect(prompt, rankedModels);
        classifier = "ai-fallback";
      }
    } else {
      result = heuristicSelect(prompt, rankedModels);
    }

    // The shared selectModel hardcodes QUICK_MODEL_DEFAULT (a Moonshot/Kimi
    // model) for high-confidence "quick" classifications, and the Fireworks
    // path may return any model id. Force every selection back into the AZ
    // catalogue so we never serve a non-allowed (e.g. Chinese) model.
    if (!allowedIds.has(result.selectedModelId)) {
      const fallback = pickFallbackForCategory(result.category, rankedModels);
      console.warn(
        `[poc/autoroute] Model ${result.selectedModelId} not in catalogue; substituting ${fallback}.`
      );
      result = { ...result, selectedModelId: fallback };
    }

    const matched = POC_MODELS.find((m) => m.id === result.selectedModelId);

    return NextResponse.json({
      selectedModelId: result.selectedModelId,
      modelName: matched?.name ?? result.selectedModelId,
      provider: matched?.provider,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning,
      classifier,
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
 * Choose a sensible AZ-catalogue model for a given category. Used to override
 * any selection the upstream router makes that points outside the catalogue.
 */
function pickFallbackForCategory(
  category: string,
  rankedModels: ReturnType<typeof toRankedModel>[]
): string {
  const sortBy = (key: "codingIndex" | "mathIndex" | "intelligenceIndex") =>
    [...rankedModels]
      .filter((m) => typeof m[key] === "number")
      .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0))[0]?.id;

  if (category === "coding") return sortBy("codingIndex") ?? rankedModels[0].id;
  if (category === "math_reasoning")
    return sortBy("mathIndex") ?? rankedModels[0].id;
  if (category === "quick") {
    // Prefer the cheapest / lowest-intelligence chat model in the catalogue.
    const cheapest = [...rankedModels]
      .filter((m) => typeof m.intelligenceIndex === "number")
      .sort(
        (a, b) => (a.intelligenceIndex ?? 0) - (b.intelligenceIndex ?? 0)
      )[0];
    return cheapest?.id ?? rankedModels[0].id;
  }
  return sortBy("intelligenceIndex") ?? rankedModels[0].id;
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
