import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { selectOptimalModel, toRankedModel } from "@/lib/autorouter";
import { getSystemPrompt } from "@/lib/prompts/system-prompt";
import { recordTokenUsage } from "@/lib/stats/token-tracker";
import { calculateCostFromUsage } from "@/lib/stats/cost-calculator";
import { 
    getMessagesWithSummary, 
    generateSummary, 
    updateSummary,
    getOlderMessages 
} from "@/lib/prompts/rolling-summary";
import {
    extractFacts,
    getUserSemanticMemory,
    updateUserSemanticMemory,
    shouldSaveFact,
    mergeFacts
} from "@/lib/prompts/semantic-memory";
import { DEFAULT_MEMORY_SCORE_THRESHOLD } from "@/lib/constants";
import { ROLLING_SUMMARY_KEEP_RECENT, ROLLING_SUMMARY_MIN_MESSAGES } from "@/lib/constants";
import { invalidateChat, invalidateChatSummary } from "@/lib/cache/strategies";

// Cache for models to reduce latency (5 minute TTL)
let modelsCache: { models: any[], timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Fetch models for autorouting (with caching for performance)
async function fetchModelsForAutoroute() {
    // Return cached models if still valid
    if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_TTL) {
        return modelsCache.models;
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/models`
    );
    if (!response.ok) return [];
    const data = await response.json();
    const models = data.models || [];

    // Update cache
    modelsCache = { models, timestamp: Date.now() };

    return models;
}

export async function POST(
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
    const body = await req.json();
    const { model, pendingUserMessage } = body as {
        model?: string;
        pendingUserMessage?: { content?: string; attachments?: Array<{ type?: string; url?: string; name?: string }> };
    };

    // Verify chat ownership.
    // With cache-first chat creation, a freshly created chat may take a brief moment
    // to appear in DB; retry a few times to avoid transient 404s on first generate.
    let chat: { id: string } | undefined;
    for (let attempt = 0; attempt < 4; attempt++) {
        const chatResult = await db.query(
            'SELECT id FROM chat WHERE id = $1 AND "userId" = $2',
            [chatId, userId]
        );
        chat = chatResult.rows[0] as { id: string } | undefined;
        if (chat) break;
        if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 300));
        }
    }

    if (!chat) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get messages with rolling summary applied
    const { summary, recentMessages } = await getMessagesWithSummary(chatId, ROLLING_SUMMARY_KEEP_RECENT);
    
    // Load user's semantic memory for system prompt injection
    const userFacts = await getUserSemanticMemory(userId);
    
    // Log for debugging
    if (userFacts && Object.keys(userFacts).length > 0) {
        console.log(`[Semantic Memory] Loaded ${Object.keys(userFacts).length} facts for user ${userId}`);
    }
    
    // For auto-routing, we need the last user message only (optimized: LIMIT 1 with DESC order)
    // This avoids fetching all messages when we only need the most recent user message
    const lastUserMessageResult = await db.query(
        'SELECT role, content, attachments FROM message WHERE "chatId" = $1 AND role = $2 ORDER BY "createdAt" DESC LIMIT 1',
        [chatId, 'user']
    );
    const lastUserMessage = lastUserMessageResult.rows[0] as { role: string; content: string; attachments: string | null } | undefined;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
    const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const SITE_NAME = "Trew";

    if (!OPENROUTER_API_KEY) {
        return NextResponse.json(
            { error: "OpenRouter API key not configured" },
            { status: 500 }
        );
    }

    // Handle auto-routing
    let selectedModel = model;

    if (model === "auto" && FIREWORKS_API_KEY) {
        try {
            // Use the optimized last user message query result
            const prompt = pendingUserMessage?.content?.trim() || lastUserMessage?.content || "";

            if (prompt) {
                const models = await fetchModelsForAutoroute();
                const rankedModels = models.map((m: {
                    id: string;
                    name: string;
                    provider: string;
                    intelligenceIndex?: number;
                    codingIndex?: number;
                    mathIndex?: number;
                    reasoningIndex?: number;
                }) => toRankedModel(m));

                const result = await selectOptimalModel(prompt, rankedModels, {
                    fireworksApiKey: FIREWORKS_API_KEY,
                });

                selectedModel = result.selectedModelId;
                console.log(`[Autorouter] Selected ${selectedModel} for ${result.category} (${result.confidence})`);
            } else {
                selectedModel = "openai/gpt-4o";
            }
        } catch (error) {
            console.error("Autoroute failed, using fallback:", error);
            selectedModel = "openai/gpt-4o";
        }
    }

    // Fallback if still auto or missing
    if (!selectedModel || selectedModel === "auto") {
        selectedModel = "openai/gpt-4o";
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const systemPrompt = getSystemPrompt(summary, userFacts);
                
                // Build messages array for API - inject user profile as first message if facts exist
                const apiMessages: Array<{ role: string; content: string | any[] }> = [];
                
                // Inject user profile as a system message for ALL conversations (not just new ones)
                // This ensures the model sees the profile information even if it ignores the system prompt
                if (userFacts && Object.keys(userFacts).length > 0 && recentMessages.length > 0) {
                    // Inject user profile as a system message at the start of the conversation
                    const profileMessage = `IMPORTANT: User Profile Information - Use this when answering questions about the user:\n${Object.entries(userFacts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}\n\nWhen the user asks "What is my name?" or similar questions, you MUST use the information above.`;
                    apiMessages.push({
                        role: 'system',
                        content: profileMessage
                    });
                }
                
                // Add all recent messages to API messages array
                recentMessages.forEach((m) => {
                    // Parse attachments if present
                    const attachments = m.attachments
                        ? JSON.parse(m.attachments)
                        : null;

                    // If message has image attachments, format as multimodal content
                    if (attachments && attachments.length > 0) {
                        const content: any[] = [];

                        // Add text content if present
                        if (m.content) {
                            content.push({
                                type: "text",
                                text: m.content
                            });
                        }

                        // Add image attachments
                        attachments.forEach((attachment: { type: string; url: string }) => {
                            if (attachment.type.startsWith('image/')) {
                                content.push({
                                    type: "image_url",
                                    image_url: {
                                        url: attachment.url
                                    }
                                });
                            }
                        });

                        apiMessages.push({
                            role: m.role,
                            content
                        });
                    } else {
                        // Standard text-only message
                        apiMessages.push({
                            role: m.role,
                            content: m.content,
                        });
                    }
                });

                // Low-latency path: if client already has a just-sent user message
                // that may not be persisted yet, append it so the model sees latest input.
                if (pendingUserMessage?.content?.trim()) {
                    const lastMsg = apiMessages[apiMessages.length - 1];
                    const pendingText = pendingUserMessage.content.trim();
                    const isDuplicateLastUser =
                        lastMsg?.role === "user" &&
                        typeof lastMsg.content === "string" &&
                        lastMsg.content.trim() === pendingText;

                    if (!isDuplicateLastUser) {
                        const pendingAttachments = pendingUserMessage.attachments || [];
                        if (pendingAttachments.length > 0) {
                            const pendingContent: any[] = [{ type: "text", text: pendingText }];
                            pendingAttachments.forEach((attachment) => {
                                if (attachment?.type?.startsWith("image/") && attachment.url) {
                                    pendingContent.push({
                                        type: "image_url",
                                        image_url: { url: attachment.url },
                                    });
                                }
                            });
                            apiMessages.push({ role: "user", content: pendingContent });
                        } else {
                            apiMessages.push({ role: "user", content: pendingText });
                        }
                    }
                }
                
                const requestBody = {
                    model: selectedModel,
                    system: systemPrompt,
                    messages: apiMessages,
                    stream: true,
                    include_reasoning: true,
                    streamOptions: {
                        includeUsage: true,
                    },
                };
                
                const response = await fetch(
                    "https://openrouter.ai/api/v1/chat/completions",
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                            "HTTP-Referer": SITE_URL,
                            "X-Title": SITE_NAME,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(requestBody),
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("OpenRouter API error:", errorText);
                    controller.enqueue(encoder.encode(`Error: ${errorText}`));
                    controller.close();
                    return;
                }

                if (!response.body) {
                    controller.close();
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantMessageContent = "";
                let buffer = "";
                let isReasoning = false;
                let usageData: any = null;
                const startTime = Date.now();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        if (isReasoning) {
                            const closeThink = "</think>";
                            assistantMessageContent += closeThink;
                            controller.enqueue(encoder.encode(closeThink));
                        }
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    buffer += chunk;

                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.trim() === "") continue;
                        if (line.trim() === "data: [DONE]") continue;
                        if (!line.startsWith("data: ")) continue;

                        const data = line.slice(6);
                        try {
                            const json = JSON.parse(data);
                            
                            // Check for usage data (appears in final chunk)
                            if (json.usage) {
                                usageData = json.usage;
                            }

                            const delta = json.choices[0]?.delta;
                            const content = delta?.content || "";
                            const reasoning = delta?.reasoning || "";

                            if (reasoning) {
                                if (!isReasoning) {
                                    const startThink = "<think>";
                                    assistantMessageContent += startThink;
                                    controller.enqueue(encoder.encode(startThink));
                                    isReasoning = true;
                                }
                                assistantMessageContent += reasoning;
                                controller.enqueue(encoder.encode(reasoning));
                            }

                            if (content) {
                                if (isReasoning) {
                                    const closeThink = "</think>";
                                    assistantMessageContent += closeThink;
                                    controller.enqueue(encoder.encode(closeThink));
                                    isReasoning = false;
                                }
                                assistantMessageContent += content;
                                controller.enqueue(encoder.encode(content));
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk:", e);
                        }
                    }
                }

                // Save the complete assistant message to the database
                const now = Date.now();
                const messageId = nanoid();
                const latency = usageData?.latency || (now - startTime);

                try {
                    await db.query(
                        'INSERT INTO message (id, "chatId", role, content, model, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
                        [messageId, chatId, "assistant", assistantMessageContent, selectedModel, now]
                    );

                    // Update chat timestamp
                    await db.query(
                        'UPDATE chat SET "updatedAt" = $1 WHERE id = $2',
                        [now, chatId]
                    );

                    // Invalidate chat cache (new message added)
                    invalidateChat(chatId).catch((error) => {
                        console.error("Failed to invalidate chat cache:", error);
                    });

                    // Extract and save semantic memory facts (async, non-blocking)
                    // Optimized: Use index on (chatId, role, createdAt) for efficient query
                    const recentUserMessagesResult = await db.query(
                        'SELECT role, content, attachments, "createdAt" FROM message WHERE "chatId" = $1 AND role = $2 ORDER BY "createdAt" DESC LIMIT 10',
                        [chatId, "user"]
                    );
                    // Convert createdAt from string (PostgreSQL bigint) to number
                    const recentUserMessages = recentUserMessagesResult.rows.map((msg: any) => ({
                        ...msg,
                        createdAt: typeof msg.createdAt === 'string' ? parseInt(msg.createdAt, 10) : (msg.createdAt || Date.now()),
                    })) as Array<{ role: string; content: string; attachments: string | null; createdAt: number }>;
                    
                    if (recentUserMessages.length > 0) {
                        // Reverse to get chronological order
                        const messagesForExtraction = recentUserMessages.reverse().map(m => ({
                            role: m.role,
                            content: m.content,
                            createdAt: m.createdAt,
                            attachments: m.attachments
                        }));
                        
                        // Extract facts asynchronously
                        extractFacts(messagesForExtraction, userFacts)
                            .then(async ({ facts, scores }) => {
                                // Filter facts by score threshold
                                const factsToSave: Record<string, any> = {};
                                const scoresToSave: Record<string, number> = {};
                                
                                for (const [key, value] of Object.entries(facts)) {
                                    const score = scores[key] ?? 0;
                                    if (shouldSaveFact(key, score, DEFAULT_MEMORY_SCORE_THRESHOLD)) {
                                        factsToSave[key] = value;
                                        scoresToSave[key] = score;
                                    }
                                }
                                
                                // Only update if we have facts to save
                                if (Object.keys(factsToSave).length > 0) {
                                    // Merge with existing facts
                                    const existingFacts = userFacts || {};
                                    const merged = mergeFacts(existingFacts, factsToSave, scoresToSave);
                                    
                                    // Update database
                                    await updateUserSemanticMemory(userId, merged.facts);
                                    
                                    console.log(`[Semantic Memory] Saved ${Object.keys(factsToSave).length} facts for user ${userId}`, factsToSave);
                                }
                            })
                            .catch((error) => {
                                console.error("Failed to extract/save semantic memory:", error);
                                // Don't fail the request if fact extraction fails
                            });
                    }

                    // Update rolling summary if needed (after assistant response is saved)
                    // Optimized: Check message count efficiently using LIMIT instead of COUNT
                    // This avoids a full table scan when we only need to know if threshold is met
                    const messageCountCheckResult = await db.query(
                        'SELECT id FROM message WHERE "chatId" = $1 ORDER BY "createdAt" DESC LIMIT $2',
                        [chatId, ROLLING_SUMMARY_MIN_MESSAGES]
                    );
                    const hasEnoughMessages = messageCountCheckResult.rows.length >= ROLLING_SUMMARY_MIN_MESSAGES;
                    
                    if (hasEnoughMessages) {
                        // Get older messages that should be summarized
                        const olderMessages = await getOlderMessages(chatId, ROLLING_SUMMARY_KEEP_RECENT);
                        
                        if (olderMessages.length > 0) {
                            // Get current summary
                            const currentChatResult = await db.query(
                                'SELECT summary FROM chat WHERE id = $1',
                                [chatId]
                            );
                            const currentChat = currentChatResult.rows[0] as { summary: string | null } | undefined;
                            
                            const currentSummary = currentChat?.summary || null;
                            
                            // Generate or update summary asynchronously (don't block the response)
                            generateSummary(olderMessages, currentSummary)
                                .then(async (newSummary) => {
                                    await updateSummary(chatId, newSummary);
                                    // Invalidate summary cache
                                    await invalidateChatSummary(chatId);
                                    console.log(`[Rolling Summary] Updated summary for chat ${chatId}`);
                                })
                                .catch((error) => {
                                    console.error("Failed to update rolling summary:", error);
                                    // Don't fail the request if summary update fails
                                });
                        }
                    }

                    // Record token usage if available
                    if (usageData) {
                        try {
                            const promptTokens = usageData.prompt_tokens || 0;
                            const completionTokens = usageData.completion_tokens || 0;
                            const totalTokens = usageData.total_tokens || (promptTokens + completionTokens);
                            const cachedTokens = usageData.cached_tokens || 0;
                            const reasoningTokens = usageData.native_tokens_reasoning || 0;
                            
                            // Calculate cost from usage data or use provided cost
                            let cost = calculateCostFromUsage(usageData);
                            if (cost === 0 && usageData.total_cost !== undefined) {
                                cost = usageData.total_cost;
                            }

                            await recordTokenUsage({
                                messageId,
                                chatId,
                                userId,
                                model: selectedModel,
                                provider: "openrouter",
                                promptTokens,
                                completionTokens,
                                totalTokens,
                                cachedTokens: cachedTokens > 0 ? cachedTokens : undefined,
                                reasoningTokens: reasoningTokens > 0 ? reasoningTokens : undefined,
                                cost,
                                latency: latency > 0 ? latency : undefined,
                            }, OPENROUTER_API_KEY);
                        } catch (tokenError) {
                            console.error("Failed to record token usage:", tokenError);
                            // Don't fail the request if token tracking fails
                        }
                    }
                } catch (dbError) {
                    console.error("Failed to save assistant message:", dbError);
                    // We don't fail the stream here because the user already saw the response, 
                    // but strictly speaking we should probably alert or retry.
                }

                controller.close();
            } catch (error) {
                console.error("Stream error:", error);
                controller.error(error);
            }
        },
    });

    return new NextResponse(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}
