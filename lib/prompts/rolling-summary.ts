import { db } from "@/lib/db";
import { 
    ROLLING_SUMMARY_KEEP_RECENT, 
    ROLLING_SUMMARY_MIN_MESSAGES,
    FIREWORKS_API_BASE_URL,
    DEFAULT_CLASSIFIER_MODEL,
    MESSAGE_ROLE_USER,
    MESSAGE_ROLE_ASSISTANT,
    MESSAGE_ROLE_SYSTEM
} from "@/lib/constants";
import { getCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

export interface MessageForSummary {
    role: string;
    content: string;
    createdAt: number;
    attachments?: string | null;
}

export interface MessagesWithSummary {
    summary: string | null;
    recentMessages: MessageForSummary[];
}

/**
 * Get messages with rolling summary applied
 * Keeps the last N messages intact and uses summary for older messages
 */
export async function getMessagesWithSummary(
    chatId: string,
    keepRecent: number = ROLLING_SUMMARY_KEEP_RECENT
): Promise<MessagesWithSummary> {
    // Fetch all messages for the chat
    const allMessagesResult = await db.query(
        'SELECT role, content, attachments, "createdAt" FROM message WHERE "chatId" = $1 ORDER BY "createdAt" ASC',
        [chatId]
    );
    // Convert createdAt from string (PostgreSQL bigint) to number
    const allMessages = allMessagesResult.rows.map((msg: any) => ({
        ...msg,
        createdAt: typeof msg.createdAt === 'string' ? parseInt(msg.createdAt, 10) : (msg.createdAt || Date.now()),
    })) as MessageForSummary[];

    // If we have fewer messages than the minimum threshold, return all messages without summary
    if (allMessages.length < ROLLING_SUMMARY_MIN_MESSAGES) {
        return {
            summary: null,
            recentMessages: allMessages,
        };
    }

    // Get existing summary from chat table (with caching)
    const cacheKey = CACHE_KEYS.CHAT_SUMMARY(chatId);
    const existingSummary = await getCached(
        cacheKey,
        async () => {
            const chatResult = await db.query(
                'SELECT summary FROM chat WHERE id = $1',
                [chatId]
            );
            const chat = chatResult.rows[0] as { summary: string | null } | undefined;
            return chat?.summary || null;
        },
        CACHE_TTL.CHAT_SUMMARY
    );

    // Split messages: keep recent ones intact, older ones will be summarized
    const recentMessages = allMessages.slice(-keepRecent);
    const olderMessages = allMessages.slice(0, -keepRecent);

    // If we have older messages but no summary yet, include them in recentMessages
    // This ensures we don't lose context. The summary will be generated after the next response.
    if (olderMessages.length > 0 && !existingSummary) {
        // Include older messages for this request, summary will be generated next time
        return {
            summary: null,
            recentMessages: allMessages, // Send all messages until summary is generated
        };
    }

    return {
        summary: existingSummary,
        recentMessages,
    };
}

/**
 * Update the summary in the chat table (with cache invalidation)
 */
export async function updateSummary(chatId: string, summary: string): Promise<void> {
    try {
        await db.query('UPDATE chat SET summary = $1 WHERE id = $2', [summary, chatId]);
        
        // Update cache with new summary (write-through)
        const { setCache } = await import("@/lib/cache/redis");
        await setCache(CACHE_KEYS.CHAT_SUMMARY(chatId), summary, CACHE_TTL.CHAT_SUMMARY);
    } catch (error) {
        console.error("Failed to update summary:", error);
        throw error;
    }
}

/**
 * Generate a summary from messages using AI
 * Uses Fireworks API for cost-effective summarization
 */
export async function generateSummary(
    messages: MessageForSummary[],
    existingSummary: string | null = null
): Promise<string> {
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

    if (!FIREWORKS_API_KEY) {
        console.warn("FIREWORKS_API_KEY not found, cannot generate summary");
        // Return a simple text-based fallback
        return fallbackSummary(messages);
    }

    if (messages.length === 0) {
        return "";
    }

    try {
        // Format messages for summarization
        const conversationText = messages
            .map((m) => {
                const roleLabel = m.role === MESSAGE_ROLE_USER ? "User" : 
                                 m.role === MESSAGE_ROLE_ASSISTANT ? "Assistant" : 
                                 m.role === MESSAGE_ROLE_SYSTEM ? "System" : m.role;
                return `${roleLabel}: ${m.content}`;
            })
            .join("\n\n");

        // Build the prompt
        let prompt = "";
        if (existingSummary) {
            // Incremental update: combine existing summary with new messages
            prompt = `You are summarizing a conversation. Below is the existing summary and new messages that need to be incorporated.

Existing Summary:
${existingSummary}

New Messages:
${conversationText}

Please create an updated, concise summary (under 200 words) that incorporates the new information while preserving all important context from the existing summary. Focus on key decisions, important details, and conversation flow.`;
        } else {
            // Initial summary generation
            prompt = `Summarize the following conversation history concisely, preserving key decisions, context, and important details. Keep it under 200 words.

Conversation:
${conversationText}`;
        }

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
                        content: "You are a helpful assistant that creates concise, informative summaries of conversations."
                    },
                    {
                        role: MESSAGE_ROLE_USER,
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.3, // Lower temperature for more consistent summaries
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fireworks summary generation error:", response.status, errorText);
            return fallbackSummary(messages);
        }

        const data = await response.json();
        const summary = data.choices[0]?.message?.content?.trim();

        if (!summary) {
            console.warn("Empty summary returned from API");
            return fallbackSummary(messages);
        }

        return summary;
    } catch (error) {
        console.error("Failed to generate summary:", error);
        return fallbackSummary(messages);
    }
}

/**
 * Fallback summary generation using simple text truncation
 * Used when AI summarization is unavailable
 */
function fallbackSummary(messages: MessageForSummary[]): string {
    if (messages.length === 0) {
        return "";
    }

    // Simple fallback: take first few messages and truncate
    const firstMessages = messages.slice(0, 3);
    const text = firstMessages
        .map((m) => {
            const roleLabel = m.role === MESSAGE_ROLE_USER ? "User" : "Assistant";
            return `${roleLabel}: ${m.content.substring(0, 100)}`;
        })
        .join("\n");

    return `[Summary] ${text}${messages.length > 3 ? `... (${messages.length - 3} more messages)` : ""}`;
}

/**
 * Get older messages that should be summarized (everything except the last N messages)
 */
export async function getOlderMessages(
    chatId: string,
    keepRecent: number = ROLLING_SUMMARY_KEEP_RECENT
): Promise<MessageForSummary[]> {
    const allMessagesResult = await db.query(
        'SELECT role, content, attachments, "createdAt" FROM message WHERE "chatId" = $1 ORDER BY "createdAt" ASC',
        [chatId]
    );
    // Convert createdAt from string (PostgreSQL bigint) to number
    const allMessages = allMessagesResult.rows.map((msg: any) => ({
        ...msg,
        createdAt: typeof msg.createdAt === 'string' ? parseInt(msg.createdAt, 10) : (msg.createdAt || Date.now()),
    })) as MessageForSummary[];

    if (allMessages.length <= keepRecent) {
        return [];
    }

    return allMessages.slice(0, -keepRecent);
}
