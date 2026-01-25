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
        db.prepare(`
            INSERT INTO token_usage (
                id, messageId, chatId, userId, model, provider,
                promptTokens, completionTokens, totalTokens,
                cachedTokens, reasoningTokens, cost, latency, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
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
        );

        return usage;
    } catch (error) {
        console.error("Failed to record token usage:", error);
        throw error;
    }
}

/**
 * Get statistics for a specific message
 */
export function getMessageStats(messageId: string): MessageStats | null {
    const usage = db
        .prepare("SELECT * FROM token_usage WHERE messageId = ?")
        .get(messageId) as TokenUsage | undefined;

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
}

/**
 * Get aggregated statistics for a chat
 */
export function getChatStats(
    chatId: string,
    startDate?: number,
    endDate?: number
): ChatStats | null {
    // Verify chat exists
    const chat = db.prepare("SELECT id FROM chat WHERE id = ?").get(chatId);
    if (!chat) {
        return null;
    }

    const stats = aggregateByChat(chatId, startDate, endDate);

    // Get model breakdown
    const modelBreakdown = db
        .prepare(`
            SELECT 
                model,
                SUM(promptTokens) as totalPromptTokens,
                SUM(completionTokens) as totalCompletionTokens,
                SUM(totalTokens) as totalTokens,
                SUM(COALESCE(cachedTokens, 0)) as totalCachedTokens,
                SUM(COALESCE(reasoningTokens, 0)) as totalReasoningTokens,
                SUM(cost) as totalCost,
                AVG(latency) as averageLatency,
                COUNT(*) as requestCount
            FROM token_usage
            WHERE chatId = ?
            ${startDate ? "AND createdAt >= ?" : ""}
            ${endDate ? "AND createdAt <= ?" : ""}
            GROUP BY model
        `)
        .all(
            ...(startDate && endDate
                ? [chatId, startDate, endDate]
                : startDate
                  ? [chatId, startDate]
                  : endDate
                    ? [chatId, endDate]
                    : [chatId])
        ) as Array<{
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
    const messageCount = (db
        .prepare("SELECT COUNT(*) as count FROM message WHERE chatId = ?")
        .get(chatId) as { count: number }).count || 0;

    // Get time series data
    const timeSeries = aggregateByTimePeriod("chat", chatId, "day", startDate, endDate);

    return {
        chatId,
        messageCount,
        modelBreakdown: modelBreakdownStats,
        timeSeries,
        ...stats,
    };
}

/**
 * Get aggregated statistics for a user
 */
export function getUserStats(
    userId: string,
    startDate?: number,
    endDate?: number
): UserStats | null {
    // Verify user exists (basic check)
    const user = db.prepare("SELECT id FROM user WHERE id = ?").get(userId);
    if (!user) {
        return null;
    }

    const stats = aggregateByUser(userId, startDate, endDate);

    // Get model breakdown
    const modelBreakdown = db
        .prepare(`
            SELECT 
                model,
                SUM(promptTokens) as totalPromptTokens,
                SUM(completionTokens) as totalCompletionTokens,
                SUM(totalTokens) as totalTokens,
                SUM(COALESCE(cachedTokens, 0)) as totalCachedTokens,
                SUM(COALESCE(reasoningTokens, 0)) as totalReasoningTokens,
                SUM(cost) as totalCost,
                AVG(latency) as averageLatency,
                COUNT(*) as requestCount
            FROM token_usage
            WHERE userId = ?
            ${startDate ? "AND createdAt >= ?" : ""}
            ${endDate ? "AND createdAt <= ?" : ""}
            GROUP BY model
            ORDER BY requestCount DESC
        `)
        .all(
            ...(startDate && endDate
                ? [userId, startDate, endDate]
                : startDate
                  ? [userId, startDate]
                  : endDate
                    ? [userId, endDate]
                    : [userId])
        ) as Array<{
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

    // Get chat count
    const chatCount = (db
        .prepare("SELECT COUNT(DISTINCT chatId) as count FROM token_usage WHERE userId = ?")
        .get(userId) as { count: number }).count || 0;

    return {
        userId,
        chatCount,
        modelBreakdown: modelBreakdownStats,
        ...stats,
    };
}

/**
 * Get aggregated statistics for a model
 */
export function getModelStats(
    model: string,
    startDate?: number,
    endDate?: number
): ModelStats | null {
    const stats = aggregateByModel(model, startDate, endDate);

    if (stats.requestCount === 0) {
        return null;
    }

    // Get provider from first usage record
    const firstUsage = db
        .prepare("SELECT provider FROM token_usage WHERE model = ? LIMIT 1")
        .get(model) as { provider: string } | undefined;

    return {
        model,
        provider: firstUsage?.provider || "unknown",
        usageFrequency: stats.requestCount,
        ...stats,
    };
}

/**
 * Get time series statistics
 */
export function getTimeSeriesStats(
    scope: "user" | "chat" | "model",
    id: string,
    period: "day" | "week" | "month" = "day",
    startDate?: number,
    endDate?: number
): TimeSeriesPoint[] {
    return aggregateByTimePeriod(scope, id, period, startDate, endDate);
}

/**
 * Get all model statistics
 */
export function getAllModelsStats(
    startDate?: number,
    endDate?: number
): ModelStats[] {
    return getAllModelStats(startDate, endDate);
}
