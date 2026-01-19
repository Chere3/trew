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
    modelLabel: "GPT-4o",
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
    modelLabel: "GPT-4o",
    answer: "The capital of Bhutan is Thimphu. It's located in the western part of the country and serves as both the political and economic center of Bhutan."
  },
  {
    question: "Compare React and Vue.js",
    model: "Claude",
    modelLabel: "Claude 3.5 Sonnet",
    answer: "React uses a virtual DOM and JSX, emphasizing component composition. Vue.js offers a template-based approach with a more gradual learning curve. React has a larger ecosystem, while Vue provides better out-of-the-box tooling. Both are excellent choices depending on team preferences."
  },
];

type AnimationPhase = "question" | "model-switch" | "answer" | "pause";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model?: string; // For assistant messages
  isTyping?: boolean;
};

export function ChatDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentModelLabel, setCurrentModelLabel] = useState("");
  const [phase, setPhase] = useState<AnimationPhase>("question");
  const [isTyping, setIsTyping] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const [previousModel, setPreviousModel] = useState<string>("");
  const typingCleanupRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);
  const typeTextRef = useRef<((text: string, messageId: string, speed?: number) => () => void) | null>(null);

  const currentScenario = DEMO_SCENARIOS[scenarioIndex];

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

  const scrollToBottom = useCallback((force: boolean = false) => {
    // Only scroll if component is in view (unless forced)
    if (!force && !isInView) return;
    
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      // Find the scrollable container (the chat messages area)
      const chatContainer = messagesEndRef.current?.parentElement;
      if (chatContainer && messagesEndRef.current) {
        // Scroll the container directly instead of using scrollIntoView
        // This prevents page scroll
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    });
  }, [isInView]);

  const typeText = useCallback((text: string, messageId: string, speed: number = 30) => {
    setIsTyping(true);
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: text.slice(0, index + 1), isTyping: true }
            : msg
        ));
        index++;
        // Don't scroll on every character - only scroll occasionally during typing
        if (index % 10 === 0) {
          scrollToBottom();
        }
      } else {
        setIsTyping(false);
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isTyping: false }
            : msg
        ));
        // Final scroll when typing completes
        setTimeout(() => scrollToBottom(), 100);
        clearInterval(interval);
      }
    }, speed);
    return () => {
      clearInterval(interval);
      setIsTyping(false);
    };
  }, [scrollToBottom]);

  // Keep typeTextRef up to date (synchronous assignment to avoid race conditions)
  typeTextRef.current = typeText;

  // Track previous message count to only scroll on new messages
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    // Scroll when new messages are added
    if (messages.length > prevMessageCountRef.current) {
      // Force scroll for the first few messages to ensure visibility
      const shouldForce = messages.length <= 2;
      setTimeout(() => scrollToBottom(shouldForce), 200);
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
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
          setMessages(prev => {
            // Prevent duplicate additions (React StrictMode protection)
            if (prev.some(msg => msg.id === userMessageId)) {
              return prev;
            }
            const newMessages: Message[] = [...prev, {
              id: userMessageId,
              role: "user" as const,
              content: "",
              isTyping: true
            }];
            // Keep only last 8 messages (4 Q&A pairs) to prevent accumulation
            return newMessages.slice(-8);
          });
          if (!typeTextRef.current) {
            console.error('typeTextRef.current is not set');
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
          setPreviousModel(currentModelLabel || "");
          setCurrentModelLabel(currentScenario.modelLabel);
          
          // Add assistant message placeholder
          const assistantMessageId = `assistant-${Date.now()}`;
          lastAssistantMessageIdRef.current = assistantMessageId;
          setMessages(prev => {
            // Prevent duplicate additions (React StrictMode protection)
            if (prev.some(msg => msg.id === assistantMessageId)) {
              return prev;
            }
            const newMessages: Message[] = [...prev, {
              id: assistantMessageId,
              role: "assistant" as const,
              content: "",
              model: currentScenario.modelLabel,
              isTyping: false
            }];
            // Keep only last 8 messages (4 Q&A pairs) to prevent accumulation
            return newMessages.slice(-8);
          });
          
          // Scroll to show the new assistant message (force scroll even if not in view initially)
          requestAnimationFrame(() => {
            setTimeout(() => {
              scrollToBottom(true);
            }, 150);
          });
          
          // End animation after transition
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
              console.error('typeTextRef.current is not set');
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
  }, [phase, scenarioIndex]);

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col overflow-hidden box-border">
      {/* Window Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-4 sm:px-6 py-2 sm:py-3 h-10 sm:h-12 shrink-0 w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/40 shadow-sm" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500/40 shadow-sm" />
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500/40 shadow-sm" />
          </div>
          <div className="h-3 sm:h-4 w-px bg-border/50" />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">Trew</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-border/50 bg-background px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-foreground shadow-sm">
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" />
          <span>Auto</span>
          <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-50" />
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col justify-between bg-gradient-to-b from-background via-background to-muted/20 p-3 sm:p-4 md:p-6 h-[calc(100%-1.5rem)] sm:h-[calc(100%-3rem)] w-full max-w-full overflow-hidden box-border">
        <div className="space-y-3 sm:space-y-4 min-h-0 overflow-y-auto">
          {messages.map((message) => (
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end animate-fade-in">
                <div className="group relative max-w-[75%] rounded-2xl rounded-tr-sm bg-primary px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-primary-foreground shadow-lg">
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                    {message.isTyping && (
                      <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 ml-1 bg-primary-foreground/80 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex items-start gap-2 sm:gap-3 md:gap-4 animate-fade-in">
                <div className={`flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20 transition-all duration-500 ${
                  message.isTyping ? "ring-primary/40 scale-105" : ""
                } ${
                  isModelSwitching && message.id === lastAssistantMessageIdRef.current
                    ? "ring-primary/60 scale-110 bg-primary/20 animate-pulse"
                    : ""
                }`}>
                  <Bot className={`h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-primary transition-all duration-500 ${
                    isModelSwitching && message.id === lastAssistantMessageIdRef.current
                      ? "scale-110"
                      : ""
                  }`} />
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3">
                  {/* Model name as author */}
                  {message.model && (
                    <div className="flex items-center gap-2 pl-1">
                      <span className={`text-[10px] sm:text-xs font-medium text-muted-foreground transition-all duration-300 ${
                        isModelSwitching && message.id === lastAssistantMessageIdRef.current
                          ? "text-primary font-semibold animate-pulse scale-105"
                          : ""
                      }`}>
                        {message.model}
                      </span>
                      {isModelSwitching && message.id === lastAssistantMessageIdRef.current && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-primary animate-fade-in">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          Switching...
                        </span>
                      )}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-tl-sm border border-border/50 bg-card/80 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3.5 shadow-sm backdrop-blur-sm">
                    <p className="text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {message.content}
                      {message.isTyping && (
                        <span className="inline-block w-1.5 h-3 sm:w-2 sm:h-4 ml-1 bg-foreground/60 animate-pulse" />
                      )}
                    </p>
                  </div>
                  {!message.isTyping && message.content && (
                    <div className="flex items-center gap-3 sm:gap-4 pl-1 sm:pl-2 animate-fade-in">
                      <button className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-foreground">
                        <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Copy
                      </button>
                      <button className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground transition-colors hover:text-foreground">
                        <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        Regenerate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-3 sm:mt-4 md:mt-6 shrink-0">
          <div className="relative rounded-xl border border-border/50 bg-background shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
            <input 
              type="text"
              placeholder="Message Trew..."
              className="w-full bg-transparent border-0 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
              disabled
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2">
              <button className="flex h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
