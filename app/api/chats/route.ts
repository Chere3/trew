import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import {
  DEFAULTS,
  DEFAULT_CLASSIFIER_MODEL,
  ERROR_MESSAGES,
  FIREWORKS_API_BASE_URL,
  HTTP_STATUS,
  MESSAGE_ROLE_SYSTEM,
  MESSAGE_ROLE_USER,
} from "@/lib/constants";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const userId = session.user.id

  try {
    const url = new URL(req.url)
    const showArchived = url.searchParams.get("archived") === "true"

    const { rows } = await db.query(
      `
      SELECT
        c.*,
        (
          SELECT content
          FROM message m
          WHERE m."chatId" = c.id
          ORDER BY m."createdAt" DESC
          LIMIT 1
        ) AS preview
      FROM chat c
      WHERE c."userId" = $1
        AND c."deletedAt" IS NULL
        AND c."archivedAt" IS ${showArchived ? "NOT NULL" : "NULL"}
      ORDER BY c."updatedAt" DESC
      `,
      [userId]
    )

    const chatsWithCleanPreview = rows.map((chat) => {
      const preview = typeof chat.preview === "string" ? chat.preview : null
      if (!preview) return chat

      let cleanPreview = preview
      const thinkStart = cleanPreview.indexOf("<think>")
      if (thinkStart !== -1) {
        const thinkEnd = cleanPreview.indexOf("</think>", thinkStart)
        if (thinkEnd !== -1) {
          cleanPreview = cleanPreview.slice(0, thinkStart) + cleanPreview.slice(thinkEnd + 8)
          cleanPreview = cleanPreview.trim()
        } else {
          cleanPreview = cleanPreview.slice(0, thinkStart).trim()
        }
      }

      return { ...chat, preview: cleanPreview }
    })

    return NextResponse.json(chatsWithCleanPreview)
  } catch (error) {
    console.error("Error fetching chats:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    )
  }

  const userId = session.user.id
  const { message, attachments } = (await req.json()) as {
    message?: string
    attachments?: unknown
  }

  if (!message) {
    return NextResponse.json(
      { error: ERROR_MESSAGES.REQUIRED_FIELDS.MESSAGE },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const chatId = nanoid()
  const initialTitle = message.substring(0, DEFAULTS.TITLE_MAX_LENGTH)
  const now = Date.now()

  let finalTitle = initialTitle

  // Try to generate a title (best-effort)
  try {
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY

    if (FIREWORKS_API_KEY) {
      const response = await fetch(FIREWORKS_API_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIREWORKS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: DEFAULT_CLASSIFIER_MODEL,
          messages: [
            {
              role: MESSAGE_ROLE_SYSTEM,
              content:
                "Generate a very short, concise title (max 5 words) for this chat based on the first user message. Do not use quotes. Return ONLY the title. in the language of the user message",
            },
            { role: MESSAGE_ROLE_USER, content: message },
          ],
          max_tokens: DEFAULTS.TITLE_GENERATION_MAX_TOKENS,
        }),
      })

      if (response.ok) {
        const data = (await response.json()) as any
        const generatedTitle = data?.choices?.[0]?.message?.content?.trim?.()
        if (generatedTitle) finalTitle = generatedTitle
      }
    }
  } catch (error) {
    console.error("Failed to generate title:", error)
  }

  try {
    await db.query("BEGIN")

    await db.query(
      `INSERT INTO chat (id, "userId", title, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)`,
      [chatId, userId, finalTitle, now, now]
    )

    await db.query(
      `INSERT INTO message (id, "chatId", role, content, attachments, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        nanoid(),
        chatId,
        "user",
        message,
        attachments ? JSON.stringify(attachments) : null,
        now,
      ]
    )

    await db.query("COMMIT")

    return NextResponse.json({ id: chatId, title: finalTitle })
  } catch (error) {
    await db.query("ROLLBACK").catch(() => {})
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
