import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}): Promise<Metadata> {
  const { conversationId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { title: "Chat - Trew" };
  }

  try {
    const res = await db.query(
      `SELECT title FROM chat WHERE id = $1 AND "userId" = $2 AND "deletedAt" IS NULL LIMIT 1`,
      [conversationId, session.user.id]
    );

    const title = res.rows?.[0]?.title as string | undefined;
    if (title) return { title: `${title} - Trew` };
  } catch {
    // ignore
  }

  return { title: "Chat - Trew" };
}

// The main UI is rendered by the layout to preserve state across navigations.
export default function ChatConversationPage() {
  return null;
}
