import { db } from "@/lib/db";
import type { TokenStats, TimeSeriesPoint, ModelStats } from "./types";

/**
 * Aggregate token usage by user
 */
export function aggregateByUser(userId: string, startDate?: number, endDate?: number): TokenStats {
    let query = `
        SELECT 
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
    `;

    const params: any[] = [userId];

    if (startDate) {
        query += " AND createdAt >= ?";
        params.push(startDate);
    }

    if (endDate) {
        query += " AND createdAt <= ?";
        params.push(endDate);
    }

    const result = db.prepare(query).get(...params) as {
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalCachedTokens: number;
        totalReasoningTokens: number;
        totalCost: number;
        averageLatency: number | null;
        requestCount: number;
    };

    const requestCount = result.requestCount || 0;

    return {
        totalPromptTokens: result.totalPromptTokens || 0,
        totalCompletionTokens: result.totalCompletionTokens || 0,
        totalTokens: result.totalTokens || 0,
        totalCachedTokens: result.totalCachedTokens || 0,
        totalReasoningTokens: result.totalReasoningTokens || 0,
        totalCost: result.totalCost || 0,
        averageLatency: result.averageLatency ? Math.round(result.averageLatency) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (result.totalTokens || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (result.totalCost || 0) / requestCount : 0,
    };
}

/**
 * Aggregate token usage by chat
 */
export function aggregateByChat(chatId: string, startDate?: number, endDate?: number): TokenStats {
    let query = `
        SELECT 
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
    `;

    const params: any[] = [chatId];

    if (startDate) {
        query += " AND createdAt >= ?";
        params.push(startDate);
    }

    if (endDate) {
        query += " AND createdAt <= ?";
        params.push(endDate);
    }

    const result = db.prepare(query).get(...params) as {
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalCachedTokens: number;
        totalReasoningTokens: number;
        totalCost: number;
        averageLatency: number | null;
        requestCount: number;
    };

    const requestCount = result.requestCount || 0;

    return {
        totalPromptTokens: result.totalPromptTokens || 0,
        totalCompletionTokens: result.totalCompletionTokens || 0,
        totalTokens: result.totalTokens || 0,
        totalCachedTokens: result.totalCachedTokens || 0,
        totalReasoningTokens: result.totalReasoningTokens || 0,
        totalCost: result.totalCost || 0,
        averageLatency: result.averageLatency ? Math.round(result.averageLatency) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (result.totalTokens || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (result.totalCost || 0) / requestCount : 0,
    };
}

/**
 * Aggregate token usage by model
 */
export function aggregateByModel(model: string, startDate?: number, endDate?: number): TokenStats {
    let query = `
        SELECT 
            SUM(promptTokens) as totalPromptTokens,
            SUM(completionTokens) as totalCompletionTokens,
            SUM(totalTokens) as totalTokens,
            SUM(COALESCE(cachedTokens, 0)) as totalCachedTokens,
            SUM(COALESCE(reasoningTokens, 0)) as totalReasoningTokens,
            SUM(cost) as totalCost,
            AVG(latency) as averageLatency,
            COUNT(*) as requestCount
        FROM token_usage
        WHERE model = ?
    `;

    const params: any[] = [model];

    if (startDate) {
        query += " AND createdAt >= ?";
        params.push(startDate);
    }

    if (endDate) {
        query += " AND createdAt <= ?";
        params.push(endDate);
    }

    const result = db.prepare(query).get(...params) as {
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalCachedTokens: number;
        totalReasoningTokens: number;
        totalCost: number;
        averageLatency: number | null;
        requestCount: number;
    };

    const requestCount = result.requestCount || 0;

    return {
        totalPromptTokens: result.totalPromptTokens || 0,
        totalCompletionTokens: result.totalCompletionTokens || 0,
        totalTokens: result.totalTokens || 0,
        totalCachedTokens: result.totalCachedTokens || 0,
        totalReasoningTokens: result.totalReasoningTokens || 0,
        totalCost: result.totalCost || 0,
        averageLatency: result.averageLatency ? Math.round(result.averageLatency) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (result.totalTokens || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (result.totalCost || 0) / requestCount : 0,
    };
}

/**
 * Get time series data for a given scope
 */
export function aggregateByTimePeriod(
    scope: "user" | "chat" | "model",
    id: string,
    period: "day" | "week" | "month",
    startDate?: number,
    endDate?: number
): TimeSeriesPoint[] {
    let dateFormat: string;
    let dateGroupBy: string;

    switch (period) {
        case "day":
            dateFormat = "datetime(createdAt / 1000, 'unixepoch', 'localtime')";
            dateGroupBy = "date(createdAt / 1000, 'unixepoch', 'localtime')";
            break;
        case "week":
            dateFormat = "strftime('%Y-W%W', datetime(createdAt / 1000, 'unixepoch', 'localtime'))";
            dateGroupBy = "strftime('%Y-W%W', datetime(createdAt / 1000, 'unixepoch', 'localtime'))";
            break;
        case "month":
            dateFormat = "strftime('%Y-%m', datetime(createdAt / 1000, 'unixepoch', 'localtime'))";
            dateGroupBy = "strftime('%Y-%m', datetime(createdAt / 1000, 'unixepoch', 'localtime'))";
            break;
        default:
            dateFormat = "date(createdAt / 1000, 'unixepoch', 'localtime')";
            dateGroupBy = "date(createdAt / 1000, 'unixepoch', 'localtime')";
    }

    let whereClause = "";
    const params: any[] = [];

    switch (scope) {
        case "user":
            whereClause = "WHERE userId = ?";
            params.push(id);
            break;
        case "chat":
            whereClause = "WHERE chatId = ?";
            params.push(id);
            break;
        case "model":
            whereClause = "WHERE model = ?";
            params.push(id);
            break;
    }

    if (startDate) {
        whereClause += " AND createdAt >= ?";
        params.push(startDate);
    }

    if (endDate) {
        whereClause += " AND createdAt <= ?";
        params.push(endDate);
    }

    const query = `
        SELECT 
            ${dateGroupBy} as dateGroup,
            ${dateFormat} as dateLabel,
            MIN(createdAt) as timestamp,
            SUM(totalTokens) as tokens,
            SUM(cost) as cost,
            COUNT(*) as requestCount
        FROM token_usage
        ${whereClause}
        GROUP BY ${dateGroupBy}
        ORDER BY timestamp ASC
    `;

    const results = db.prepare(query).all(...params) as Array<{
        dateGroup: string;
        dateLabel: string;
        timestamp: number;
        tokens: number;
        cost: number;
        requestCount: number;
    }>;

    return results.map((r) => ({
        timestamp: r.timestamp,
        date: r.dateLabel,
        tokens: r.tokens || 0,
        cost: r.cost || 0,
        requestCount: r.requestCount || 0,
    }));
}

/**
 * Get all models with their aggregated statistics
 */
export function getAllModelStats(startDate?: number, endDate?: number): ModelStats[] {
    let query = `
        SELECT 
            model,
            provider,
            SUM(promptTokens) as totalPromptTokens,
            SUM(completionTokens) as totalCompletionTokens,
            SUM(totalTokens) as totalTokens,
            SUM(COALESCE(cachedTokens, 0)) as totalCachedTokens,
            SUM(COALESCE(reasoningTokens, 0)) as totalReasoningTokens,
            SUM(cost) as totalCost,
            AVG(latency) as averageLatency,
            COUNT(*) as requestCount
        FROM token_usage
    `;

    const params: any[] = [];

    if (startDate || endDate) {
        const conditions: string[] = [];
        if (startDate) {
            conditions.push("createdAt >= ?");
            params.push(startDate);
        }
        if (endDate) {
            conditions.push("createdAt <= ?");
            params.push(endDate);
        }
        query += " WHERE " + conditions.join(" AND ");
    }

    query += `
        GROUP BY model, provider
        ORDER BY requestCount DESC
    `;

    const results = db.prepare(query).all(...params) as Array<{
        model: string;
        provider: string;
        totalPromptTokens: number;
        totalCompletionTokens: number;
        totalTokens: number;
        totalCachedTokens: number;
        totalReasoningTokens: number;
        totalCost: number;
        averageLatency: number | null;
        requestCount: number;
    }>;

    return results.map((r) => {
        const requestCount = r.requestCount || 0;
        return {
            model: r.model,
            provider: r.provider,
            totalPromptTokens: r.totalPromptTokens || 0,
            totalCompletionTokens: r.totalCompletionTokens || 0,
            totalTokens: r.totalTokens || 0,
            totalCachedTokens: r.totalCachedTokens || 0,
            totalReasoningTokens: r.totalReasoningTokens || 0,
            totalCost: r.totalCost || 0,
            averageLatency: r.averageLatency ? Math.round(r.averageLatency) : undefined,
            requestCount,
            usageFrequency: requestCount,
            averageTokensPerRequest: requestCount > 0 ? (r.totalTokens || 0) / requestCount : 0,
            averageCostPerRequest: requestCount > 0 ? (r.totalCost || 0) / requestCount : 0,
        };
    });
}
