import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { HTTP_STATUS, ERROR_MESSAGES, MESSAGE_ROLE_USER, MESSAGE_ROLE_SYSTEM, DEFAULT_CLASSIFIER_MODEL, FIREWORKS_API_BASE_URL, DEFAULTS } from "@/lib/constants";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const userId = session.user.id;

  try {
    const url = new URL(req.url);
    const showArchived = url.searchParams.get("archived") === "true";

    const chats = db
      .prepare(`
        SELECT 
          c.*,
          (SELECT content FROM message m WHERE m.chatId = c.id ORDER BY m.createdAt DESC LIMIT 1) as preview
        FROM chat c 
        WHERE c.userId = ? 
          AND c.deletedAt IS NULL
          AND c.archivedAt IS ${showArchived ? "NOT NULL" : "NULL"}
        ORDER BY c.updatedAt DESC
      `)
      .all(userId);

    // Remove think parts from preview
    const chatsWithCleanPreview = chats.map((chat: any) => {
      if (chat.preview) {
        // Remove <think>...</think> blocks from preview
        let cleanPreview = chat.preview;
        const thinkStart = cleanPreview.indexOf('<think>');
        if (thinkStart !== -1) {
          const thinkEnd = cleanPreview.indexOf('</think>', thinkStart);
          if (thinkEnd !== -1) {
            // Remove the entire think block including tags
            cleanPreview = cleanPreview.slice(0, thinkStart) + cleanPreview.slice(thinkEnd + 8);
            // Trim leading whitespace/newlines
            cleanPreview = cleanPreview.trim();
          } else {
            // If closing tag not found, remove everything from <think> onwards
            cleanPreview = cleanPreview.slice(0, thinkStart).trim();
          }
        }
        return { ...chat, preview: cleanPreview };
      }
      return chat;
    });

    return NextResponse.json(chatsWithCleanPreview);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: ERROR_MESSAGES.UNAUTHORIZED }, { status: HTTP_STATUS.UNAUTHORIZED });
  }

  const userId = session.user.id;
  const { message, attachments } = await req.json();

  if (!message) {
    return NextResponse.json({ error: ERROR_MESSAGES.REQUIRED_FIELDS.MESSAGE }, { status: HTTP_STATUS.BAD_REQUEST });
  }

  const chatId = nanoid();
  const title = message.substring(0, DEFAULTS.TITLE_MAX_LENGTH);
  const now = Date.now();

  try {
    const insertChat = db.prepare(
      "INSERT INTO chat (id, userId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
    );

    const insertMessage = db.prepare(
      "INSERT INTO message (id, chatId, role, content, attachments, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
    );

    let finalTitle = title;

    // Try to generate title
    try {
      const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
      console.log("Generating title...", { hasKey: !!FIREWORKS_API_KEY });

      if (FIREWORKS_API_KEY) {
        const response = await fetch(FIREWORKS_API_BASE_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: DEFAULT_CLASSIFIER_MODEL,
            messages: [
              {
                role: MESSAGE_ROLE_SYSTEM,
                content: "Generate a very short, concise title (max 5 words) for this chat based on the first user message. Do not use quotes. Return ONLY the title. in the language of the user message",
              },
              {
                role: MESSAGE_ROLE_USER,
                content: message,
              }
            ],
            max_tokens: DEFAULTS.TITLE_GENERATION_MAX_TOKENS,
          })
        });

        console.log("Fireworks response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          const generatedTitle = data.choices[0]?.message?.content?.trim();
          console.log("Generated title:", generatedTitle);
          if (generatedTitle) {
            finalTitle = generatedTitle;
          }
        } else {
          const errorText = await response.text();
          console.error("Fireworks API error:", errorText);
        }
      } else {
        console.warn("FIREWORKS_API_KEY not found");
      }
    } catch (error) {
      console.error("Failed to generate title:", error);
    }

    const runTransaction = db.transaction(() => {
      insertChat.run(chatId, userId, finalTitle, now, now);
      insertMessage.run(
        nanoid(),
        chatId,
        'user',
        message,
        attachments ? JSON.stringify(attachments) : null,
        now
      );
    });

    runTransaction();

    return NextResponse.json({ id: chatId, title: finalTitle });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
