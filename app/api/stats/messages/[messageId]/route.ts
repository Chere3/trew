import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getMessageStats } from "@/lib/stats/token-tracker";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ messageId: string }> }
) {
    const { messageId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    try {
        // Verify message ownership through chat
        const message = db
            .prepare(`
                SELECT m.id, m.chatId, c.userId 
                FROM message m
                JOIN chat c ON m.chatId = c.id
                WHERE m.id = ?
            `)
            .get(messageId) as { id: string; chatId: string; userId: string } | undefined;

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const stats = getMessageStats(messageId);

        if (!stats) {
            return NextResponse.json(
                { error: "Token usage data not found for this message" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            messageId,
            stats,
        });
    } catch (error) {
        console.error("Error fetching message stats:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
