/**
 * Prompt Classifier
 * 
 * Uses a lightweight Fireworks model to classify prompts into task categories
 */

import type { TaskCategory, CategoryClassification, AutorouterConfig } from "@/lib/types";
import { DEFAULT_CLASSIFIER_MODEL, DEFAULT_MAX_TOKENS, FIREWORKS_API_BASE_URL, FIREWORKS_CLASSIFICATION_TEMPERATURE, TASK_CATEGORY_CODING, TASK_CATEGORY_MATH_REASONING, TASK_CATEGORY_GENERAL, TASK_CATEGORY_QUICK, MESSAGE_ROLE_USER } from "@/lib/constants";

/**
 * Classification prompt template
 */
const CLASSIFICATION_PROMPT = `You are a task classifier. Analyze the user's message and classify it into ONE of these categories:

- "coding": Programming, development, debugging, code review, technical implementation
- "math_reasoning": Mathematical problems, logical puzzles, complex analysis, scientific calculations, step-by-step reasoning
- "general": General conversation, creative writing, research, brainstorming, explanations
- "quick": Simple questions, greetings, one-word answers, trivial queries

Respond with ONLY a JSON object in this exact format:
{"category": "<category>", "confidence": <0.0-1.0>, "reasoning": "<brief explanation>"}

User message:`;

/**
 * Classify a prompt into a task category using Fireworks AI
 */
export async function classifyPrompt(
    prompt: string,
    config: AutorouterConfig
): Promise<CategoryClassification> {
    const {
        fireworksApiKey,
        classifierModel = DEFAULT_CLASSIFIER_MODEL,
        maxClassifierTokens = DEFAULT_MAX_TOKENS
    } = config;

    try {
        const response = await fetch(FIREWORKS_API_BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${fireworksApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: classifierModel,
                messages: [
                    {
                        role: MESSAGE_ROLE_USER,
                        content: `${CLASSIFICATION_PROMPT}\n${prompt}`,
                    }
                ],
                max_tokens: maxClassifierTokens,
                temperature: FIREWORKS_CLASSIFICATION_TEMPERATURE,
            }),
        });

        if (!response.ok) {
            console.error("Fireworks classification error:", response.status);
            return getDefaultClassification();
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
            console.error("Empty classification response");
            return getDefaultClassification();
        }

        // Parse JSON response
        const parsed = parseClassificationResponse(content);
        return parsed;

    } catch (error) {
        console.error("Classification failed:", error);
        return getDefaultClassification();
    }
}

/**
 * Parse the classification response from the model
 */
function parseClassificationResponse(content: string): CategoryClassification {
    try {
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return getDefaultClassification();
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate category
        const validCategories: TaskCategory[] = ["coding", "math_reasoning", "general", "quick"];
        const category = validCategories.includes(parsed.category)
            ? parsed.category as TaskCategory
            : "general";

        // Validate confidence
        const confidence = typeof parsed.confidence === "number"
            ? Math.max(0, Math.min(1, parsed.confidence))
            : 0.5;

        return {
            category,
            confidence,
            reasoning: parsed.reasoning || undefined,
        };

    } catch (error) {
        console.error("Failed to parse classification:", error);
        return getDefaultClassification();
    }
}

/**
 * Get default classification when classification fails
 */
function getDefaultClassification(): CategoryClassification {
    return {
        category: TASK_CATEGORY_GENERAL,
        confidence: 0.5,
        reasoning: "Default classification due to error",
    };
}

/**
 * Quick heuristic classification for simple patterns
 * Used as a fast path before AI classification
 */
export function quickClassify(prompt: string): CategoryClassification | null {
    const lower = prompt.toLowerCase().trim();

    // Quick/trivial patterns - be VERY aggressive here to avoid expensive models
    if (lower.length < 30) {
        const trivialPatterns = [
            "hi", "hello", "hey", "thanks", "thank you", "ok", "okay",
            "yes", "no", "bye", "goodbye", "sure", "alright", "cool",
            "nice", "great", "good", "nope", "yep", "yeah", "nah"
        ];
        if (trivialPatterns.some(p => lower === p || lower.startsWith(p + " ") || lower.startsWith(p + ","))) {
            return { category: TASK_CATEGORY_QUICK, confidence: 0.95, reasoning: "Trivial greeting/response" };
        }
    }

    // Strong coding indicators
    const codingPatterns = [
        /```[\s\S]*```/,                    // Code blocks
        /\b(function|class|const|let|var|def|import|export)\b/,
        /\b(debug|compile|error|exception|bug|fix|implement)\b/i,
        /\b(python|javascript|typescript|react|node|java|c\+\+|rust|go)\b/i,
    ];

    if (codingPatterns.some(p => p.test(prompt))) {
        return { category: TASK_CATEGORY_CODING, confidence: 0.85, reasoning: "Contains code or programming keywords" };
    }

    // Math/reasoning indicators
    const mathPatterns = [
        /\b(calculate|solve|equation|integral|derivative|prove|theorem)\b/i,
        /\b(math|algebra|calculus|geometry|statistics)\b/i,
        /[+\-*/^=].*\d+.*[+\-*/^=]/,  // Mathematical expressions
    ];

    if (mathPatterns.some(p => p.test(prompt))) {
        return { category: TASK_CATEGORY_MATH_REASONING, confidence: 0.8, reasoning: "Contains mathematical content" };
    }

    // General conversation patterns (common queries)
    const generalPatterns = [
        /\b(explain|describe|tell me|what is|how does|why|who|when|where)\b/i,
        /\b(write|create|make|generate|help|can you|could you|would you)\b/i,
        /\b(summary|summarize|brief|overview)\b/i,
    ];

    if (generalPatterns.some(p => p.test(prompt))) {
        return { category: TASK_CATEGORY_GENERAL, confidence: 0.75, reasoning: "Common conversational pattern" };
    }

    // Default to general for short-to-medium prompts to avoid classification latency
    // This is better than calling AI classification for most queries
    if (lower.length > 30 && lower.length < 300) {
        return { category: TASK_CATEGORY_GENERAL, confidence: 0.7, reasoning: "Default general classification for performance" };
    }

    // No quick classification possible (very long or unusual prompts)
    return null;
}
