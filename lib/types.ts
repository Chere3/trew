/**
 * Centralized Type Definitions
 * 
 * All TypeScript interfaces and type definitions used across the application.
 * This file serves as the single source of truth for all types.
 */

// Re-export constants for use in types
import type {
  MESSAGE_ROLE_USER,
  MESSAGE_ROLE_ASSISTANT,
  MESSAGE_ROLE_SYSTEM,
  TASK_CATEGORY_CODING,
  TASK_CATEGORY_MATH_REASONING,
  TASK_CATEGORY_GENERAL,
  TASK_CATEGORY_QUICK,
  TASK_CATEGORY_UI_CODING,
  TASK_CATEGORY_UI_CREATIVE,
  TASK_CATEGORY_UI_ANALYSIS,
  TASK_CATEGORY_UI_MATH,
  SYSTEM_MESSAGE_VARIANT_INFO,
  SYSTEM_MESSAGE_VARIANT_SUCCESS,
  SYSTEM_MESSAGE_VARIANT_WARNING,
  SYSTEM_MESSAGE_VARIANT_ERROR,
  MODEL_SPEED_FAST,
  MODEL_SPEED_MEDIUM,
  MODEL_SPEED_SLOW,
  TIME_PERIOD_DAY,
  TIME_PERIOD_WEEK,
  TIME_PERIOD_MONTH,
  TIME_PERIOD_ALL,
  STATS_SCOPE_USER,
  STATS_SCOPE_CHAT,
  STATS_SCOPE_MODEL,
  STATS_SCOPE_MESSAGE,
  STATS_SCOPE_ALL_MODELS,
  BILLING_PERIOD_MONTHLY,
  BILLING_PERIOD_ANNUAL,
  THEME_SYSTEM,
  THEME_LIGHT,
  THEME_DARK,
  RESOLVED_THEME_LIGHT,
  RESOLVED_THEME_DARK,
  PRESENCE_STATUS_ONLINE,
  PRESENCE_STATUS_OFFLINE,
  PRESENCE_STATUS_AWAY,
  PRESENCE_STATUS_BUSY,
} from "./constants";

// ============================================================================
// Message Types
// ============================================================================

export type MessageRole =
  | typeof MESSAGE_ROLE_USER
  | typeof MESSAGE_ROLE_ASSISTANT
  | typeof MESSAGE_ROLE_SYSTEM;

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Message {
  id: string;
  chatId?: string;
  role: MessageRole | "user" | "assistant"; // Support both for backward compatibility
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  model?: string;
  isStreaming?: boolean;
  memorySaved?: { facts: Record<string, any>; scores: Record<string, number>; timestamp: number } | null;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt?: number;
  preview?: string;
  userId?: string;
}

// ============================================================================
// Component Props
// ============================================================================

export interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  avatar?: string;
  avatarFallback?: string;
  isStreaming?: boolean;
  hasError?: boolean;
  onRetry?: () => void;
  onCopy?: () => void;
  onFeedback?: (positive: boolean) => void;
  onRegenerate?: () => void;
  onRegenerateWithModel?: (modelId: string) => void;
  className?: string;
  attachments?: Attachment[];
  modelName?: string;
  modelId?: string;
  providerIcon?: React.ReactNode;
  id?: string;
  availableModels?: Model[];
  memorySaved?: { facts: Record<string, any>; scores: Record<string, number>; timestamp: number } | null;
}

export interface MessageListProps {
  messages: Message[];
  isLoadingOlder?: boolean;
  className?: string;
  availableModels?: Model[];
  onRegenerate?: (messageId: string) => void;
  onRegenerateWithModel?: (messageId: string, modelId: string) => void;
  getProviderIcon?: (message: Message) => React.ReactNode;
  onScrollNearTop?: () => void;
  hasMore?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  preview?: string;
  timestamp?: Date;
  unread?: number;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect?: (conversation: Conversation) => void;
  onNew?: () => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export interface CommandOption {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  keywords?: string[];
}

export interface CommandPaletteProps {
  commands: CommandOption[];
  onSelect?: (command: CommandOption) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  className?: string;
}

export interface MessageComposerProps {
  onSend: (content: string, files: File[]) => void;
  onAttachment?: (files: File[]) => void;
  onVoiceInput?: (audio: Blob) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
}

// ============================================================================
// Model Types
// ============================================================================

export interface Model {
  id: string;
  name: string;
  provider: string;
  icon: string; // Icon name as string for serialization
  color: string;
  description?: string;
  capabilities?: {
    contextWindow?: string;
    speed?: typeof MODEL_SPEED_FAST | typeof MODEL_SPEED_MEDIUM | typeof MODEL_SPEED_SLOW;
    specialty?: string[];
  };
  flagship?: boolean;
  rank?: number;
  intelligenceIndex?: number;
  codingIndex?: number;
  mathIndex?: number;
  openrouterId?: string;
  canonicalSlug?: string;
}

// Re-export from lib/models/types.ts
export type { OpenRouterModel, OpenRouterModelsResponse } from "./models/types";
export type { ArtificialAnalysisModel, ArtificialAnalysisModelsResponse } from "./models/types";

export interface ModelPricing {
  prompt?: string;
  completion?: string;
  price_1m_blended_3_to_1?: number;
  price_1m_input_tokens?: number;
  price_1m_output_tokens?: number;
}

// ============================================================================
// Provider Types
// ============================================================================

export type { ProviderConfig } from "./models/providers";

// ============================================================================
// Autorouter Types
// ============================================================================

export type TaskCategory =
  | typeof TASK_CATEGORY_CODING
  | typeof TASK_CATEGORY_MATH_REASONING
  | typeof TASK_CATEGORY_GENERAL
  | typeof TASK_CATEGORY_QUICK;

export interface CategoryClassification {
  category: TaskCategory;
  confidence: number; // 0-1 confidence score
  reasoning?: string; // Optional explanation
}

export interface RankedModel {
  id: string;
  name: string;
  provider: string;
  intelligenceIndex?: number;
  codingIndex?: number;
  mathIndex?: number;
  reasoningIndex?: number;
}

export interface CategoryModelAssignment {
  coding: string | null;
  math_reasoning: string | null;
  general: string | null;
  quick: string | null;
}

export interface AutorouteResult {
  selectedModelId: string;
  category: TaskCategory;
  confidence: number;
  reasoning: string;
  assignments: CategoryModelAssignment;
}

export interface AutorouterConfig {
  /** Fireworks API key for classification */
  fireworksApiKey: string;
  /** Classification model to use */
  classifierModel?: string;
  /** Maximum tokens for classification response */
  maxClassifierTokens?: number;
  /** Minimum confidence threshold to use specialized model (default: quick) */
  confidenceThreshold?: number;
}

// ============================================================================
// Stats Types
// ============================================================================

export interface TokenUsage {
  id: string;
  messageId: string;
  chatId: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  cost: number;
  latency?: number;
  createdAt: number;
}

export interface TokenUsageInput {
  messageId: string;
  chatId: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  cost: number;
  latency?: number;
}

export interface TokenStats {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCachedTokens: number;
  totalReasoningTokens: number;
  totalCost: number;
  averageLatency?: number;
  requestCount: number;
  averageTokensPerRequest: number;
  averageCostPerRequest: number;
}

export interface CostBreakdown {
  totalCost: number;
  promptCost: number;
  completionCost: number;
  cachedDiscount?: number;
  upstreamCost?: number;
  currency: string;
}

export type StatsScope =
  | typeof STATS_SCOPE_USER
  | typeof STATS_SCOPE_CHAT
  | typeof STATS_SCOPE_MODEL
  | typeof STATS_SCOPE_MESSAGE
  | typeof STATS_SCOPE_ALL_MODELS;

export type TimePeriod =
  | typeof TIME_PERIOD_DAY
  | typeof TIME_PERIOD_WEEK
  | typeof TIME_PERIOD_MONTH
  | typeof TIME_PERIOD_ALL;

export interface UsageQuery {
  scope?: StatsScope;
  id?: string;
  period?: TimePeriod;
  startDate?: number;
  endDate?: number;
  model?: string;
  userId?: string;
  chatId?: string;
}

export interface TimeSeriesPoint {
  timestamp: number;
  date: string;
  tokens: number;
  cost: number;
  requestCount: number;
}

export interface ModelStats extends TokenStats {
  model: string;
  provider: string;
  usageFrequency: number;
  averageTokensPerRequest: number;
  averageCostPerRequest: number;
}

export interface UserStats extends TokenStats {
  userId: string;
  chatCount: number;
  modelBreakdown: Array<{
    model: string;
    usage: TokenStats;
  }>;
}

export interface ChatStats extends TokenStats {
  chatId: string;
  messageCount: number;
  modelBreakdown: Array<{
    model: string;
    usage: TokenStats;
  }>;
  timeSeries: TimeSeriesPoint[];
}

export interface MessageStats {
  messageId: string;
  chatId: string;
  userId: string;
  model: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  cost: number;
  latency?: number;
  createdAt: number;
}

// ============================================================================
// UI Types
// ============================================================================

export type SystemMessageVariant =
  | typeof SYSTEM_MESSAGE_VARIANT_INFO
  | typeof SYSTEM_MESSAGE_VARIANT_SUCCESS
  | typeof SYSTEM_MESSAGE_VARIANT_WARNING
  | typeof SYSTEM_MESSAGE_VARIANT_ERROR;

export interface SystemMessageProps {
  title?: string;
  message: string;
  variant?: SystemMessageVariant;
  className?: string;
}

export type PresenceStatus =
  | typeof PRESENCE_STATUS_ONLINE
  | typeof PRESENCE_STATUS_OFFLINE
  | typeof PRESENCE_STATUS_AWAY
  | typeof PRESENCE_STATUS_BUSY;

export interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export type BillingPeriod =
  | typeof BILLING_PERIOD_MONTHLY
  | typeof BILLING_PERIOD_ANNUAL;

export type Theme =
  | typeof THEME_SYSTEM
  | typeof THEME_LIGHT
  | typeof THEME_DARK;

export type ResolvedTheme =
  | typeof RESOLVED_THEME_LIGHT
  | typeof RESOLVED_THEME_DARK;

export interface ThemeProviderContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskCategoryUI =
  | typeof TASK_CATEGORY_UI_CODING
  | typeof TASK_CATEGORY_UI_CREATIVE
  | typeof TASK_CATEGORY_UI_ANALYSIS
  | typeof TASK_CATEGORY_UI_MATH;

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategoryUI;
}

export interface TaskCardProps {
  task: Task;
  recommendedModelName?: string;
  onClick: () => void;
  className?: string;
}

// ============================================================================
// Pricing Types
// ============================================================================

export interface PricingFeature {
  name: string;
  included: boolean;
  tooltip?: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  badge?: string;
  popular?: boolean;
  features: PricingFeature[];
  cta: string;
}

// ============================================================================
// Other Types
// ============================================================================

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}
