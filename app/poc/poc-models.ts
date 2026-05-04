/**
 * Internal AZ model catalogue used by the PoC.
 *
 * Only text-capable chat models are listed (no embeddings, no image/audio
 * generation, no Whisper/TTS, no [1M] Claude Code-only variants, no Chinese
 * models such as DeepSeek). The `id`, `name`, `provider` and `description`
 * fields mirror the internal ai-gateway entries that should be exposed to
 * users.
 *
 * Because the PoC chat call goes through OpenRouter (we do not reach the
 * AZ gateway URLs), each entry also carries an `openrouterId` mapping to a
 * close public equivalent so the demo can answer end-to-end with whatever
 * OpenRouter actually serves. The intelligence/coding/math indices feed
 * the autorouter and reflect the model's relative position within this set.
 */

export interface PocModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  intelligenceIndex: number;
  codingIndex: number;
  mathIndex: number;
  /** Public OpenRouter id used for the actual chat completion. */
  openrouterId: string;
}

export const POC_MODELS: PocModel[] = [
  // ─────────────────────────────────────────── OpenAI
  {
    id: "gpt-5.5",
    name: "GPT-5.5",
    provider: "openai",
    description:
      "Advanced agentic model for complex multi-step tasks with enhanced reasoning and efficiency.",
    intelligenceIndex: 95,
    codingIndex: 92,
    mathIndex: 92,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-5.4",
    name: "GPT-5.4",
    provider: "openai",
    description:
      "Advanced reasoning model for complex AI agent workflows and long-running task automation.",
    intelligenceIndex: 92,
    codingIndex: 90,
    mathIndex: 90,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-5.4-pro",
    name: "GPT-5.4 Pro",
    provider: "openai",
    description:
      "Professional-grade model for complex analysis and enterprise workloads.",
    intelligenceIndex: 94,
    codingIndex: 91,
    mathIndex: 93,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    provider: "openai",
    description:
      "Compact, cost-efficient model for reliable high-volume everyday AI workloads.",
    intelligenceIndex: 78,
    codingIndex: 75,
    mathIndex: 74,
    openrouterId: "openai/gpt-4o-mini",
  },
  {
    id: "gpt-5.4-nano",
    name: "GPT-5.4 Nano",
    provider: "openai",
    description:
      "Ultra-lightweight model for low-latency, cost-effective tasks at massive scale.",
    intelligenceIndex: 60,
    codingIndex: 55,
    mathIndex: 55,
    openrouterId: "openai/gpt-4o-mini",
  },
  {
    id: "gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    provider: "openai",
    description:
      "Advanced code generation model for complex AI agent workflows and long-running task automation.",
    intelligenceIndex: 88,
    codingIndex: 95,
    mathIndex: 86,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-5.1",
    name: "GPT-5.1",
    provider: "openai",
    description:
      "Fast adaptive reasoning model with improved latency, cost efficiency, and multimodal intelligence.",
    intelligenceIndex: 86,
    codingIndex: 84,
    mathIndex: 83,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description:
      "Enhanced GPT-4 capabilities with a 128K context window for general workloads.",
    intelligenceIndex: 80,
    codingIndex: 78,
    mathIndex: 78,
    openrouterId: "openai/gpt-4.1",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Multimodal flagship model with strong general reasoning.",
    intelligenceIndex: 78,
    codingIndex: 76,
    mathIndex: 75,
    openrouterId: "openai/gpt-4o",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Cost-efficient small model with strong performance.",
    intelligenceIndex: 65,
    codingIndex: 60,
    mathIndex: 60,
    openrouterId: "openai/gpt-4o-mini",
  },
  {
    id: "o3",
    name: "o3",
    provider: "openai",
    description:
      "Next-generation reasoning model with advanced logical capabilities.",
    intelligenceIndex: 93,
    codingIndex: 89,
    mathIndex: 95,
    openrouterId: "openai/o3",
  },
  {
    id: "o4-mini",
    name: "o4 Mini",
    provider: "openai",
    description: "Latest compact reasoning model with enhanced efficiency.",
    intelligenceIndex: 84,
    codingIndex: 80,
    mathIndex: 88,
    openrouterId: "openai/o4-mini",
  },

  // ─────────────────────────────────────────── Anthropic
  {
    id: "us.anthropic.claude-opus-4-7",
    name: "Claude Opus 4.7",
    provider: "anthropic",
    description:
      "Notable improvement on Opus 4.6 in software engineering, vision and instruction following.",
    intelligenceIndex: 96,
    codingIndex: 96,
    mathIndex: 90,
    openrouterId: "anthropic/claude-opus-4",
  },
  {
    id: "us.anthropic.claude-opus-4-6-v1",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    description:
      "Most intelligent Anthropic model with exceptional reasoning and analysis.",
    intelligenceIndex: 94,
    codingIndex: 94,
    mathIndex: 88,
    openrouterId: "anthropic/claude-opus-4",
  },
  {
    id: "us.anthropic.claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    description:
      "High-performance Anthropic model balancing intelligence and speed.",
    intelligenceIndex: 87,
    codingIndex: 90,
    mathIndex: 82,
    openrouterId: "anthropic/claude-sonnet-4",
  },
  {
    id: "us.anthropic.claude-sonnet-4-5-20250929-v1:0",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    description: "Next-generation Sonnet with superior performance.",
    intelligenceIndex: 85,
    codingIndex: 88,
    mathIndex: 80,
    openrouterId: "anthropic/claude-3.5-sonnet",
  },
  {
    id: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    description: "Fast and cost-effective Anthropic model for high-volume tasks.",
    intelligenceIndex: 70,
    codingIndex: 68,
    mathIndex: 65,
    openrouterId: "anthropic/claude-3.5-haiku",
  },
  {
    id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0",
    name: "Claude 3.7 Sonnet",
    provider: "anthropic",
    description: "Advanced Claude with enhanced reasoning and problem-solving.",
    intelligenceIndex: 82,
    codingIndex: 84,
    mathIndex: 78,
    openrouterId: "anthropic/claude-3.7-sonnet",
  },

  // ─────────────────────────────────────────── Google Gemini
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    provider: "google",
    description:
      "Advanced reasoning model with 1M token context across text, code, images, audio and video.",
    intelligenceIndex: 90,
    codingIndex: 86,
    mathIndex: 92,
    openrouterId: "google/gemini-2.5-pro",
  },
  {
    id: "gemini-3.1-flash-lite-preview",
    name: "Gemini 3.1 Flash-Lite Preview",
    provider: "google",
    description:
      "Lightweight 1M-context multimodal model with low-cost throughput.",
    intelligenceIndex: 72,
    codingIndex: 68,
    mathIndex: 75,
    openrouterId: "google/gemini-2.5-flash",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description:
      "State-of-the-art thinking model for complex reasoning in code, math and STEM.",
    intelligenceIndex: 86,
    codingIndex: 82,
    mathIndex: 90,
    openrouterId: "google/gemini-2.5-pro",
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    description:
      "Best price-performance Gemini for large-scale low-latency processing.",
    intelligenceIndex: 75,
    codingIndex: 70,
    mathIndex: 78,
    openrouterId: "google/gemini-2.5-flash",
  },

  // ─────────────────────────────────────────── Grok
  {
    id: "grok-4-20-reasoning",
    name: "Grok 4.20 Reasoning",
    provider: "xai",
    description:
      "xAI's large language model with extended reasoning for complex professional tasks.",
    intelligenceIndex: 88,
    codingIndex: 84,
    mathIndex: 90,
    openrouterId: "x-ai/grok-4",
  },
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "xai",
    description: "xAI's latest conversational AI model with enhanced capabilities.",
    intelligenceIndex: 82,
    codingIndex: 78,
    mathIndex: 82,
    openrouterId: "x-ai/grok-4",
  },

  // ─────────────────────────────────────────── Meta Llama
  {
    id: "us.meta.llama3-1-70b-instruct-v1:0",
    name: "Llama 3.1 70B Instruct",
    provider: "meta",
    description:
      "High-performance open source instruction-following model.",
    intelligenceIndex: 76,
    codingIndex: 72,
    mathIndex: 70,
    openrouterId: "meta-llama/llama-3.1-70b-instruct",
  },
  {
    id: "us.meta.llama3-1-8b-instruct-v1:0",
    name: "Llama 3.1 8B Instruct",
    provider: "meta",
    description: "Efficient open source instruction model for most tasks.",
    intelligenceIndex: 60,
    codingIndex: 55,
    mathIndex: 55,
    openrouterId: "meta-llama/llama-3.1-8b-instruct",
  },

  // ─────────────────────────────────────────── Amazon Nova
  {
    id: "us.amazon.nova-premier-v1:0",
    name: "Amazon Nova Premier",
    provider: "amazon",
    description: "Premium Amazon Nova model for complex reasoning and analysis.",
    intelligenceIndex: 80,
    codingIndex: 75,
    mathIndex: 76,
    openrouterId: "amazon/nova-pro-v1",
  },
  {
    id: "us.amazon.nova-pro-v1:0",
    name: "Amazon Nova Pro",
    provider: "amazon",
    description: "Professional-grade Nova balancing capability and efficiency.",
    intelligenceIndex: 72,
    codingIndex: 68,
    mathIndex: 68,
    openrouterId: "amazon/nova-pro-v1",
  },
  {
    id: "us.amazon.nova-lite-v1:0",
    name: "Amazon Nova Lite",
    provider: "amazon",
    description: "Cost-effective foundation Nova model for everyday tasks.",
    intelligenceIndex: 58,
    codingIndex: 52,
    mathIndex: 52,
    openrouterId: "amazon/nova-lite-v1",
  },

  // ─────────────────────────────────────────── Cohere
  {
    id: "cohere.command-r-plus-v1:0",
    name: "Command R+",
    provider: "cohere",
    description: "Advanced Cohere model for RAG and tool use with superior accuracy.",
    intelligenceIndex: 74,
    codingIndex: 68,
    mathIndex: 65,
    openrouterId: "cohere/command-r-plus",
  },
  {
    id: "cohere.command-r-v1:0",
    name: "Command R",
    provider: "cohere",
    description: "Efficient Cohere model optimized for RAG and conversational AI.",
    intelligenceIndex: 64,
    codingIndex: 58,
    mathIndex: 56,
    openrouterId: "cohere/command-r",
  },
];

/** Look up the OpenRouter id for an AZ model id, falling back to GPT-4o. */
export function resolveOpenRouterId(modelId: string): string {
  const match = POC_MODELS.find((m) => m.id === modelId);
  return match?.openrouterId ?? "openai/gpt-4o";
}
