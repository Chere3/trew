import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { invalidateChat } from "@/lib/cache/strategies";

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
        // Optimized: Use index on (id, userId) for fast lookup
        const chatResult = await db.query(
            'SELECT * FROM chat WHERE id = $1 AND "userId" = $2',
            [chatId, userId]
        );
        const chatRow = chatResult.rows[0];
        if (!chatRow) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }
        // Convert date fields from string (PostgreSQL bigint) to number
        const chat = {
            ...chatRow,
            createdAt: typeof chatRow.createdAt === 'string' ? parseInt(chatRow.createdAt, 10) : (chatRow.createdAt || Date.now()),
            updatedAt: typeof chatRow.updatedAt === 'string' ? parseInt(chatRow.updatedAt, 10) : (chatRow.updatedAt || Date.now()),
            archivedAt: chatRow.archivedAt ? (typeof chatRow.archivedAt === 'string' ? parseInt(chatRow.archivedAt, 10) : chatRow.archivedAt) : null,
            deletedAt: chatRow.deletedAt ? (typeof chatRow.deletedAt === 'string' ? parseInt(chatRow.deletedAt, 10) : chatRow.deletedAt) : null,
        };

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

        // Cache key for messages
        const cacheKey = CACHE_KEYS.CHAT_MESSAGES(chatId, limit, before, after);
        
        // Fetch messages with caching
        const messagesData = await getCached(
          cacheKey,
          async () => {
            let messages: any[];
            let hasMore = false;
            let nextCursor: number | undefined;

        if (before !== null) {
            // Fetch messages before the cursor (for loading older messages)
            const result = await db.query(`
                SELECT * FROM message 
                WHERE "chatId" = $1 AND "createdAt" < $2 
                ORDER BY "createdAt" DESC 
                LIMIT $3
            `, [chatId, before, limit + 1]);
            messages = result.rows;
            
            // Check if there are more messages
            if (messages.length > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the oldest message's timestamp
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                nextCursor = typeof lastMsg.createdAt === 'string' ? parseInt(lastMsg.createdAt, 10) : (lastMsg.createdAt || Date.now());
            }
            
            // Reverse to get ascending order
            messages = messages.reverse();
        } else if (after !== null) {
            // Fetch messages after the cursor (for loading newer messages)
            const result = await db.query(`
                SELECT * FROM message 
                WHERE "chatId" = $1 AND "createdAt" > $2 
                ORDER BY "createdAt" ASC 
                LIMIT $3
            `, [chatId, after, limit + 1]);
            messages = result.rows;
            
            // Check if there are more messages
            if (messages.length > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the newest message's timestamp
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                nextCursor = typeof lastMsg.createdAt === 'string' ? parseInt(lastMsg.createdAt, 10) : (lastMsg.createdAt || Date.now());
            }
        } else {
            // No pagination: fetch most recent messages (for initial load)
            // Optimized: Use LIMIT+1 pattern to avoid COUNT query (O(1) instead of O(n))
            const result = await db.query(`
                SELECT * FROM message 
                WHERE "chatId" = $1 
                ORDER BY "createdAt" DESC 
                LIMIT $2
            `, [chatId, limit + 1]);
            messages = result.rows;
            
            // Check if there are more messages (if we got limit+1, there are more)
            if (messages.length > limit) {
                hasMore = true;
                messages = messages.slice(0, limit);
            }
            
            // Set nextCursor to the oldest message's timestamp
            if (messages.length > 0) {
                const lastMsg = messages[messages.length - 1];
                nextCursor = typeof lastMsg.createdAt === 'string' ? parseInt(lastMsg.createdAt, 10) : (lastMsg.createdAt || Date.now());
            }
            
            // Reverse to get ascending order (oldest first)
            messages = messages.reverse();
            }

            // Parse attachments JSON for each message and ensure isStreaming is false for DB messages
            // Convert createdAt from string (PostgreSQL bigint) to number
            const parsedMessages = messages.map(msg => ({
                ...msg,
                attachments: msg.attachments ? JSON.parse(msg.attachments) : null,
                createdAt: typeof msg.createdAt === 'string' ? parseInt(msg.createdAt, 10) : (msg.createdAt || Date.now()),
                isStreaming: false // DB messages are never streaming
            }));

            return {
                messages: parsedMessages,
                hasMore,
                nextCursor
            };
          },
          CACHE_TTL.CHAT_MESSAGES
        );

        return NextResponse.json({ 
            ...chat, 
            messages: messagesData.messages,
            hasMore: messagesData.hasMore,
            nextCursor: messagesData.nextCursor
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
            result = await db.query(
                'UPDATE chat SET "archivedAt" = $1, "updatedAt" = $2 WHERE id = $3 AND "userId" = $4',
                [archivedAt, Date.now(), chatId, userId]
            );
        } else if (title !== undefined) {
            result = await db.query(
                'UPDATE chat SET title = $1, "updatedAt" = $2 WHERE id = $3 AND "userId" = $4',
                [title, Date.now(), chatId, userId]
            );
        } else {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        // Invalidate chat cache
        await invalidateChat(chatId);

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
        const result = await db.query(
            'UPDATE chat SET "deletedAt" = $1 WHERE id = $2 AND "userId" = $3',
            [Date.now(), chatId, userId]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Chat not found or unauthorized" }, { status: 404 });
        }

        // Invalidate chat cache
        await invalidateChat(chatId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
