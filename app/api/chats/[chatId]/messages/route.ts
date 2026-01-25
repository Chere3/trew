import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { HTTP_STATUS, ERROR_MESSAGES } from "@/lib/constants";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ chatId: string }> }
) {
    const { chatId } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const { role, content, attachments } = await req.json();
    const userId = session.user.id;

    if (!role || !content) {
        return NextResponse.json({ error: ERROR_MESSAGES.REQUIRED_FIELDS.ROLE_AND_CONTENT }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    try {
        // Verify chat ownership
        const chat = db
            .prepare("SELECT id FROM chat WHERE id = ? AND userId = ?")
            .get(chatId, userId);

        if (!chat) {
            return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.CHAT }, { status: HTTP_STATUS.NOT_FOUND });
        }

        const now = Date.now();
        const messageId = nanoid();

        db.prepare(
            "INSERT INTO message (id, chatId, role, content, attachments, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(messageId, chatId, role, content, attachments ? JSON.stringify(attachments) : null, now);

        // Update chat timestamp
        db.prepare(
            "UPDATE chat SET updatedAt = ? WHERE id = ?"
        ).run(now, chatId);

        return NextResponse.json({
            id: messageId,
            chatId,
            role,
            content,
            attachments,
            createdAt: now
        });
    } catch (error) {
        console.error("Error adding message:", error);
        return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
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
        return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    const userId = session.user.id;
    const { messageId } = await req.json();

    if (!messageId) {
        return NextResponse.json({ error: "messageId is required" }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    try {
        // Verify chat ownership
        const chat = db
            .prepare("SELECT id FROM chat WHERE id = ? AND userId = ?")
            .get(chatId, userId);

        if (!chat) {
            return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.CHAT }, { status: HTTP_STATUS.NOT_FOUND });
        }

        // Get the timestamp of the message to delete from
        const message = db
            .prepare("SELECT createdAt FROM message WHERE id = ? AND chatId = ?")
            .get(messageId, chatId) as { createdAt: number } | undefined;

        if (!message) {
            return NextResponse.json({ error: ERROR_MESSAGES.NOT_FOUND.MESSAGE }, { status: HTTP_STATUS.NOT_FOUND });
        }

        // Delete all messages after this message (including this message's response)
        const result = db
            .prepare("DELETE FROM message WHERE chatId = ? AND createdAt > ?")
            .run(chatId, message.createdAt);

        // Update chat timestamp
        const now = Date.now();
        db.prepare(
            "UPDATE chat SET updatedAt = ? WHERE id = ?"
        ).run(now, chatId);

        return NextResponse.json({ 
            success: true, 
            deletedCount: result.changes 
        });
    } catch (error) {
        console.error("Error deleting messages:", error);
        return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }
}
