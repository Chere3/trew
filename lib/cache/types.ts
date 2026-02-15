/**
 * Cache key patterns and TTL constants
 */

export const CACHE_KEYS = {
  // Chat-related
  CHAT_LIST: (userId: string, archived: boolean) => `chat:list:${userId}:${archived}`,
  CHAT_MESSAGES: (chatId: string, limit: number, before: number | null, after: number | null) => 
    `chat:messages:${chatId}:${limit}:${before ?? 'null'}:${after ?? 'null'}`,
  CHAT_META: (chatId: string) => `chat:meta:${chatId}`,
  CHAT_SUMMARY: (chatId: string) => `chat:summary:${chatId}`,
  
  // User-related
  USER_MEMORY: (userId: string) => `user:memory:${userId}`,
  
  // Statistics
  STATS_CHAT: (chatId: string, startDate?: number, endDate?: number) => 
    `stats:chat:${chatId}:${startDate ?? 'null'}:${endDate ?? 'null'}`,
  STATS_USER: (userId: string, startDate?: number, endDate?: number) => 
    `stats:user:${userId}:${startDate ?? 'null'}:${endDate ?? 'null'}`,
  STATS_MODEL: (model: string, startDate?: number, endDate?: number) => 
    `stats:model:${model}:${startDate ?? 'null'}:${endDate ?? 'null'}`,
  STATS_MESSAGE: (messageId: string) => `stats:message:${messageId}`,
} as const;

export const CACHE_TTL = {
  // Short TTL for frequently updated data
  CHAT_LIST: 60, // 60 seconds (increased from 30 to reduce cache misses)
  CHAT_MESSAGES: 60, // 60 seconds
  
  // Medium TTL for moderately updated data
  CHAT_META: 300, // 5 minutes
  STATS: 300, // 5 minutes
  
  // Long TTL for rarely updated data
  USER_MEMORY: 600, // 10 minutes
  CHAT_SUMMARY: 900, // 15 minutes
} as const;

export const CACHE_PATTERNS = {
  CHAT_LIST_USER: (userId: string) => `chat:list:${userId}:*`,
  CHAT_MESSAGES_CHAT: (chatId: string) => `chat:messages:${chatId}:*`,
  CHAT_META_CHAT: (chatId: string) => `chat:meta:${chatId}`,
  CHAT_SUMMARY_CHAT: (chatId: string) => `chat:summary:${chatId}`,
  STATS_CHAT: (chatId: string) => `stats:chat:${chatId}:*`,
  STATS_USER: (userId: string) => `stats:user:${userId}:*`,
} as const;
