import { db } from "@/lib/db";
import { 
    FIREWORKS_API_BASE_URL,
    DEFAULT_CLASSIFIER_MODEL,
    MESSAGE_ROLE_USER,
    MESSAGE_ROLE_ASSISTANT,
    MESSAGE_ROLE_SYSTEM,
    DEFAULT_MEMORY_SCORE_THRESHOLD
} from "@/lib/constants";
import type { MessageForSummary } from "./rolling-summary";
import { getCached, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { invalidateUserMemory } from "@/lib/cache/strategies";

export interface ExtractedFacts {
    facts: Record<string, any>;
    scores: Record<string, number>;
}

/**
 * Extract facts from messages using AI
 * Returns both facts and their confidence scores
 */
export async function extractFacts(
    messages: MessageForSummary[],
    existingFacts: Record<string, any> | null = null
): Promise<ExtractedFacts> {
    const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;

    if (!FIREWORKS_API_KEY) {
        console.warn("FIREWORKS_API_KEY not found, cannot extract facts");
        return { facts: {}, scores: {} };
    }

    if (messages.length === 0) {
        return { facts: {}, scores: {} };
    }

    try {
        // Filter to only user messages for fact extraction
        const userMessages = messages.filter(m => m.role === MESSAGE_ROLE_USER);
        
        if (userMessages.length === 0) {
            return { facts: {}, scores: {} };
        }

        // Format messages for fact extraction
        const conversationText = userMessages
            .map((m) => `User: ${m.content}`)
            .join("\n\n");

        // Build existing facts context
        let existingFactsContext = "";
        if (existingFacts && Object.keys(existingFacts).length > 0) {
            existingFactsContext = `\n\nExisting facts about the user:\n${JSON.stringify(existingFacts, null, 2)}`;
        }

        const prompt = `You are extracting factual information about the user from their conversation. Extract only persistent, reusable facts that would be useful in future conversations.

Guidelines:
- Extract facts about: pets, preferences, personal details, interests, work, family, etc.
- Assign a confidence score (0.0-1.0) to each fact based on:
  * Persistence: Is this a permanent fact? (vs temporary context)
  * Importance: How significant is this information?
  * Specificity: Is this concrete and actionable? (vs vague)
  * Reusability: Will this be useful in future conversations?
- Higher scores (0.7+) for clear, permanent facts (e.g., "My dog is named Fido")
- Lower scores (0.3-0.6) for context-specific or temporary information
- Very low scores (<0.3) should not be extracted
- Only extract facts that are likely to be persistent and reusable
- Merge with existing facts if provided (don't overwrite, add new or update existing)

Return ONLY valid JSON in this exact format:
{
  "facts": {
    "fact_key": { "detail1": "value1", "detail2": "value2" },
    "another_fact": "value"
  },
  "scores": {
    "fact_key": 0.9,
    "another_fact": 0.8
  }
}

Conversation:
${conversationText}${existingFactsContext}`;

        const response = await fetch(FIREWORKS_API_BASE_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${FIREWORKS_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: DEFAULT_CLASSIFIER_MODEL,
                messages: [
                    {
                        role: MESSAGE_ROLE_SYSTEM,
                        content: "You are a helpful assistant that extracts structured facts from conversations. Always return valid JSON only."
                    },
                    {
                        role: MESSAGE_ROLE_USER,
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.2, // Lower temperature for more consistent extraction
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Fireworks fact extraction error:", response.status, errorText);
            return { facts: {}, scores: {} };
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim();

        if (!content) {
            console.warn("Empty fact extraction response from API");
            return { facts: {}, scores: {} };
        }

        // Parse JSON response
        try {
            // Try to extract JSON from markdown code blocks if present
            let jsonContent = content;
            const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
            if (jsonMatch) {
                jsonContent = jsonMatch[1];
            } else {
                // Try to find JSON object directly (might be without code blocks)
                const directJsonMatch = content.match(/\{[\s\S]*\}/);
                if (directJsonMatch) {
                    jsonContent = directJsonMatch[0];
                }
            }

            const parsed = JSON.parse(jsonContent) as ExtractedFacts;
            
            // Validate structure
            if (!parsed.facts || !parsed.scores) {
                console.warn("Invalid fact extraction response structure");
                return { facts: {}, scores: {} };
            }

            // Ensure all facts have scores
            const validatedFacts: Record<string, any> = {};
            const validatedScores: Record<string, number> = {};
            
            for (const [key, value] of Object.entries(parsed.facts)) {
                const score = parsed.scores[key] ?? 0;
                // Only include facts with valid scores
                if (typeof score === 'number' && score >= 0 && score <= 1) {
                    validatedFacts[key] = value;
                    validatedScores[key] = score;
                }
            }

            return {
                facts: validatedFacts,
                scores: validatedScores
            };
        } catch (parseError) {
            console.error("Failed to parse fact extraction response:", parseError);
            console.error("Response content:", content);
            
            // Try to fix common JSON issues and retry
            try {
                // Remove markdown code block markers if present
                let cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                // Try to extract just the JSON object
                const jsonObjMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonObjMatch) {
                    cleaned = jsonObjMatch[0];
                    const retryParsed = JSON.parse(cleaned) as ExtractedFacts;
                    if (retryParsed.facts && retryParsed.scores) {
                        return {
                            facts: retryParsed.facts,
                            scores: retryParsed.scores
                        };
                    }
                }
            } catch (retryError) {
                // Retry failed, continue to return empty facts
            }
            
            return { facts: {}, scores: {} };
        }
    } catch (error) {
        console.error("Failed to extract facts:", error);
        return { facts: {}, scores: {} };
    }
}

/**
 * Determine if a fact should be saved based on its score
 */
export function shouldSaveFact(
    factKey: string,
    score: number,
    threshold: number = DEFAULT_MEMORY_SCORE_THRESHOLD
): boolean {
    return score >= threshold;
}

/**
 * Get user's semantic memory from database (with caching)
 */
export async function getUserSemanticMemory(userId: string): Promise<Record<string, any> | null> {
    const cacheKey = CACHE_KEYS.USER_MEMORY(userId);
    
    return getCached(
        cacheKey,
        async () => {
            try {
                const result = await db.query(
                    'SELECT facts FROM user_semantic_memory WHERE "userId" = $1',
                    [userId]
                );

                if (result.rows.length === 0) {
                    return null;
                }

                const parsed = JSON.parse(result.rows[0].facts);
                return parsed;
            } catch (error) {
                console.error("Failed to get user semantic memory:", error);
                return null;
            }
        },
        CACHE_TTL.USER_MEMORY
    );
}

/**
 * Update or insert user's semantic memory (with cache invalidation)
 */
export async function updateUserSemanticMemory(
    userId: string,
    facts: Record<string, any>
): Promise<void> {
    try {
        const now = Date.now();
        const factsJson = JSON.stringify(facts);

        await db.query(`
            INSERT INTO user_semantic_memory ("userId", facts, "updatedAt")
            VALUES ($1, $2, $3)
            ON CONFLICT("userId") DO UPDATE SET
                facts = $4,
                "updatedAt" = $5
        `, [userId, factsJson, now, factsJson, now]);

        // Invalidate cache and update with new value
        await invalidateUserMemory(userId);
        // Update cache with new value (write-through)
        const { setCache } = await import("@/lib/cache/redis");
        await setCache(CACHE_KEYS.USER_MEMORY(userId), facts, CACHE_TTL.USER_MEMORY);
    } catch (error) {
        console.error("Failed to update user semantic memory:", error);
        throw error;
    }
}

/**
 * Merge new facts with existing facts, preferring higher scores
 */
export function mergeFacts(
    existingFacts: Record<string, any>,
    newFacts: Record<string, any>,
    newScores: Record<string, number>,
    existingScores?: Record<string, number>
): { facts: Record<string, any>, scores: Record<string, number> } {
    const mergedFacts = { ...existingFacts };
    const mergedScores = { ...(existingScores || {}) };

    for (const [key, value] of Object.entries(newFacts)) {
        const newScore = newScores[key] ?? 0;
        const existingScore = mergedScores[key] ?? 0;

        // If new fact has higher score, or fact doesn't exist, update it
        if (newScore > existingScore || !(key in mergedFacts)) {
            mergedFacts[key] = value;
            mergedScores[key] = newScore;
        }
    }

    return { facts: mergedFacts, scores: mergedScores };
}
