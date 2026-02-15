import {
  getCached,
  invalidateCache,
  setCache,
  deleteCache,
} from "./redis";
import { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS } from "./types";

/**
 * Cache invalidation strategies for different operations
 */

/**
 * Invalidate all chat-related caches for a user
 */
export async function invalidateUserChats(userId: string): Promise<void> {
  await invalidateCache(
    [],
    [
      CACHE_PATTERNS.CHAT_LIST_USER(userId),
      CACHE_PATTERNS.STATS_USER(userId),
    ]
  );
}

/**
 * Invalidate all caches related to a specific chat
 */
export async function invalidateChat(chatId: string): Promise<void> {
  await invalidateCache(
    [
      CACHE_KEYS.CHAT_META(chatId),
      CACHE_KEYS.CHAT_SUMMARY(chatId),
    ],
    [
      CACHE_PATTERNS.CHAT_MESSAGES_CHAT(chatId),
      CACHE_PATTERNS.STATS_CHAT(chatId),
    ]
  );
}

/**
 * Invalidate chat list cache for a user
 */
export async function invalidateChatList(userId: string): Promise<void> {
  await invalidateCache(
    [],
    [CACHE_PATTERNS.CHAT_LIST_USER(userId)]
  );
}

/**
 * Invalidate user memory cache
 */
export async function invalidateUserMemory(userId: string): Promise<void> {
  await deleteCache(CACHE_KEYS.USER_MEMORY(userId));
}

/**
 * Invalidate chat summary cache
 */
export async function invalidateChatSummary(chatId: string): Promise<void> {
  await deleteCache(CACHE_KEYS.CHAT_SUMMARY(chatId));
}

/**
 * Invalidate statistics caches for a chat
 */
export async function invalidateChatStats(chatId: string): Promise<void> {
  await invalidateCache(
    [],
    [CACHE_PATTERNS.STATS_CHAT(chatId)]
  );
}

/**
 * Invalidate statistics caches for a user
 */
export async function invalidateUserStats(userId: string): Promise<void> {
  await invalidateCache(
    [],
    [CACHE_PATTERNS.STATS_USER(userId)]
  );
}

/**
 * Invalidate message stats cache
 */
export async function invalidateMessageStats(messageId: string): Promise<void> {
  await deleteCache(CACHE_KEYS.STATS_MESSAGE(messageId));
}
