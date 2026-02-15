import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import {
    getUserSemanticMemory,
    updateUserSemanticMemory
} from "@/lib/prompts/semantic-memory";

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

    // Users can only access their own memory
    if (targetUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Optimized: Fetch memory and updatedAt in a single query
        const result = await db.query(
            'SELECT facts, "updatedAt" FROM user_semantic_memory WHERE "userId" = $1',
            [userId]
        );
        const row = result.rows[0] as { facts: string; updatedAt: number } | undefined;

        if (!row) {
            return NextResponse.json({
                userId,
                facts: {},
                updatedAt: null,
            });
        }

        const memory = row.facts ? JSON.parse(row.facts) : {};

        return NextResponse.json({
            userId,
            facts: memory || {},
            updatedAt: row.updatedAt || null,
        });
    } catch (error) {
        console.error("Error fetching user memory:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
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

    // Users can only update their own memory
    if (targetUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { facts } = await req.json();

        if (!facts || typeof facts !== 'object') {
            return NextResponse.json(
                { error: "Invalid facts data" },
                { status: 400 }
            );
        }

        await updateUserSemanticMemory(userId, facts);

        return NextResponse.json({
            userId,
            facts,
            message: "Memory updated successfully",
        });
    } catch (error) {
        console.error("Error updating user memory:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
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

    // Users can only delete their own memory
    if (targetUserId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const url = new URL(req.url);
        const factKey = url.searchParams.get("key");

        if (factKey) {
            // Delete specific fact
            const currentMemory = await getUserSemanticMemory(userId);
            if (currentMemory && factKey in currentMemory) {
                const updatedFacts = { ...currentMemory };
                delete updatedFacts[factKey];
                await updateUserSemanticMemory(userId, updatedFacts);
                return NextResponse.json({
                    message: `Fact "${factKey}" deleted successfully`,
                });
            } else {
                return NextResponse.json(
                    { error: "Fact not found" },
                    { status: 404 }
                );
            }
        } else {
            // Clear all memory
            await db.query('DELETE FROM user_semantic_memory WHERE "userId" = $1', [userId]);
            return NextResponse.json({
                message: "All memory cleared successfully",
            });
        }
    } catch (error) {
        console.error("Error deleting user memory:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
