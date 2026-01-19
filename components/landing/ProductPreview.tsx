"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, ChevronDown, Sparkles, Send, Copy, RefreshCw } from "lucide-react";

type DemoScenario = {
  question: string;
  model: "auto" | "GPT-4" | "Claude" | "Gemini";
  modelLabel: string;
  answer: string;
};

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    question: "Write a haiku about coding",
    model: "GPT-4",
    modelLabel: "GPT-5o",
    answer: "Lines of logic flow,\nSyntax shapes the digital realm,\nCode becomes art form."
  },
  {
    question: "Explain async/await in JavaScript",
    model: "Claude",
    modelLabel: "Claude 3.5 Sonnet",
    answer: "Async/await is syntactic sugar for Promises. The `async` keyword makes a function return a Promise, while `await` pauses execution until the Promise resolves. It makes asynchronous code look synchronous, improving readability."
  },
  {
    question: "What's the capital of Bhutan?",
    model: "GPT-4",
    modelLabel: "GPT-5o",
    answer: "The capital of Bhutan is Thimphu. It's located in the western part of the country and serves as both the political and economic center of Bhutan."
  },
  {
    question: "Compare React and Vue.js",
    model: "Claude",
    modelLabel: "Claude 3.5 Sonnet",
    answer: "React uses a virtual DOM and JSX, emphasizing component composition. Vue.js offers a template-based approach with a more gradual learning curve. React has a larger ecosystem, while Vue provides better out-of-the-box tooling. Both are excellent choices depending on team preferences."
  },
  {
    question: "Solve this problem: 2x + 5 = 15",
    model: "Claude",
    modelLabel: "Claude 3.5 Sonnet",
    answer: "To solve 2x + 5 = 15:\n\n1. Subtract 5 from both sides: 2x = 10\n2. Divide both sides by 2: x = 5\n\nTherefore, x = 5."
  },
  {
    question: "How would you design a better coffee cup?",
    model: "GPT-4",
    modelLabel: "GPT-5o",
    answer: "A better coffee cup would feature: double-wall insulation for temperature control, an ergonomic handle that fits multiple grip styles, a spill-resistant lid with one-way valve, sustainable materials like bamboo fiber, and a base that prevents condensation rings. The design balances form, function, and environmental impact."
  },
  {
    question: "Describe the benefits of TypeScript",
    model: "Claude",
    modelLabel: "Claude 3.5 Sonnet",
    answer: "TypeScript adds static typing to JavaScript, providing: early error detection, better IDE autocomplete, improved code documentation through types, easier refactoring, and enhanced team collaboration. It compiles to plain JavaScript and is increasingly the standard for large-scale JavaScript projects."
  }
];

type AnimationPhase = "question" | "model-switch" | "answer" | "pause";

export function ProductPreview() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [currentModel, setCurrentModel] = useState<"auto" | "GPT-4" | "Claude" | "Gemini">("auto");
  const [currentModelLabel, setCurrentModelLabel] = useState("Auto");
  const [displayedQuestion, setDisplayedQuestion] = useState("");
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const [phase, setPhase] = useState<AnimationPhase>("question");
  const [isTyping, setIsTyping] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const typingCleanupRef = useRef<(() => void) | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const currentScenario = DEMO_SCENARIOS[scenarioIndex];

  // Intersection Observer to detect when component is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3, // Start animation when 30% of component is visible
        rootMargin: "0px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const typeText = useCallback((text: string, setter: (text: string) => void, speed: number = 30) => {
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setter(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, speed);
    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, []);

  // Reset animation when going out of view
  useEffect(() => {
    if (!isInView) {
      // Clean up animations when not in view
      if (typingCleanupRef.current) {
        typingCleanupRef.current();
        typingCleanupRef.current = null;
      }
      // Reset to initial state
      setDisplayedQuestion("");
      setDisplayedAnswer("");
      setCurrentModel("auto");
      setCurrentModelLabel("Auto");
      setScenarioIndex(0);
      setPhase("question");
      setIsTyping(false);
    }
  }, [isInView]);

  useEffect(() => {
    // Don't run animation if not in view
    if (!isInView) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const runAnimation = () => {
      // Clean up any existing typing animation
      if (typingCleanupRef.current) {
        typingCleanupRef.current();
        typingCleanupRef.current = null;
      }

      switch (phase) {
        case "question":
          // Reset and start typing question
          setDisplayedAnswer("");
          setCurrentModel("auto");
          setCurrentModelLabel("Auto");
          typingCleanupRef.current = typeText(currentScenario.question, setDisplayedQuestion, 50);
          timeoutId = setTimeout(() => {
            setPhase("model-switch");
          }, currentScenario.question.length * 50 + 300);
          break;

        case "model-switch":
          // Switch to appropriate model
          setCurrentModel(currentScenario.model);
          setCurrentModelLabel(currentScenario.modelLabel);
          timeoutId = setTimeout(() => {
            setPhase("answer");
          }, 500);
          break;

        case "answer":
          // Type the answer
          typingCleanupRef.current = typeText(currentScenario.answer, setDisplayedAnswer, 25);
          const answerDuration = currentScenario.answer.length * 25;
          timeoutId = setTimeout(() => {
            setPhase("pause");
          }, answerDuration + 500);
          break;

        case "pause":
          // Pause before next scenario
          timeoutId = setTimeout(() => {
            setFadeKey(prev => prev + 1);
            setDisplayedQuestion("");
            setDisplayedAnswer("");
            setScenarioIndex((prev) => (prev + 1) % DEMO_SCENARIOS.length);
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
  }, [phase, scenarioIndex, currentScenario, typeText, isInView]);
  return (
    <section ref={sectionRef} id="product-preview" className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Beautiful. Unified.{" "}
            <span className="text-primary">Powerful.</span>
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Watch as Trew automatically selects the best AI model for each question. Experience seamless switching between GPT-4, Claude, and Gemini without missing a beat.
          </p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          {/* Glow effect */}
          <div className="absolute -inset-4 rounded-2xl bg-primary/5 blur-2xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/40 shadow-sm" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/40 shadow-sm" />
                    <div className="h-3 w-3 rounded-full bg-green-500/40 shadow-sm" />
                  </div>
                  <div className="h-4 w-px bg-border/50" />
                  <span className="text-xs font-medium text-muted-foreground">Trew</span>
                </div>
                <div 
                  className={`flex items-center gap-2 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-all duration-300 ${
                    phase === "model-switch" 
                      ? "border-primary/50 ring-2 ring-primary/20 scale-105" 
                      : "hover:border-primary/30"
                  }`}
                >
                  <Sparkles className={`h-3.5 w-3.5 text-primary transition-transform duration-300 ${
                    phase === "model-switch" ? "animate-pulse" : ""
                  }`} />
                  <span className="transition-all duration-300">{currentModelLabel}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </div>
                <div className="w-16" />
              </div>

              {/* Chat Area */}
              <div className="flex min-h-[500px] flex-col justify-between bg-gradient-to-b from-background via-background to-muted/20 p-8">
                <div className="space-y-8" key={fadeKey}>
                  {/* User Message */}
                  {displayedQuestion && (
                    <div className="flex justify-end animate-fade-in">
                      <div className="group relative max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-5 py-3 text-primary-foreground shadow-lg">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {displayedQuestion}
                          {isTyping && phase === "question" && (
                            <span className="inline-block w-2 h-4 ml-1 bg-primary-foreground/80 animate-pulse" />
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Response */}
                  {displayedAnswer && (
                    <div className="flex items-start gap-4 animate-fade-in">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20 transition-all duration-300 ${
                        phase === "answer" && isTyping ? "ring-primary/40 scale-105" : ""
                      }`}>
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-card/80 px-5 py-3.5 shadow-sm backdrop-blur-sm">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                            {displayedAnswer}
                            {isTyping && phase === "answer" && (
                              <span className="inline-block w-2 h-4 ml-1 bg-foreground/60 animate-pulse" />
                            )}
                          </p>
                        </div>
                        {!isTyping && phase !== "answer" && (
                          <div className="flex items-center gap-4 pl-2 animate-fade-in">
                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                              <Copy className="h-3.5 w-3.5" />
                              Copy
                            </button>
                            <button className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                              <RefreshCw className="h-3.5 w-3.5" />
                              Regenerate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="mt-8 space-y-3">
                  <div className="relative rounded-xl border border-border/50 bg-background shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                    <input 
                      type="text"
                      placeholder="Message Trew..."
                      className="w-full bg-transparent border-0 px-5 py-4 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
                      disabled
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground/70">
                    Press <kbd className="rounded border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px]">Enter</kbd> to send · Switch models seamlessly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
