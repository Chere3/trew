import { db } from "@/lib/db";
import type { TokenStats, TimeSeriesPoint, ModelStats } from "./types";

/**
 * Aggregate token usage by user
 */
export async function aggregateByUser(userId: string, startDate?: number, endDate?: number): Promise<TokenStats> {
    let query = `
        SELECT 
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

    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
        query += ` AND "createdAt" >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        query += ` AND "createdAt" <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
        // Return zero values if no data
        return {
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            totalCachedTokens: 0,
            totalReasoningTokens: 0,
            totalCost: 0,
            averageLatency: undefined,
            requestCount: 0,
            averageTokensPerRequest: 0,
            averageCostPerRequest: 0,
        };
    }
    
    const row = result.rows[0] as {
        totalPromptTokens: string;
        totalCompletionTokens: string;
        totalTokens: string;
        totalCachedTokens: string;
        totalReasoningTokens: string;
        totalCost: string;
        averageLatency: string | null;
        requestCount: string;
    };

    const requestCount = parseInt(row.requestCount) || 0;

    return {
        totalPromptTokens: parseInt(row.totalPromptTokens) || 0,
        totalCompletionTokens: parseInt(row.totalCompletionTokens) || 0,
        totalTokens: parseInt(row.totalTokens) || 0,
        totalCachedTokens: parseInt(row.totalCachedTokens) || 0,
        totalReasoningTokens: parseInt(row.totalReasoningTokens) || 0,
        totalCost: parseFloat(row.totalCost) || 0,
        averageLatency: row.averageLatency ? Math.round(parseFloat(row.averageLatency)) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (parseInt(row.totalTokens) || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (parseFloat(row.totalCost) || 0) / requestCount : 0,
    };
}

/**
 * Aggregate token usage by chat
 */
export async function aggregateByChat(chatId: string, startDate?: number, endDate?: number): Promise<TokenStats> {
    let query = `
        SELECT 
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

    const params: any[] = [chatId];
    let paramIndex = 2;

    if (startDate) {
        query += ` AND "createdAt" >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        query += ` AND "createdAt" <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
        // Return zero values if no data
        return {
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            totalCachedTokens: 0,
            totalReasoningTokens: 0,
            totalCost: 0,
            averageLatency: undefined,
            requestCount: 0,
            averageTokensPerRequest: 0,
            averageCostPerRequest: 0,
        };
    }
    
    const row = result.rows[0] as {
        totalPromptTokens: string;
        totalCompletionTokens: string;
        totalTokens: string;
        totalCachedTokens: string;
        totalReasoningTokens: string;
        totalCost: string;
        averageLatency: string | null;
        requestCount: string;
    };

    const requestCount = parseInt(row.requestCount) || 0;

    return {
        totalPromptTokens: parseInt(row.totalPromptTokens) || 0,
        totalCompletionTokens: parseInt(row.totalCompletionTokens) || 0,
        totalTokens: parseInt(row.totalTokens) || 0,
        totalCachedTokens: parseInt(row.totalCachedTokens) || 0,
        totalReasoningTokens: parseInt(row.totalReasoningTokens) || 0,
        totalCost: parseFloat(row.totalCost) || 0,
        averageLatency: row.averageLatency ? Math.round(parseFloat(row.averageLatency)) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (parseInt(row.totalTokens) || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (parseFloat(row.totalCost) || 0) / requestCount : 0,
    };
}

/**
 * Aggregate token usage by model
 */
export async function aggregateByModel(model: string, startDate?: number, endDate?: number): Promise<TokenStats> {
    let query = `
        SELECT 
            SUM("promptTokens") as "totalPromptTokens",
            SUM("completionTokens") as "totalCompletionTokens",
            SUM("totalTokens") as "totalTokens",
            SUM(COALESCE("cachedTokens", 0)) as "totalCachedTokens",
            SUM(COALESCE("reasoningTokens", 0)) as "totalReasoningTokens",
            SUM(cost) as "totalCost",
            AVG(latency) as "averageLatency",
            COUNT(*) as "requestCount"
        FROM token_usage
        WHERE model = $1
    `;

    const params: any[] = [model];
    let paramIndex = 2;

    if (startDate) {
        query += ` AND "createdAt" >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        query += ` AND "createdAt" <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
        // Return zero values if no data
        return {
            totalPromptTokens: 0,
            totalCompletionTokens: 0,
            totalTokens: 0,
            totalCachedTokens: 0,
            totalReasoningTokens: 0,
            totalCost: 0,
            averageLatency: undefined,
            requestCount: 0,
            averageTokensPerRequest: 0,
            averageCostPerRequest: 0,
        };
    }
    
    const row = result.rows[0] as {
        totalPromptTokens: string;
        totalCompletionTokens: string;
        totalTokens: string;
        totalCachedTokens: string;
        totalReasoningTokens: string;
        totalCost: string;
        averageLatency: string | null;
        requestCount: string;
    };

    const requestCount = parseInt(row.requestCount) || 0;

    return {
        totalPromptTokens: parseInt(row.totalPromptTokens) || 0,
        totalCompletionTokens: parseInt(row.totalCompletionTokens) || 0,
        totalTokens: parseInt(row.totalTokens) || 0,
        totalCachedTokens: parseInt(row.totalCachedTokens) || 0,
        totalReasoningTokens: parseInt(row.totalReasoningTokens) || 0,
        totalCost: parseFloat(row.totalCost) || 0,
        averageLatency: row.averageLatency ? Math.round(parseFloat(row.averageLatency)) : undefined,
        requestCount,
        averageTokensPerRequest: requestCount > 0 ? (parseInt(row.totalTokens) || 0) / requestCount : 0,
        averageCostPerRequest: requestCount > 0 ? (parseFloat(row.totalCost) || 0) / requestCount : 0,
    };
}

/**
 * Get time series data for a given scope
 */
export async function aggregateByTimePeriod(
    scope: "user" | "chat" | "model",
    id: string,
    period: "day" | "week" | "month",
    startDate?: number,
    endDate?: number
): Promise<TimeSeriesPoint[]> {
    let dateFormat: string;
    let dateGroupBy: string;

    switch (period) {
        case "day":
            dateGroupBy = "DATE_TRUNC('day', TO_TIMESTAMP(\"createdAt\" / 1000))";
            dateFormat = "TO_CHAR(" + dateGroupBy + ", 'YYYY-MM-DD')";
            break;
        case "week":
            dateGroupBy = "DATE_TRUNC('week', TO_TIMESTAMP(\"createdAt\" / 1000))";
            dateFormat = "TO_CHAR(" + dateGroupBy + ", 'IYYY-IW')";
            break;
        case "month":
            dateGroupBy = "DATE_TRUNC('month', TO_TIMESTAMP(\"createdAt\" / 1000))";
            dateFormat = "TO_CHAR(" + dateGroupBy + ", 'YYYY-MM')";
            break;
        default:
            dateGroupBy = "DATE_TRUNC('day', TO_TIMESTAMP(\"createdAt\" / 1000))";
            dateFormat = "TO_CHAR(" + dateGroupBy + ", 'YYYY-MM-DD')";
    }

    let whereClause = "";
    const params: any[] = [];
    let paramIndex = 1;

    switch (scope) {
        case "user":
            whereClause = `WHERE "userId" = $${paramIndex}`;
            params.push(id);
            paramIndex++;
            break;
        case "chat":
            whereClause = `WHERE "chatId" = $${paramIndex}`;
            params.push(id);
            paramIndex++;
            break;
        case "model":
            whereClause = `WHERE model = $${paramIndex}`;
            params.push(id);
            paramIndex++;
            break;
    }

    if (startDate) {
        whereClause += ` AND "createdAt" >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
    }

    if (endDate) {
        whereClause += ` AND "createdAt" <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
    }

    const query = `
        SELECT 
            ${dateGroupBy} as "dateGroup",
            ${dateFormat} as "dateLabel",
            MIN("createdAt") as timestamp,
            SUM("totalTokens") as tokens,
            SUM(cost) as cost,
            COUNT(*) as "requestCount"
        FROM token_usage
        ${whereClause}
        GROUP BY ${dateGroupBy}
        ORDER BY timestamp ASC
    `;

    const result = await db.query(query, params);
    const results = result.rows as Array<{
        dateGroup: string;
        dateLabel: string;
        timestamp: string;
        tokens: string;
        cost: string;
        requestCount: string;
    }>;

    return results.map((r) => ({
        timestamp: typeof r.timestamp === 'string' ? parseInt(r.timestamp) : r.timestamp,
        date: r.dateLabel,
        tokens: typeof r.tokens === 'string' ? parseInt(r.tokens) || 0 : (r.tokens || 0),
        cost: typeof r.cost === 'string' ? parseFloat(r.cost) || 0 : (r.cost || 0),
        requestCount: typeof r.requestCount === 'string' ? parseInt(r.requestCount) || 0 : (r.requestCount || 0),
    }));
}

/**
 * Get all models with their aggregated statistics
 */
export async function getAllModelStats(startDate?: number, endDate?: number): Promise<ModelStats[]> {
    let query = `
        SELECT 
            model,
            provider,
            SUM("promptTokens") as "totalPromptTokens",
            SUM("completionTokens") as "totalCompletionTokens",
            SUM("totalTokens") as "totalTokens",
            SUM(COALESCE("cachedTokens", 0)) as "totalCachedTokens",
            SUM(COALESCE("reasoningTokens", 0)) as "totalReasoningTokens",
            SUM(cost) as "totalCost",
            AVG(latency) as "averageLatency",
            COUNT(*) as "requestCount"
        FROM token_usage
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (startDate || endDate) {
        const conditions: string[] = [];
        if (startDate) {
            conditions.push(`"createdAt" >= $${paramIndex}`);
            params.push(startDate);
            paramIndex++;
        }
        if (endDate) {
            conditions.push(`"createdAt" <= $${paramIndex}`);
            params.push(endDate);
            paramIndex++;
        }
        query += " WHERE " + conditions.join(" AND ");
    }

    query += `
        GROUP BY model, provider
        ORDER BY "requestCount" DESC
    `;

    const result = await db.query(query, params);
    const results = result.rows as Array<{
        model: string;
        provider: string;
        totalPromptTokens: string;
        totalCompletionTokens: string;
        totalTokens: string;
        totalCachedTokens: string;
        totalReasoningTokens: string;
        totalCost: string;
        averageLatency: string | null;
        requestCount: string;
    }>;

    return results.map((r) => {
        const requestCount = parseInt(r.requestCount) || 0;
        return {
            model: r.model,
            provider: r.provider,
            totalPromptTokens: parseInt(r.totalPromptTokens) || 0,
            totalCompletionTokens: parseInt(r.totalCompletionTokens) || 0,
            totalTokens: parseInt(r.totalTokens) || 0,
            totalCachedTokens: parseInt(r.totalCachedTokens) || 0,
            totalReasoningTokens: parseInt(r.totalReasoningTokens) || 0,
            totalCost: parseFloat(r.totalCost) || 0,
            averageLatency: r.averageLatency ? Math.round(parseFloat(r.averageLatency)) : undefined,
            requestCount,
            usageFrequency: requestCount,
            averageTokensPerRequest: requestCount > 0 ? (parseInt(r.totalTokens) || 0) / requestCount : 0,
            averageCostPerRequest: requestCount > 0 ? (parseFloat(r.totalCost) || 0) / requestCount : 0,
        };
    });
}
