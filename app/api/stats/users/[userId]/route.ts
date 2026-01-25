import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserStats } from "@/lib/stats/token-tracker";

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
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId: targetUserId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Users can only view their own stats (unless admin - future enhancement)
    if (targetUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const url = new URL(req.url);
        const period = url.searchParams.get("period") || "all";
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");

        const { startDate: periodStartDate, endDate: periodEndDate } = getDateRange(period);
        const startDate = startDateParam ? parseInt(startDateParam) : periodStartDate;
        const endDate = endDateParam ? parseInt(endDateParam) : periodEndDate;

        const stats = getUserStats(targetUserId, startDate, endDate);

        if (!stats) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            userId: targetUserId,
            period,
            stats,
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
