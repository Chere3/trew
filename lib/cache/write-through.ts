/**
 * Write-through cache utilities
 * Writes to cache immediately and queues database writes for async processing
 */

import { setCache, getCache } from "./redis";
import { CACHE_KEYS, CACHE_TTL } from "./types";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import type { Message, Chat } from "@/lib/types";

/**
 * Queue item for database writes
 */
interface DBWriteQueueItem {
  type: "message" | "chat" | "chat_with_message";
  data: any;
  retries: number;
  timestamp: number;
}

// In-memory queue for database writes
const dbWriteQueue: DBWriteQueueItem[] = [];
let isProcessingQueue = false;
const MAX_RETRIES = 3;
const QUEUE_PROCESSING_INTERVAL = 100; // Process queue every 100ms

/**
 * Queue a database write operation
 */
function queueDBWrite(item: Omit<DBWriteQueueItem, "retries" | "timestamp">): void {
  dbWriteQueue.push({
    ...item,
    retries: 0,
    timestamp: Date.now(),
  });

  // Start processing if not already running
  if (!isProcessingQueue) {
    processQueue();
  }
}

/**
 * Process the database write queue asynchronously
 */
async function processQueue(): Promise<void> {
  if (isProcessingQueue || dbWriteQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (dbWriteQueue.length > 0) {
    const item = dbWriteQueue.shift();
    if (!item) break;

    try {
      await processQueueItem(item);
    } catch (error) {
      console.error(`[DB Queue] Error processing ${item.type}:`, error);
      
      // Retry if under max retries
      if (item.retries < MAX_RETRIES) {
        item.retries++;
        dbWriteQueue.push(item);
      } else {
        console.error(`[DB Queue] Max retries reached for ${item.type}, dropping item`);
      }
    }
  }

  isProcessingQueue = false;

  // Schedule next processing if queue has items
  if (dbWriteQueue.length > 0) {
    setTimeout(() => processQueue(), QUEUE_PROCESSING_INTERVAL);
  }
}

/**
 * Process a single queue item
 */
async function processQueueItem(item: DBWriteQueueItem): Promise<void> {
  switch (item.type) {
    case "message":
      await writeMessageToDB(item.data);
      break;
    case "chat":
      await writeChatToDB(item.data);
      break;
    case "chat_with_message":
      await writeChatWithMessageToDB(item.data);
      break;
  }
}

/**
 * Write message to database
 */
async function writeMessageToDB(data: {
  messageId: string;
  chatId: string;
  role: string;
  content: string;
  attachments?: any;
  createdAt: number;
  userId: string;
}): Promise<void> {
  const client = await db.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    
    // Verify chat ownership
    const chatResult = await client.query(
      'SELECT id FROM chat WHERE id = $1 AND "userId" = $2 FOR UPDATE',
      [data.chatId, data.userId]
    );
    
    if (chatResult.rows.length === 0) {
      await client.query("ROLLBACK");
      transactionStarted = false;
      throw new Error(`Chat ${data.chatId} not found or unauthorized`);
    }

    // Insert message
    await client.query(
      'INSERT INTO message (id, "chatId", role, content, attachments, "createdAt") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
      [
        data.messageId,
        data.chatId,
        data.role,
        data.content,
        data.attachments ? JSON.stringify(data.attachments) : null,
        data.createdAt,
      ]
    );

    // Update chat timestamp
    await client.query(
      'UPDATE chat SET "updatedAt" = $1 WHERE id = $2',
      [data.createdAt, data.chatId]
    );

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("[DB Queue] Error during rollback:", rollbackError);
      }
    }
    throw error;
  } finally {
    // Always release connection, even on error
    client.release();
  }
}

/**
 * Write chat to database
 */
async function writeChatToDB(data: {
  chatId: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}): Promise<void> {
  const client = await db.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    
    await client.query(
      'INSERT INTO chat (id, "userId", title, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [data.chatId, data.userId, data.title, data.createdAt, data.updatedAt]
    );

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("[DB Queue] Error during rollback:", rollbackError);
      }
    }
    throw error;
  } finally {
    // Always release connection, even on error
    client.release();
  }
}

/**
 * Write chat with initial message to database
 */
async function writeChatWithMessageToDB(data: {
  chatId: string;
  userId: string;
  title: string;
  messageId: string;
  message: string;
  attachments?: any;
  createdAt: number;
  updatedAt: number;
}): Promise<void> {
  const client = await db.connect();
  let transactionStarted = false;
  try {
    await client.query("BEGIN");
    transactionStarted = true;
    
    // Insert chat
    await client.query(
      'INSERT INTO chat (id, "userId", title, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
      [data.chatId, data.userId, data.title, data.createdAt, data.updatedAt]
    );

    // Insert initial message
    await client.query(
      'INSERT INTO message (id, "chatId", role, content, attachments, "createdAt") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
      [
        data.messageId,
        data.chatId,
        "user",
        data.message,
        data.attachments ? JSON.stringify(data.attachments) : null,
        data.createdAt,
      ]
    );

    await client.query("COMMIT");
    transactionStarted = false;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("[DB Queue] Error during rollback:", rollbackError);
      }
    }
    throw error;
  } finally {
    // Always release connection, even on error
    client.release();
  }
}

/**
 * Write message to cache immediately and queue DB write
 */
export async function writeMessageToCache(
  message: {
    chatId: string;
    role: Message["role"];
    content: string;
    attachments?: Message["attachments"];
    model?: Message["model"];
    id?: string;
    createdAt?: number;
    isStreaming?: boolean;
  },
  userId: string
): Promise<Message & { chatId: string }> {
  // #region agent log
  const funcStart = Date.now();
  fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/write-through.ts:229',message:'writeMessageToCache entry',data:{chatId:message.chatId,hasId:!!message.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  const messageId = message.id || nanoid();
  const now = message.createdAt || Date.now();
  
  const fullMessage: Message & { chatId: string } = {
    ...message,
    id: messageId,
    createdAt: now,
    isStreaming: message.isStreaming ?? false,
  };

  // Write to cache immediately - update messages cache
  const cacheKey = CACHE_KEYS.CHAT_MESSAGES(message.chatId, 50, null, null);
  // #region agent log
  const cacheReadStart = Date.now();
  // #endregion
  const existingCache = await getCache<{ messages: Message[]; hasMore: boolean; nextCursor?: number }>(cacheKey);
  // #region agent log
  const cacheReadTime = Date.now() - cacheReadStart;
  fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/write-through.ts:249',message:'Cache read completed',data:{cacheReadTime,hasCache:!!existingCache},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  
  if (existingCache) {
    // Update existing cache by appending new message (messages are in ascending order)
    // Keep only the most recent 50 messages
    const updatedMessages = [...existingCache.messages, fullMessage];
    const trimmedMessages = updatedMessages.slice(-50); // Keep last 50
    // #region agent log
    const cacheWriteStart = Date.now();
    // #endregion
    await setCache(cacheKey, {
      ...existingCache,
      messages: trimmedMessages,
    }, CACHE_TTL.CHAT_MESSAGES);
    // #region agent log
    const cacheWriteTime = Date.now() - cacheWriteStart;
    fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/write-through.ts:256',message:'Cache write completed',data:{cacheWriteTime},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  }

  // Queue database write (non-blocking)
  queueDBWrite({
    type: "message",
    data: {
      messageId,
      chatId: message.chatId,
      role: message.role,
      content: message.content,
      attachments: message.attachments,
      createdAt: now,
      userId,
    },
  });

  // #region agent log
  const totalTime = Date.now() - funcStart;
  fetch('http://127.0.0.1:7243/ingest/78c0aed7-8283-4e45-add5-a4fdfe9656b1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/cache/write-through.ts:277',message:'writeMessageToCache exit',data:{totalTime,cacheReadTime,cacheWriteTime:existingCache?Date.now()-cacheReadStart-cacheReadTime:0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  return fullMessage;
}

/**
 * Write chat to cache immediately and queue DB write
 */
export async function writeChatToCache(
  chat: Omit<Chat, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: number;
    updatedAt?: number;
  },
  userId: string
): Promise<Chat> {
  const chatId = chat.id || nanoid();
  const now = Date.now();
  
  const fullChat: Chat = {
    ...chat,
    id: chatId,
    createdAt: chat.createdAt || now,
    updatedAt: chat.updatedAt || now,
  };

  // Write to cache immediately - update chat list cache
  const cacheKey = CACHE_KEYS.CHAT_LIST(userId, false);
  const existingCache = await getCache<Chat[]>(cacheKey);
  
  if (existingCache) {
    // Prepend new chat to list
    await setCache(cacheKey, [fullChat, ...existingCache], CACHE_TTL.CHAT_LIST);
  }

  // Queue database write (non-blocking)
  queueDBWrite({
    type: "chat",
    data: {
      chatId,
      userId,
      title: chat.title || "New Chat",
      createdAt: fullChat.createdAt,
      updatedAt: fullChat.updatedAt,
    },
  });

  return fullChat;
}

/**
 * Write chat with initial message to cache immediately and queue DB write
 */
export async function writeChatWithMessageToCache(
  chat: Omit<Chat, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: number;
    updatedAt?: number;
  },
  message: {
    content: string;
    attachments?: any;
  },
  userId: string
): Promise<{ chat: Chat; message: Message }> {
  const chatId = chat.id || nanoid();
  const messageId = nanoid();
  const now = Date.now();
  
  const fullChat: Chat = {
    ...chat,
    id: chatId,
    createdAt: chat.createdAt || now,
    updatedAt: chat.updatedAt || now,
  };

  const fullMessage: Message = {
    id: messageId,
    chatId,
    role: "user",
    content: message.content,
    attachments: message.attachments,
    createdAt: now,
    isStreaming: false,
  };

  // Write to cache immediately - update chat list
  const chatListCacheKey = CACHE_KEYS.CHAT_LIST(userId, false);
  const existingChatList = await getCache<Chat[]>(chatListCacheKey);
  
  if (existingChatList) {
    await setCache(chatListCacheKey, [fullChat, ...existingChatList], CACHE_TTL.CHAT_LIST);
  }

  // Write to cache immediately - update messages cache
  const messagesCacheKey = CACHE_KEYS.CHAT_MESSAGES(chatId, 50, null, null);
  await setCache(messagesCacheKey, {
    messages: [fullMessage],
    hasMore: false,
  }, CACHE_TTL.CHAT_MESSAGES);

  // Queue database write (non-blocking)
  queueDBWrite({
    type: "chat_with_message",
    data: {
      chatId,
      userId,
      title: chat.title || "New Chat",
      messageId,
      message: message.content,
      attachments: message.attachments,
      createdAt: now,
      updatedAt: now,
    },
  });

  return { chat: fullChat, message: fullMessage };
}
