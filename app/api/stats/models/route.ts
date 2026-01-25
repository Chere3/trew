import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAllModelsStats, getModelStats } from "@/lib/stats/token-tracker";

function getDateRange(period?: string): { startDate?: number; endDate?: number } {
    const now = Date.now();
    let startDate: number | undefined;

    switch (period) {
        case "day":
            startDate = now - 24 * 60 * 60 * 1000;
            break;
        case "week":
            startDate = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case "month":
            startDate = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case "all":
        default:
            startDate = undefined;
            break;
    }

    return { startDate, endDate: now };
}

export async function GET(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const modelId = url.searchParams.get("model");
        const period = url.searchParams.get("period") || "all";
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");

        const { startDate: periodStartDate, endDate: periodEndDate } = getDateRange(period);
        const startDate = startDateParam ? parseInt(startDateParam) : periodStartDate;
        const endDate = endDateParam ? parseInt(endDateParam) : periodEndDate;

        if (modelId) {
            // Get stats for a specific model
            const stats = getModelStats(modelId, startDate, endDate);

            if (!stats) {
                return NextResponse.json(
                    { error: "Model not found or no usage" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                model: modelId,
                period,
                stats,
            });
        } else {
            // Get stats for all models
            const allModelsStats = getAllModelsStats(startDate, endDate);

            return NextResponse.json({
                period,
                models: allModelsStats,
                summary: {
                    totalModels: allModelsStats.length,
                    totalRequests: allModelsStats.reduce((sum, m) => sum + m.requestCount, 0),
                    totalTokens: allModelsStats.reduce((sum, m) => sum + m.totalTokens, 0),
                    totalCost: allModelsStats.reduce((sum, m) => sum + m.totalCost, 0),
                },
            });
        }
    } catch (error) {
        console.error("Error fetching model stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
