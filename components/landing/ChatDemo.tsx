"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import useSWR from "swr";
import { MessageList } from "@/components/chat/MessageList";
import { MessageComposer } from "@/components/input/MessageComposer";
import { ModelSelector } from "@/components/input/ModelSelector";
import { getProviderConfig } from "@/lib/models/providers";
import type { Message, Model } from "@/lib/types";
import { AUTO_MODEL_ID, MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT } from "@/lib/constants";
import Image from "next/image";
import { cn } from "@/lib/utils";

type DemoScenario = {
  question: string;
  modelId: string;
  modelName: string;
  provider: string;
  answer: string;
};

// Fallback scenarios if API fails (ensuring unique models per scenario)
const FALLBACK_SCENARIOS: DemoScenario[] = [
  {
    question: "Explain async/await in JavaScript",
    modelId: "openai/gpt-4o",
    modelName: "GPT-4o",
    provider: "OpenAI",
    answer: "Async/await is syntactic sugar for Promises. The `async` keyword makes a function return a Promise, while `await` pauses execution until the Promise resolves. It makes asynchronous code look synchronous, improving readability."
  },
  {
    question: "Solve: If a train travels 120 km in 2 hours, and another train travels 180 km in 3 hours, which train is faster and by how much?",
    modelId: "anthropic/claude-3.5-sonnet",
    modelName: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    answer: `<think>
To solve this problem, I need to calculate the speed of each train and compare them.

Train 1:
- Distance: 120 km
- Time: 2 hours
- Speed = Distance / Time = 120 km / 2 hours = 60 km/h

Train 2:
- Distance: 180 km
- Time: 3 hours
- Speed = Distance / Time = 180 km / 3 hours = 60 km/h

Both trains have the same speed of 60 km/h. Therefore, neither train is faster - they travel at the same speed.
</think>

Train 1 travels at 120 km ÷ 2 hours = **60 km/h**

Train 2 travels at 180 km ÷ 3 hours = **60 km/h**

Both trains travel at the same speed of 60 km/h, so neither is faster. They have identical speeds despite covering different distances.`
  },
  {
    question: "Write a haiku about coding",
    modelId: "google/gemini-pro",
    modelName: "Gemini Pro",
    provider: "Google",
    answer: "Lines of logic flow,\nSyntax shapes the digital realm,\nCode becomes art form."
  },
];

type AnimationPhase = "question" | "model-switch" | "answer" | "pause";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Select unique flagship models for each category
 */
function selectUniqueFlagshipModels(models: Model[]): {
  coding?: Model;
  math?: Model;
  general?: Model;
  creative?: Model;
} {
  const flagshipModels = models.filter(m => m.flagship === true);
  if (flagshipModels.length === 0) return {};

  const usedModelIds = new Set<string>();
  const selected: {
    coding?: Model;
    math?: Model;
    general?: Model;
    creative?: Model;
  } = {};

  // Define categories with their sorting functions
  const categories = [
    {
      name: 'coding' as const,
      sortBy: (m: Model) => m.codingIndex || 0,
      getModel: () => selected.coding
    },
    {
      name: 'math' as const,
      sortBy: (m: Model) => m.mathIndex || 0,
      getModel: () => selected.math
    },
    {
      name: 'general' as const,
      sortBy: (m: Model) => m.intelligenceIndex || 0,
      getModel: () => selected.general
    },
    {
      name: 'creative' as const,
      sortBy: (m: Model) => {
        const coding = m.codingIndex || 0;
        const math = m.mathIndex || 0;
        const intelligence = m.intelligenceIndex || 0;
        return (coding + math + intelligence) / 3;
      },
      getModel: () => selected.creative
    }
  ];

  // Select unique model for each category
  for (const category of categories) {
    const sorted = [...flagshipModels].sort((a, b) => category.sortBy(b) - category.sortBy(a));
    const model = sorted.find(m => !usedModelIds.has(m.id));
    if (model) {
      selected[category.name] = model;
      usedModelIds.add(model.id); // Prevent reuse
    }
  }

  return selected;
}

/**
 * Generate demo scenarios from selected models
 */
function generateScenarios(selectedModels: {
  coding?: Model;
  math?: Model;
  general?: Model;
  creative?: Model;
}): DemoScenario[] {
  const scenarios: DemoScenario[] = [];

  // Coding scenario
  if (selectedModels.coding) {
    scenarios.push({
      question: "Explain async/await in JavaScript",
      modelId: selectedModels.coding.id,
      modelName: selectedModels.coding.name,
      provider: selectedModels.coding.provider,
      answer: "Async/await is syntactic sugar for Promises. The `async` keyword makes a function return a Promise, while `await` pauses execution until the Promise resolves. It makes asynchronous code look synchronous, improving readability and making error handling easier with try/catch blocks."
    });
  }

  // Math scenario with thinking
  if (selectedModels.math) {
    scenarios.push({
      question: "Solve: If a train travels 120 km in 2 hours, and another train travels 180 km in 3 hours, which train is faster and by how much?",
      modelId: selectedModels.math.id,
      modelName: selectedModels.math.name,
      provider: selectedModels.math.provider,
      answer: `<think>
To solve this problem, I need to calculate the speed of each train and compare them.

Train 1:
- Distance: 120 km
- Time: 2 hours
- Speed = Distance / Time = 120 km / 2 hours = 60 km/h

Train 2:
- Distance: 180 km
- Time: 3 hours
- Speed = Distance / Time = 180 km / 3 hours = 60 km/h

Both trains have the same speed of 60 km/h. Therefore, neither train is faster - they travel at the same speed.
</think>

Train 1 travels at 120 km ÷ 2 hours = **60 km/h**

Train 2 travels at 180 km ÷ 3 hours = **60 km/h**

Both trains travel at the same speed of 60 km/h, so neither is faster. They have identical speeds despite covering different distances.`
    });
  }

  // General scenario
  if (selectedModels.general) {
    scenarios.push({
      question: "Compare React and Vue.js",
      modelId: selectedModels.general.id,
      modelName: selectedModels.general.name,
      provider: selectedModels.general.provider,
      answer: "React uses a virtual DOM and JSX, emphasizing component composition. Vue.js offers a template-based approach with a more gradual learning curve. React has a larger ecosystem, while Vue provides better out-of-the-box tooling. Both are excellent choices depending on team preferences."
    });
  }

  // Creative scenario
  if (selectedModels.creative) {
    scenarios.push({
      question: "Write a haiku about coding",
      modelId: selectedModels.creative.id,
      modelName: selectedModels.creative.name,
      provider: selectedModels.creative.provider,
      answer: "Lines of logic flow,\nSyntax shapes the digital realm,\nCode becomes art form."
    });
  }

  // If no scenarios generated, return at least one fallback
  if (scenarios.length === 0) {
    return [FALLBACK_SCENARIOS[0]];
  }

  return scenarios;
}

export function ChatDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState(AUTO_MODEL_ID);
  const [phase, setPhase] = useState<AnimationPhase>("question");
  const [isInView, setIsInView] = useState(false);
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const typingCleanupRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);
  const typeTextRef = useRef<((text: string, messageId: string, speed?: number) => () => void) | null>(null);

  // Fetch models from API
  const { data: modelsData, error: modelsError } = useSWR<{ models: Model[] }>("/api/models", fetcher);
  const availableModels = modelsData?.models || [];

  // Generate scenarios from flagship models
  const demoScenarios = useMemo(() => {
    if (availableModels.length > 0) {
      const selectedModels = selectUniqueFlagshipModels(availableModels);
      const scenarios = generateScenarios(selectedModels);
      if (scenarios.length > 0) {
        return scenarios;
      }
    }
    // Fallback to hardcoded scenarios
    return FALLBACK_SCENARIOS;
  }, [availableModels]);

  const currentScenario = demoScenarios[scenarioIndex % demoScenarios.length];

  // Intersection Observer to detect when component is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.3, rootMargin: "0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const typeText = useCallback((text: string, messageId: string, speed: number = 30) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: text.slice(0, index + 1), isStreaming: true }
            : msg
        ));
        index++;
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isStreaming: false }
            : msg
        ));
        clearInterval(interval);
      }
    }, speed);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Keep typeTextRef up to date
  typeTextRef.current = typeText;

  useEffect(() => {
    if (!isInView || demoScenarios.length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const runAnimation = () => {
      if (typingCleanupRef.current) {
        typingCleanupRef.current();
        typingCleanupRef.current = null;
      }

      switch (phase) {
        case "question":
          // Add user message
          const userMessageId = `user-${Date.now()}`;
          const now = Date.now();
          setMessages(prev => {
            if (prev.some(msg => msg.id === userMessageId)) {
              return prev;
            }
            const newMessages: Message[] = [...prev, {
              id: userMessageId,
              role: MESSAGE_ROLE_USER,
              content: "",
              createdAt: now,
              isStreaming: true
            }];
            // Keep only last 8 messages (4 Q&A pairs)
            return newMessages.slice(-8);
          });
          if (!typeTextRef.current) {
            return;
          }
          typingCleanupRef.current = typeTextRef.current(currentScenario.question, userMessageId, 50);
          timeoutId = setTimeout(() => {
            setPhase("model-switch");
          }, currentScenario.question.length * 50 + 300);
          break;

        case "model-switch":
          // Animate model switch
          setIsModelSwitching(true);
          setSelectedModel(currentScenario.modelId);
          
          // Add assistant message placeholder
          const assistantMessageId = `assistant-${Date.now()}`;
          lastAssistantMessageIdRef.current = assistantMessageId;
          const assistantNow = Date.now();
          setMessages(prev => {
            if (prev.some(msg => msg.id === assistantMessageId)) {
              return prev;
            }
            const newMessages: Message[] = [...prev, {
              id: assistantMessageId,
              role: MESSAGE_ROLE_ASSISTANT,
              content: "",
              createdAt: assistantNow,
              model: currentScenario.modelId,
              isStreaming: true
            }];
            return newMessages.slice(-8);
          });
          
          setTimeout(() => {
            setIsModelSwitching(false);
          }, 600);
          
          timeoutId = setTimeout(() => {
            setPhase("answer");
          }, 600);
          break;

        case "answer":
          if (lastAssistantMessageIdRef.current) {
            if (!typeTextRef.current) {
              return;
            }
            typingCleanupRef.current = typeTextRef.current(currentScenario.answer, lastAssistantMessageIdRef.current, 25);
            const answerDuration = currentScenario.answer.length * 25;
            timeoutId = setTimeout(() => {
              setPhase("pause");
            }, answerDuration + 500);
          }
          break;

        case "pause":
          timeoutId = setTimeout(() => {
            setScenarioIndex((prev) => (prev + 1) % demoScenarios.length);
            setPhase("question");
          }, 2500);
          break;
      }
    };

    runAnimation();

    return () => {
      clearTimeout(timeoutId);
      if (typingCleanupRef.current) {
        typingCleanupRef.current();
        typingCleanupRef.current = null;
      }
    };
  }, [phase, scenarioIndex, currentScenario, isInView, demoScenarios.length]);

  // Get provider icon for messages
  const getProviderIcon = useCallback((message: Message) => {
    if (message.role === MESSAGE_ROLE_USER || !message.model) return undefined;

    const model = availableModels.find(m => m.id === message.model);
    if (!model) return undefined;

    const config = getProviderConfig(model.provider);
    const Icon = config.icon;

    if (config.logoUrl) {
      return (
        <Image
          src={config.logoUrl}
          alt={config.displayName}
          width={14}
          height={14}
          className="object-contain"
          unoptimized
        />
      );
    }

    return <Icon className={cn("h-4 w-4", config.color)} />;
  }, [availableModels]);

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col relative overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/30 bg-background/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
           <ModelSelector
              selectedModelId={selectedModel}
              onModelChange={() => {}}
            />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-24">
         <div className="max-w-3xl mx-auto w-full h-full flex flex-col pt-4">
            <MessageList 
              className="pb-4"
              messages={messages}
              availableModels={availableModels}
              getProviderIcon={getProviderIcon}
            />
         </div>
      </div>

      {/* Message Composer - Absolute Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
         <MessageComposer
            onSend={() => {}}
            placeholder="Message Trew..."
            disabled={true}
            className="bg-transparent border-t-0"
         />
      </div>
    </div>
  );
}
