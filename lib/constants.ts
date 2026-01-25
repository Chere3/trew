/**
 * Centralized Constants
 * 
 * All magic strings, enums, and constant values used across the application.
 * This file serves as the single source of truth for all constants.
 */

// ============================================================================
// Message & Role Constants
// ============================================================================

export const MESSAGE_ROLE_USER = "user" as const;
export const MESSAGE_ROLE_ASSISTANT = "assistant" as const;
export const MESSAGE_ROLE_SYSTEM = "system" as const;

export const MESSAGE_ROLES = [MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT, MESSAGE_ROLE_SYSTEM] as const;

export const DEFAULT_AVATAR_FALLBACK_USER = "U";
export const DEFAULT_AVATAR_FALLBACK_ASSISTANT = "AI";

// ============================================================================
// Task Category Constants (Autorouter)
// ============================================================================

export const TASK_CATEGORY_CODING = "coding" as const;
export const TASK_CATEGORY_MATH_REASONING = "math_reasoning" as const;
export const TASK_CATEGORY_GENERAL = "general" as const;
export const TASK_CATEGORY_QUICK = "quick" as const;

export const TASK_CATEGORIES = [
  TASK_CATEGORY_CODING,
  TASK_CATEGORY_MATH_REASONING,
  TASK_CATEGORY_GENERAL,
  TASK_CATEGORY_QUICK,
] as const;

// UI Task Categories (for task cards)
export const TASK_CATEGORY_UI_CODING = "coding" as const;
export const TASK_CATEGORY_UI_CREATIVE = "creative" as const;
export const TASK_CATEGORY_UI_ANALYSIS = "analysis" as const;
export const TASK_CATEGORY_UI_MATH = "math" as const;

export const TASK_CATEGORIES_UI = [
  TASK_CATEGORY_UI_CODING,
  TASK_CATEGORY_UI_CREATIVE,
  TASK_CATEGORY_UI_ANALYSIS,
  TASK_CATEGORY_UI_MATH,
] as const;

// Priority order for category assignment
export const CATEGORY_PRIORITY: readonly TaskCategory[] = [
  TASK_CATEGORY_CODING,
  TASK_CATEGORY_MATH_REASONING,
  TASK_CATEGORY_GENERAL,
  TASK_CATEGORY_QUICK,
] as const;

// ============================================================================
// System Message Variants
// ============================================================================

export const SYSTEM_MESSAGE_VARIANT_INFO = "info" as const;
export const SYSTEM_MESSAGE_VARIANT_SUCCESS = "success" as const;
export const SYSTEM_MESSAGE_VARIANT_WARNING = "warning" as const;
export const SYSTEM_MESSAGE_VARIANT_ERROR = "error" as const;

export const SYSTEM_MESSAGE_VARIANTS = [
  SYSTEM_MESSAGE_VARIANT_INFO,
  SYSTEM_MESSAGE_VARIANT_SUCCESS,
  SYSTEM_MESSAGE_VARIANT_WARNING,
  SYSTEM_MESSAGE_VARIANT_ERROR,
] as const;

// ============================================================================
// Speed & Performance Constants
// ============================================================================

export const MODEL_SPEED_FAST = "fast" as const;
export const MODEL_SPEED_MEDIUM = "medium" as const;
export const MODEL_SPEED_SLOW = "slow" as const;

export const MODEL_SPEED = [
  MODEL_SPEED_FAST,
  MODEL_SPEED_MEDIUM,
  MODEL_SPEED_SLOW,
] as const;

// ============================================================================
// Time Period Constants
// ============================================================================

export const TIME_PERIOD_DAY = "day" as const;
export const TIME_PERIOD_WEEK = "week" as const;
export const TIME_PERIOD_MONTH = "month" as const;
export const TIME_PERIOD_ALL = "all" as const;

export const TIME_PERIODS = [
  TIME_PERIOD_DAY,
  TIME_PERIOD_WEEK,
  TIME_PERIOD_MONTH,
  TIME_PERIOD_ALL,
] as const;

// ============================================================================
// Scope Constants (Stats)
// ============================================================================

export const STATS_SCOPE_USER = "user" as const;
export const STATS_SCOPE_CHAT = "chat" as const;
export const STATS_SCOPE_MODEL = "model" as const;
export const STATS_SCOPE_MESSAGE = "message" as const;
export const STATS_SCOPE_ALL_MODELS = "all-models" as const;

export const STATS_SCOPES = [
  STATS_SCOPE_USER,
  STATS_SCOPE_CHAT,
  STATS_SCOPE_MODEL,
  STATS_SCOPE_MESSAGE,
  STATS_SCOPE_ALL_MODELS,
] as const;

// ============================================================================
// Billing Period Constants
// ============================================================================

export const BILLING_PERIOD_MONTHLY = "monthly" as const;
export const BILLING_PERIOD_ANNUAL = "annual" as const;

export const BILLING_PERIODS = [
  BILLING_PERIOD_MONTHLY,
  BILLING_PERIOD_ANNUAL,
] as const;

// ============================================================================
// Theme Constants
// ============================================================================

export const THEME_SYSTEM = "system" as const;
export const THEME_LIGHT = "light" as const;
export const THEME_DARK = "dark" as const;

export const THEMES = [
  THEME_SYSTEM,
  THEME_LIGHT,
  THEME_DARK,
] as const;

export const RESOLVED_THEME_LIGHT = "light" as const;
export const RESOLVED_THEME_DARK = "dark" as const;

export const RESOLVED_THEMES = [
  RESOLVED_THEME_LIGHT,
  RESOLVED_THEME_DARK,
] as const;

export const THEME_STORAGE_KEY = "theme-preference";
export const THINKING_COLLAPSED_DEFAULT_KEY = "thinking-collapsed-default";

// ============================================================================
// Presence Status Constants
// ============================================================================

export const PRESENCE_STATUS_ONLINE = "online" as const;
export const PRESENCE_STATUS_OFFLINE = "offline" as const;
export const PRESENCE_STATUS_AWAY = "away" as const;
export const PRESENCE_STATUS_BUSY = "busy" as const;

export const PRESENCE_STATUS = [
  PRESENCE_STATUS_ONLINE,
  PRESENCE_STATUS_OFFLINE,
  PRESENCE_STATUS_AWAY,
  PRESENCE_STATUS_BUSY,
] as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: {
    CHAT: "Chat not found",
    USER: "User not found",
    MESSAGE: "Message not found",
    MODEL: "Model not found or no usage",
    TOKEN_USAGE: "Token usage data not found for this message",
  },
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  INVALID_SCOPE: "Invalid scope. Use 'user', 'chat', 'model', or 'all-models'",
  REQUIRED_FIELDS: {
    ROLE_AND_CONTENT: "Role and content are required",
    MESSAGE: "Message is required to start a chat",
    MODEL_ID: "Model ID is required for model scope",
  },
  FAILED_TO_FETCH_MODELS: "Failed to fetch models",
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  CHATS: "/api/chats",
  CHAT_BY_ID: (id: string) => `/api/chats/${id}`,
  CHAT_MESSAGES: (id: string) => `/api/chats/${id}/messages`,
  CHAT_GENERATE: (id: string) => `/api/chats/${id}/generate`,
  MODELS: "/api/models",
  AUTOROUTE: "/api/autoroute",
  STATS: "/api/stats",
  STATS_USER: (userId: string) => `/api/stats/users/${userId}`,
  STATS_CHAT: (chatId: string) => `/api/stats/chats/${chatId}`,
  STATS_MESSAGE: (messageId: string) => `/api/stats/messages/${messageId}`,
  STATS_MODELS: "/api/stats/models",
} as const;

// ============================================================================
// Database Constants
// ============================================================================

export const DB_TABLES = {
  USER: "user",
  SESSION: "session",
  CHAT: "chat",
  MESSAGE: "message",
  TOKEN_USAGE: "token_usage",
  USER_SEMANTIC_MEMORY: "user_semantic_memory",
} as const;

export const DB_COLUMNS = {
  ID: "id",
  USER_ID: "userId",
  CHAT_ID: "chatId",
  MESSAGE_ID: "messageId",
  CREATED_AT: "createdAt",
  UPDATED_AT: "updatedAt",
  DELETED_AT: "deletedAt",
  ARCHIVED_AT: "archivedAt",
} as const;

// ============================================================================
// Provider Names
// ============================================================================

export const PROVIDER_NAMES = {
  OPENAI: "openai",
  ANTHROPIC: "anthropic",
  GOOGLE: "google",
  META: "meta",
  MISTRAL: "mistral",
  COHERE: "cohere",
  PERPLEXITY: "perplexity",
  GROQ: "groq",
  XAI: "xai",
  MINIMAX: "minimax",
  MOONSHOT: "moonshot",
  TREW: "trew",
} as const;

// ============================================================================
// Model Constants
// ============================================================================

export const AUTO_MODEL_ID = "auto";
export const QUICK_MODEL_DEFAULT = "moonshotai/kimi-k2-thinking";
export const DEFAULT_CLASSIFIER_MODEL = "accounts/fireworks/models/gpt-oss-20b";
export const DEFAULT_MAX_TOKENS = 100;
export const DEFAULT_LIMIT = 50;

// Type for TaskCategory (needed for CATEGORY_PRIORITY)
export type TaskCategory =
  | typeof TASK_CATEGORY_CODING
  | typeof TASK_CATEGORY_MATH_REASONING
  | typeof TASK_CATEGORY_GENERAL
  | typeof TASK_CATEGORY_QUICK;

// ============================================================================
// Cache Keys
// ============================================================================

export const CACHE_KEYS = {
  MODELS_LIST: "models-list",
  MODELS_TAG: "models",
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  MAX_TOKENS: DEFAULT_MAX_TOKENS,
  LIMIT: DEFAULT_LIMIT,
  TITLE_MAX_LENGTH: 50,
  TITLE_GENERATION_MAX_TOKENS: 20,
} as const;

// ============================================================================
// Fireworks API
// ============================================================================

export const FIREWORKS_API_BASE_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
export const FIREWORKS_CLASSIFICATION_TEMPERATURE = 0.1;

// ============================================================================
// Rolling Summary Constants
// ============================================================================

export const ROLLING_SUMMARY_KEEP_RECENT = 12; // Number of recent messages to keep intact
export const ROLLING_SUMMARY_MIN_MESSAGES = 15; // Minimum messages before summary is created

// ============================================================================
// Semantic Memory Constants
// ============================================================================

export const DEFAULT_MEMORY_SCORE_THRESHOLD = 0.7; // Minimum score (0.0-1.0) to save a fact to memory
