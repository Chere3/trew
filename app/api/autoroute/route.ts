import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { unstable_cache } from "next/cache";
import { selectOptimalModel, toRankedModel } from "@/lib/autorouter";
import type { AutorouteResult } from "@/lib/autorouter";

// Cache for models - reuse from models API
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
    ["autoroute-models"],
    { revalidate: 3600 } // 1 hour
);

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
            { error: "Fireworks API key not configured" },
            { status: 500 }
        );
    }

    try {
        // Fetch models with rankings
        const models = await getCachedModels();

        // Convert to RankedModel format
        const rankedModels = models.map((m: {
            id: string;
            name: string;
            provider: string;
            intelligenceIndex?: number;
            codingIndex?: number;
            mathIndex?: number;
            reasoningIndex?: number;
        }) => toRankedModel(m));

        // Select optimal model
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
        console.error("Autoroute error:", error);
        return NextResponse.json(
            { error: "Failed to select model" },
            { status: 500 }
        );
    }
}
