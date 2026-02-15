import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getChatStats } from "@/lib/stats/token-tracker";
import { db } from "@/lib/db";

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

export async function GET(
    req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Optimized: Combine ownership check with userId filter for better index usage
        const chatResult = await db.query(
            'SELECT id, "userId" FROM chat WHERE id = $1 AND "userId" = $2',
            [chatId, userId]
        );
        const chat = chatResult.rows[0] as { id: string; userId: string } | undefined;

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        const url = new URL(req.url);
        const period = url.searchParams.get("period") || "all";
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");

        const { startDate: periodStartDate, endDate: periodEndDate } = getDateRange(period);
        const startDate = startDateParam ? parseInt(startDateParam) : periodStartDate;
        const endDate = endDateParam ? parseInt(endDateParam) : periodEndDate;

        const stats = await getChatStats(chatId, startDate, endDate);

        if (!stats) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        return NextResponse.json({
            chatId,
            period,
            stats,
        });
    } catch (error) {
        console.error("Error fetching chat stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
