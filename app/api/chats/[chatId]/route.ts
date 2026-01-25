import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
        const chat = db
            .prepare("SELECT * FROM chat WHERE id = ? AND userId = ?")
            .get(chatId, userId);

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Parse query parameters for pagination
        const url = new URL(req.url);
        const limitParam = url.searchParams.get("limit");
        const beforeParam = url.searchParams.get("before");
        const afterParam = url.searchParams.get("after");
        
        const limit = limitParam ? parseInt(limitParam, 10) : 50;
        const before = beforeParam ? parseInt(beforeParam, 10) : null;
        const after = afterParam ? parseInt(afterParam, 10) : null;

        let messages: any[];
        let hasMore = false;
        let nextCursor: number | undefined;

        if (before !== null) {
            // Fetch messages before the cursor (for loading older messages)
            const query = db.prepare(`
                SELECT * FROM message 
                WHERE chatId = ? AND createdAt < ? 
                ORDER BY createdAt DESC 
                LIMIT ?
            `);
            messages = query.all(chatId, before, limit + 1) as any[];
            
            // Check if there are more messages
            if (messages.length > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the oldest message's timestamp
            if (messages.length > 0) {
                nextCursor = messages[messages.length - 1].createdAt;
            }
            
            // Reverse to get ascending order
            messages = messages.reverse();
        } else if (after !== null) {
            // Fetch messages after the cursor (for loading newer messages)
            const query = db.prepare(`
                SELECT * FROM message 
                WHERE chatId = ? AND createdAt > ? 
                ORDER BY createdAt ASC 
                LIMIT ?
            `);
            messages = query.all(chatId, after, limit + 1) as any[];
            
            // Check if there are more messages
            if (messages.length > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the newest message's timestamp
            if (messages.length > 0) {
                nextCursor = messages[messages.length - 1].createdAt;
            }
        } else {
            // No pagination: fetch most recent messages (for initial load)
            // Get total count first
            const totalCount = db
                .prepare("SELECT COUNT(*) as count FROM message WHERE chatId = ?")
                .get(chatId) as { count: number };
            
            const query = db.prepare(`
                SELECT * FROM message 
                WHERE chatId = ? 
                ORDER BY createdAt DESC 
                LIMIT ?
            `);
            messages = query.all(chatId, limit + 1) as any[];
            
            // Check if there are more messages
            if (messages.length > limit || totalCount.count > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the oldest message's timestamp
            if (messages.length > 0) {
                nextCursor = messages[messages.length - 1].createdAt;
            }
            
            // Reverse to get ascending order (oldest first)
            messages = messages.reverse();
        }

        // Parse attachments JSON for each message and ensure isStreaming is false for DB messages
        const parsedMessages = messages.map(msg => ({
            ...msg,
            attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
            isStreaming: false // DB messages are never streaming
        }));

        return NextResponse.json({ 
            ...chat, 
            messages: parsedMessages,
            hasMore,
            nextCursor
        });
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
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

    const { title, archived } = await req.json();
    const userId = session.user.id;

    try {
        let result;

        if (archived !== undefined) {
            const archivedAt = archived ? Date.now() : null;
            result = db.prepare(
                "UPDATE chat SET archivedAt = ?, updatedAt = ? WHERE id = ? AND userId = ?"
            ).run(archivedAt, Date.now(), chatId, userId);
        } else if (title !== undefined) {
            result = db.prepare(
                "UPDATE chat SET title = ?, updatedAt = ? WHERE id = ? AND userId = ?"
            ).run(title, Date.now(), chatId, userId);
        } else {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (result.changes === 0) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
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
        // Soft delete
        const result = db.prepare(
            "UPDATE chat SET deletedAt = ? WHERE id = ? AND userId = ?"
        ).run(Date.now(), chatId, userId);

        if (result.changes === 0) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
