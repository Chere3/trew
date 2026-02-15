import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
    getChatStats,
    getUserStats,
    getModelStats,
    getAllModelsStats,
} from "@/lib/stats/token-tracker";
import type { UsageQuery } from "@/lib/types";
import { HTTP_STATUS, ERROR_MESSAGES, STATS_SCOPE_USER, STATS_SCOPE_CHAT, STATS_SCOPE_MODEL, STATS_SCOPE_ALL_MODELS, TIME_PERIOD_DAY, TIME_PERIOD_WEEK, TIME_PERIOD_MONTH, TIME_PERIOD_ALL } from "@/lib/constants";

function getDateRange(period?: string): { startDate?: number; endDate?: number } {
    const now = Date.now();
    let startDate: number | undefined;

    switch (period) {
        case TIME_PERIOD_DAY:
            startDate = now - 24 * 60 * 60 * 1000;
            break;
        case TIME_PERIOD_WEEK:
            startDate = now - 7 * 24 * 60 * 60 * 1000;
            break;
        case TIME_PERIOD_MONTH:
            startDate = now - 30 * 24 * 60 * 60 * 1000;
            break;
        case TIME_PERIOD_ALL:
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
        return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const userId = session.user.id;
    const url = new URL(req.url);
    const scope = url.searchParams.get("scope") as UsageQuery["scope"] || "user";
    const id = url.searchParams.get("id");
    const period = url.searchParams.get("period") as UsageQuery["period"] || "all";
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");

    const { startDate: periodStartDate, endDate: periodEndDate } = getDateRange(period);
    const startDate = startDateParam ? parseInt(startDateParam) : periodStartDate;
    const endDate = endDateParam ? parseInt(endDateParam) : periodEndDate;

    try {
        switch (scope) {
            case STATS_SCOPE_USER: {
                const targetUserId = id || userId;
                // Users can only view their own stats unless they're admin (future enhancement)
                if (targetUserId !== userId) {
                    return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
                }

                const stats = await getUserStats(targetUserId, startDate, endDate);
                if (!stats) {
                    return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.USER }, { status: HTTP_STATUS.NOT_FOUND });
                }

                return NextResponse.json({
                    scope: STATS_SCOPE_USER,
                    id: targetUserId,
                    period,
                    stats,
                });
            }

            case STATS_SCOPE_CHAT: {
                if (!id) {
                    return NextResponse.json(
                        { error: "Chat ID is required for chat scope" },
                        { status: HTTP_STATUS.BAD_REQUEST }
                    );
                }

                // Verify chat ownership
                const { db } = await import("@/lib/db");
                const chatResult = await db.query(
                    'SELECT "userId" FROM chat WHERE id = $1',
                    [id]
                );
                const chat = chatResult.rows[0] as { userId: string } | undefined;

                if (!chat) {
                    return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.CHAT }, { status: HTTP_STATUS.NOT_FOUND });
                }

                if (chat.userId !== userId) {
                    return NextResponse.json({ error: ERROR_MESSAGES.FORBIDDEN }, { status: HTTP_STATUS.FORBIDDEN });
                }

                const stats = await getChatStats(id, startDate, endDate);
                if (!stats) {
                    return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.CHAT }, { status: HTTP_STATUS.NOT_FOUND });
                }

                return NextResponse.json({
                    scope: STATS_SCOPE_CHAT,
                    id,
                    period,
                    stats,
                });
            }

            case STATS_SCOPE_MODEL: {
                if (!id) {
                    return NextResponse.json(
                        { error: ERROR_MESSAGES.REQUIRED_FIELDS.MODEL_ID },
                        { status: HTTP_STATUS.BAD_REQUEST }
                    );
                }

                const stats = await getModelStats(id, startDate, endDate);
                if (!stats) {
                    return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.MODEL }, { status: HTTP_STATUS.NOT_FOUND });
                }

                return NextResponse.json({
                    scope: STATS_SCOPE_MODEL,
                    id,
                    period,
                    stats,
                });
            }

            case STATS_SCOPE_ALL_MODELS: {
                // Get statistics for all models
                const allModelsStats = await getAllModelsStats(startDate, endDate);

                return NextResponse.json({
                    scope: STATS_SCOPE_ALL_MODELS,
                    period,
                    stats: allModelsStats,
                });
            }

            default:
                return NextResponse.json(
                    { error: ERROR_MESSAGES.INVALID_SCOPE },
                    { status: HTTP_STATUS.BAD_REQUEST }
                );
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
            { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
    }
}
