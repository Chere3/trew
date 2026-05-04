/**
 * Static, offline catalogue used by the PoC.
 *
 * Both the picker UI and the autoroute API import from here so the
 * page can run without OpenRouter / network access.
 */

export interface PocModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  intelligenceIndex: number;
  codingIndex: number;
  mathIndex: number;
}

export const POC_MODELS: PocModel[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description:
      "OpenAI's flagship multimodal model. Strong general reasoning and code.",
    intelligenceIndex: 80,
    codingIndex: 78,
    mathIndex: 80,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "openai",
    description:
      "Faster, cheaper OpenAI model. Good for quick replies and simple tasks.",
    intelligenceIndex: 65,
    codingIndex: 60,
    mathIndex: 60,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description:
      "Anthropic's balanced flagship. Excellent coding and long-context reasoning.",
    intelligenceIndex: 85,
    codingIndex: 88,
    mathIndex: 78,
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description:
      "Anthropic's fastest model. Ideal for short conversations and lightweight tasks.",
    intelligenceIndex: 60,
    codingIndex: 55,
    mathIndex: 50,
  },
  {
    id: "google/gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description:
      "Google's multimodal model with strong math and analysis performance.",
    intelligenceIndex: 75,
    codingIndex: 70,
    mathIndex: 82,
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "deepseek",
    description:
      "Open reasoning model with extended thinking. Best for math and complex coding.",
    intelligenceIndex: 82,
    codingIndex: 85,
    mathIndex: 90,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "meta",
    description:
      "Meta's open-weight 70B instruct model. Solid all-rounder for general queries.",
    intelligenceIndex: 70,
    codingIndex: 65,
    mathIndex: 70,
  },
];
