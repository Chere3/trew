import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import type {
    TokenUsage,
    TokenUsageInput,
    TokenStats,
    MessageStats,
    ChatStats,
    UserStats,
    ModelStats,
    TimeSeriesPoint,
} from "./types";
import {
    aggregateByUser,
    aggregateByChat,
    aggregateByModel,
    aggregateByTimePeriod,
    getAllModelStats,
} from "./aggregators";
import { calculateMessageCost, getModelPricing } from "./cost-calculator";
import { getCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { invalidateChatStats, invalidateUserStats, invalidateMessageStats } from "@/lib/cache/strategies";

/**
 * Record token usage for a message
 */
export async function recordTokenUsage(
    input: TokenUsageInput,
    openRouterApiKey?: string
): Promise<TokenUsage> {
    // If cost is 0 or not provided, try to calculate it
    let cost = input.cost;
    if (cost === 0 || cost === undefined) {
        const pricing = await getModelPricing(input.model, openRouterApiKey);
        if (pricing) {
            cost = calculateMessageCost(
                {
                    promptTokens: input.promptTokens,
                    completionTokens: input.completionTokens,
                    cachedTokens: input.cachedTokens,
                },
                pricing
            );
        }
    }

    const id = nanoid();
    const now = Date.now();

    const usage: TokenUsage = {
        id,
        messageId: input.messageId,
        chatId: input.chatId,
        userId: input.userId,
        model: input.model,
        provider: input.provider,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
        totalTokens: input.totalTokens,
        cachedTokens: input.cachedTokens,
        reasoningTokens: input.reasoningTokens,
        cost,
        latency: input.latency,
        createdAt: now,
    };

    try {
        await db.query(`
            INSERT INTO token_usage (
                id, "messageId", "chatId", "userId", model, provider,
                "promptTokens", "completionTokens", "totalTokens",
                "cachedTokens", "reasoningTokens", cost, latency, "createdAt"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
            usage.id,
            usage.messageId,
            usage.chatId,
            usage.userId,
            usage.model,
            usage.provider,
            usage.promptTokens,
            usage.completionTokens,
            usage.totalTokens,
            usage.cachedTokens ?? null,
            usage.reasoningTokens ?? null,
            usage.cost,
            usage.latency ?? null,
            usage.createdAt
        ]);

        // Invalidate related stats caches
        invalidateChatStats(usage.chatId).catch((error) => {
            console.error("Failed to invalidate chat stats cache:", error);
        });
        invalidateUserStats(usage.userId).catch((error) => {
            console.error("Failed to invalidate user stats cache:", error);
        });
        invalidateMessageStats(usage.messageId).catch((error) => {
            console.error("Failed to invalidate message stats cache:", error);
        });

        return usage;
    } catch (error) {
        console.error("Failed to record token usage:", error);
        throw error;
    }
}

/**
 * Get statistics for a specific message (with caching)
 */
export async function getMessageStats(messageId: string): Promise<MessageStats | null> {
    const cacheKey = CACHE_KEYS.STATS_MESSAGE(messageId);
    
    return getCached(
        cacheKey,
        async () => {
            const result = await db.query(
                'SELECT * FROM token_usage WHERE "messageId" = $1',
                [messageId]
            );
            const usage = result.rows[0] as TokenUsage | undefined;

            if (!usage) {
                return null;
            }

            return {
                messageId: usage.messageId,
                chatId: usage.chatId,
                userId: usage.userId,
                model: usage.model,
                provider: usage.provider,
                promptTokens: usage.promptTokens,
                completionTokens: usage.completionTokens,
                totalTokens: usage.totalTokens,
                cachedTokens: usage.cachedTokens,
                reasoningTokens: usage.reasoningTokens,
                cost: usage.cost,
                latency: usage.latency,
                createdAt: usage.createdAt,
            };
        },
        CACHE_TTL.STATS
    );
}

/**
 * Get aggregated statistics for a chat (with caching)
 */
export async function getChatStats(
    chatId: string,
    startDate?: number,
    endDate?: number
): Promise<ChatStats | null> {
    const cacheKey = CACHE_KEYS.STATS_CHAT(chatId, startDate, endDate);
    
    return getCached(
        cacheKey,
        async () => {
            // Verify chat exists
            const chatResult = await db.query('SELECT id FROM chat WHERE id = $1', [chatId]);
            if (chatResult.rows.length === 0) {
                return null;
            }

            const stats = await aggregateByChat(chatId, startDate, endDate);

            // Get model breakdown
            let modelQuery = `
                SELECT 
                    model,
                    SUM("promptTokens") as "totalPromptTokens",
                    SUM("completionTokens") as "totalCompletionTokens",
                    SUM("totalTokens") as "totalTokens",
                    SUM(COALESCE("cachedTokens", 0)) as "totalCachedTokens",
                    SUM(COALESCE("reasoningTokens", 0)) as "totalReasoningTokens",
                    SUM(cost) as "totalCost",
                    AVG(latency) as "averageLatency",
                    COUNT(*) as "requestCount"
                FROM token_usage
                WHERE "chatId" = $1
            `;
            const modelParams: any[] = [chatId];
            if (startDate) {
                modelQuery += " AND \"createdAt\" >= $" + (modelParams.length + 1);
                modelParams.push(startDate);
            }
            if (endDate) {
                modelQuery += " AND \"createdAt\" <= $" + (modelParams.length + 1);
                modelParams.push(endDate);
            }
            modelQuery += " GROUP BY model";
            
            const modelBreakdownResult = await db.query(modelQuery, modelParams);
            const modelBreakdown = modelBreakdownResult.rows as Array<{
                model: string;
                totalPromptTokens: number;
                totalCompletionTokens: number;
                totalTokens: number;
                totalCachedTokens: number;
                totalReasoningTokens: number;
                totalCost: number;
                averageLatency: number | null;
                requestCount: number;
            }>;

            const modelBreakdownStats = modelBreakdown.map((m) => {
                const requestCount = m.requestCount || 0;
                return {
                    model: m.model,
                    usage: {
                        totalPromptTokens: m.totalPromptTokens || 0,
                        totalCompletionTokens: m.totalCompletionTokens || 0,
                        totalTokens: m.totalTokens || 0,
                        totalCachedTokens: m.totalCachedTokens || 0,
                        totalReasoningTokens: m.totalReasoningTokens || 0,
                        totalCost: m.totalCost || 0,
                        averageLatency: m.averageLatency ? Math.round(m.averageLatency) : undefined,
                        requestCount,
                        averageTokensPerRequest: requestCount > 0 ? (m.totalTokens || 0) / requestCount : 0,
                        averageCostPerRequest: requestCount > 0 ? (m.totalCost || 0) / requestCount : 0,
                    },
                };
            });

            // Get message count
            const messageCountResult = await db.query(
                'SELECT COUNT(*) as count FROM message WHERE "chatId" = $1',
                [chatId]
            );
            const messageCount = parseInt(messageCountResult.rows[0].count) || 0;

            // Get time series data
            const timeSeries = await aggregateByTimePeriod("chat", chatId, "day", startDate, endDate);

            return {
                chatId,
                messageCount,
                modelBreakdown: modelBreakdownStats,
                timeSeries,
                ...stats,
            };
        },
        CACHE_TTL.STATS
    );
}

/**
 * Get aggregated statistics for a user (with caching)
 */
export async function getUserStats(
    userId: string,
    startDate?: number,
    endDate?: number
): Promise<UserStats | null> {
    const cacheKey = CACHE_KEYS.STATS_USER(userId, startDate, endDate);
    
    return getCached(
        cacheKey,
        async () => {
            // Verify user exists (basic check)
            const userResult = await db.query('SELECT id FROM "user" WHERE id = $1', [userId]);
            if (userResult.rows.length === 0) {
                return null;
            }

            const stats = await aggregateByUser(userId, startDate, endDate);

            // Get model breakdown
            let modelQuery = `
                SELECT 
                    model,
                    SUM("promptTokens") as "totalPromptTokens",
                    SUM("completionTokens") as "totalCompletionTokens",
                    SUM("totalTokens") as "totalTokens",
                    SUM(COALESCE("cachedTokens", 0)) as "totalCachedTokens",
                    SUM(COALESCE("reasoningTokens", 0)) as "totalReasoningTokens",
                    SUM(cost) as "totalCost",
                    AVG(latency) as "averageLatency",
                    COUNT(*) as "requestCount"
                FROM token_usage
                WHERE "userId" = $1
            `;
            const modelParams: any[] = [userId];
            if (startDate) {
                modelQuery += ` AND "createdAt" >= $${modelParams.length + 1}`;
                modelParams.push(startDate);
            }
            if (endDate) {
                modelQuery += ` AND "createdAt" <= $${modelParams.length + 1}`;
                modelParams.push(endDate);
            }
            modelQuery += ` GROUP BY model ORDER BY "requestCount" DESC`;

            const modelBreakdownResult = await db.query(modelQuery, modelParams);
            const modelBreakdown = modelBreakdownResult.rows as Array<{
                model: string;
                totalPromptTokens: string;
                totalCompletionTokens: string;
                totalTokens: string;
                totalCachedTokens: string;
                totalReasoningTokens: string;
                totalCost: string;
                averageLatency: string | null;
                requestCount: string;
            }>;

            const modelBreakdownStats = modelBreakdown.map((m) => {
                const requestCount = parseInt(m.requestCount) || 0;
                return {
                    model: m.model,
                    usage: {
                        totalPromptTokens: parseInt(m.totalPromptTokens) || 0,
                        totalCompletionTokens: parseInt(m.totalCompletionTokens) || 0,
                        totalTokens: parseInt(m.totalTokens) || 0,
                        totalCachedTokens: parseInt(m.totalCachedTokens) || 0,
                        totalReasoningTokens: parseInt(m.totalReasoningTokens) || 0,
                        totalCost: parseFloat(m.totalCost) || 0,
                        averageLatency: m.averageLatency ? Math.round(parseFloat(m.averageLatency)) : undefined,
                        requestCount,
                        averageTokensPerRequest: requestCount > 0 ? (parseInt(m.totalTokens) || 0) / requestCount : 0,
                        averageCostPerRequest: requestCount > 0 ? (parseFloat(m.totalCost) || 0) / requestCount : 0,
                    },
                };
            });

            // Get chat count
            const chatCountResult = await db.query(
                'SELECT COUNT(DISTINCT "chatId") as count FROM token_usage WHERE "userId" = $1',
                [userId]
            );
            const chatCount = parseInt(chatCountResult.rows[0].count) || 0;

            return {
                userId,
                chatCount,
                modelBreakdown: modelBreakdownStats,
                ...stats,
            };
        },
        CACHE_TTL.STATS
    );
}

/**
 * Get aggregated statistics for a model (with caching)
 */
export async function getModelStats(
    model: string,
    startDate?: number,
    endDate?: number
): Promise<ModelStats | null> {
    const cacheKey = CACHE_KEYS.STATS_MODEL(model, startDate, endDate);
    
    return getCached(
        cacheKey,
        async () => {
            const stats = await aggregateByModel(model, startDate, endDate);

            if (stats.requestCount === 0) {
                return null;
            }

            // Get provider from first usage record
            const firstUsageResult = await db.query(
                'SELECT provider FROM token_usage WHERE model = $1 LIMIT 1',
                [model]
            );
            const firstUsage = firstUsageResult.rows[0] as { provider: string } | undefined;

            return {
                model,
                provider: firstUsage?.provider || "unknown",
                usageFrequency: stats.requestCount,
                ...stats,
            };
        },
        CACHE_TTL.STATS
    );
}

/**
 * Get time series statistics
 */
export async function getTimeSeriesStats(
    scope: "user" | "chat" | "model",
    id: string,
    period: "day" | "week" | "month" = "day",
    startDate?: number,
    endDate?: number
): Promise<TimeSeriesPoint[]> {
    return aggregateByTimePeriod(scope, id, period, startDate, endDate);
}

/**
 * Get all model statistics
 */
export async function getAllModelsStats(
    startDate?: number,
    endDate?: number
): Promise<ModelStats[]> {
    return getAllModelStats(startDate, endDate);
}
