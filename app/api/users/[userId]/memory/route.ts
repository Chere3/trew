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
        const memory = getUserSemanticMemory(userId);
        
        // Get updatedAt timestamp
        const result = db
            .prepare("SELECT updatedAt FROM user_semantic_memory WHERE userId = ?")
            .get(userId) as { updatedAt: number } | undefined;

        return NextResponse.json({
            userId,
            facts: memory || {},
            updatedAt: result?.updatedAt || null,
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

        updateUserSemanticMemory(userId, facts);

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
            const currentMemory = getUserSemanticMemory(userId);
            if (currentMemory && factKey in currentMemory) {
                const updatedFacts = { ...currentMemory };
                delete updatedFacts[factKey];
                updateUserSemanticMemory(userId, updatedFacts);
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
            db.prepare("DELETE FROM user_semantic_memory WHERE userId = ?").run(userId);
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
