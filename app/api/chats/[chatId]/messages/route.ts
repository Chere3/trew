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
  const { chatId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const { role, content, attachments } = (await req.json()) as {
    role?: string
    content?: string
    attachments?: unknown
  }

  if (!role || !content) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.REQUIRED_FIELDS.ROLE_AND_CONTENT },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const userId = session.user.id

  try {
    const chatResult = await db.query(
      'SELECT id FROM chat WHERE id = $1 AND "userId" = $2',
      [chatId, userId]
    )

    if (!chatResult.rows[0]) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND.CHAT },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    const now = Date.now()
    const messageId = nanoid()

    await db.query(
      'INSERT INTO message (id, "chatId", role, content, attachments, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [
        messageId,
        chatId,
        role,
        content,
        attachments ? JSON.stringify(attachments) : null,
        now,
      ]
    )

    await db.query('UPDATE chat SET "updatedAt" = $1 WHERE id = $2', [now, chatId])

    return NextResponse.json({
      id: messageId,
      chatId,
      role,
      content,
      attachments,
      createdAt: now,
    })
  } catch (error) {
    console.error("Error adding message:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const userId = session.user.id
  const { messageId } = (await req.json()) as { messageId?: string }

  if (!messageId) {
    return NextResponse.json(
      { error: "messageId is required" },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const chatResult = await db.query(
      'SELECT id FROM chat WHERE id = $1 AND "userId" = $2',
      [chatId, userId]
    )

    if (!chatResult.rows[0]) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND.CHAT },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    const msgResult = await db.query(
      'SELECT "createdAt" FROM message WHERE id = $1 AND "chatId" = $2',
      [messageId, chatId]
    )

    const createdAt = msgResult.rows[0]?.createdAt as number | undefined
    if (typeof createdAt !== "number") {
      return NextResponse.json(
        { error: ERROR_MESSAGES.NOT_FOUND.MESSAGE },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    const deleteResult = await db.query(
      'DELETE FROM message WHERE "chatId" = $1 AND "createdAt" > $2',
      [chatId, createdAt]
    )

    const now = Date.now()
    await db.query('UPDATE chat SET "updatedAt" = $1 WHERE id = $2', [now, chatId])

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.rowCount ?? 0,
    })
  } catch (error) {
    console.error("Error deleting messages:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
