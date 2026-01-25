"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Bot, Brain, ChevronDown, Check, Loader2, Zap, Code, Cpu, Search, X, Star, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { getProviderConfig, normalizeProviderName } from "@/lib/models/providers";
import { ModelCard } from "./ModelCard";
import type { Model } from "@/lib/types";
import { AUTO_MODEL_ID, PROVIDER_NAMES, MODEL_SPEED_FAST } from "@/lib/constants";

export type { Model }

// Auto model - always available
export const AUTO_MODEL: Model = {
  id: AUTO_MODEL_ID,
  name: "Auto",
  provider: PROVIDER_NAMES.TREW,
  icon: "Wand2",
  color: "text-primary",
  description: "Intelligently selects the best model for your task",
  flagship: true,
  capabilities: {
    contextWindow: "Varies",
    speed: MODEL_SPEED_FAST,
    specialty: ["Smart Routing", "Adaptive"],
  },
};

// Fallback models if API fails
export const AVAILABLE_MODELS: Model[] = [
  AUTO_MODEL,
  {
    id: "gpt-5o",
    name: "GPT-5o",
    provider: "OpenAI",
    icon: "Sparkles",
    color: "text-green-600 dark:text-green-400",
    description: "Fast and efficient",
    flagship: true,
    capabilities: {
      contextWindow: "128K",
      speed: "fast",
      specialty: ["General", "Code"],
    },
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    icon: "Bot",
    color: "text-blue-600 dark:text-blue-400",
    description: "Balanced performance",
    flagship: true,
    capabilities: {
      contextWindow: "200K",
      speed: "medium",
      specialty: ["Analysis", "Writing"],
    },
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    icon: "Brain",
    color: "text-purple-600 dark:text-purple-400",
    description: "Multimodal capabilities",
    flagship: true,
    capabilities: {
      contextWindow: "1M",
      speed: "medium",
      specialty: ["Multimodal", "Research"],
    },
  },
];

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Bot,
  Brain,
  Zap,
  Code,
  Cpu,
  Wand2,
};

function getIconComponent(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || Brain;
}

export interface ModelSelectorProps {
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({
  selectedModelId = AUTO_MODEL_ID,
  onModelChange,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<Model[]>(AVAILABLE_MODELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/models");

        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();
        if (data.models && Array.isArray(data.models) && data.models.length > 0) {
          // Always prepend Auto model to API results
          setModels([AUTO_MODEL, ...data.models.filter((m: Model) => m.id !== AUTO_MODEL_ID)]);
        } else {
          // Fallback to default models if API returns empty
          setModels(AVAILABLE_MODELS);
        }
      } catch (err) {
        console.error("Error fetching models:", err);
        setError(err instanceof Error ? err.message : "Failed to load models");
        // Use fallback models on error
        setModels(AVAILABLE_MODELS);
      } finally {
        setLoading(false);
      }
    }

    fetchModels();
  }, []);

  // Find selected model
  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];
  const selectedModelProviderConfig = getProviderConfig(selectedModel.provider);
  const SelectedIcon = selectedModelProviderConfig.icon || Brain;

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models;

    const query = searchQuery.toLowerCase().trim();
    return models.filter((model) => {
      const nameMatch = model.name.toLowerCase().includes(query);
      const providerMatch = model.provider.toLowerCase().includes(query);
      const descriptionMatch = model.description?.toLowerCase().includes(query);
      return nameMatch || providerMatch || descriptionMatch;
    });
  }, [models, searchQuery]);

  // Group models by provider and separate flagship from non-flagship
  // Also extract Auto model for special display
  const groupedModels = useMemo(() => {
    const flagshipByProvider = new Map<string, Model[]>();
    const nonFlagship: Model[] = [];
    let autoModel: Model | null = null;

    filteredModels.forEach((model) => {
      // Extract Auto model separately
      if (model.id === AUTO_MODEL_ID) {
        autoModel = model;
        return;
      }

      if (model.flagship) {
        const normalizedProvider = normalizeProviderName(model.provider);
        if (!flagshipByProvider.has(normalizedProvider)) {
          flagshipByProvider.set(normalizedProvider, []);
        }
        flagshipByProvider.get(normalizedProvider)!.push(model);
      } else {
        nonFlagship.push(model);
      }
    });

    // Sort flagship models within each provider by rank or name
    flagshipByProvider.forEach((models, provider) => {
      models.sort((a, b) => {
        if (a.rank !== undefined && b.rank !== undefined) {
          return a.rank - b.rank;
        }
        return a.name.localeCompare(b.name);
      });
    });

    // Sort non-flagship models
    nonFlagship.sort((a, b) => {
      const providerCompare = a.provider.localeCompare(b.provider);
      if (providerCompare !== 0) return providerCompare;
      return a.name.localeCompare(b.name);
    });

    return { flagshipByProvider, nonFlagship, autoModel };
  }, [filteredModels]);

  // Clear search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <div className={cn("border-b border-border/50 bg-background/80 backdrop-blur-sm", className)}>
      <div className="px-4 py-2 flex justify-center">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex items-center gap-2 h-auto py-1.5 px-3",
                "rounded-lg border border-border/50 bg-background",
                "text-xs font-medium text-foreground shadow-sm",
                "hover:bg-muted/50 hover:text-foreground",
                "transition-all duration-200",
                open && "bg-muted/50"
              )}
              aria-label="Select AI model"
              aria-expanded={open}
            >
              <div className="flex items-center gap-2">
                {selectedModelProviderConfig.logoUrl ? (
                  <Image
                    src={selectedModelProviderConfig.logoUrl}
                    alt={`${selectedModelProviderConfig.displayName} logo`}
                    width={14}
                    height={14}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <SelectedIcon className="h-3.5 w-3.5 text-primary" />
                )}
                <span>{selectedModel.name}</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-muted-foreground/70 transition-transform duration-200 ml-1",
                  open && "rotate-180"
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className={cn(
              "w-[640px] p-0 overflow-hidden",
              // Retro popover with heavier shadows and bezel
              "bg-gradient-to-b from-card to-background",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_12px_36px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)]",
              "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_36px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)]",
              "border-none ring-1 ring-border/50",
              "rounded-xl"
            )}
            align="center"
            sideOffset={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {/* Search Input Area */}
                <div className="relative p-4 bg-muted/30 border-b border-border/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 opacity-70" />
                    <Input
                      type="search"
                      placeholder="Find a model..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={cn(
                        "pl-9 pr-9 h-10 w-full",
                        "bg-background/50",
                        "shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]",
                        "border-transparent focus:border-primary/20",
                        "ring-1 ring-border/50 focus:ring-primary/20",
                        "rounded-lg",
                        "placeholder:text-muted-foreground/60"
                      )}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                        aria-label="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Models List */}
                <ScrollArea className="h-[500px]">
                  {filteredModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                        <Search className="h-5 w-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        No models found
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Try searching for something else
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 p-5 pr-6">
                      {/* Smart Routing Section - Auto Model */}
                      {groupedModels.autoModel && (
                        <div className="flex flex-col gap-3">
                          {/* Smart Routing Header */}
                          <div className="flex items-center gap-2.5 px-1 py-1">
                            <div className={cn(
                              "flex items-center justify-center w-6 h-6 rounded-md",
                              "bg-primary/10",
                              "border border-primary/20"
                            )}>
                              <Wand2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <h2 className="text-sm font-semibold text-foreground/80 tracking-tight">
                              Smart Routing
                            </h2>
                            <div className="flex-1 h-px bg-gradient-to-r from-primary/20 to-transparent ml-2" />
                          </div>

                          {/* Auto Model Card */}
                          <div className="grid grid-cols-1 gap-3">
                            <ModelCard
                              model={groupedModels.autoModel}
                              isSelected={selectedModelId === AUTO_MODEL_ID}
                              onClick={() => {
                                onModelChange?.(AUTO_MODEL_ID);
                                setOpen(false);
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Provider Sections with Flagship Models */}
                      {Array.from(groupedModels.flagshipByProvider.entries())
                        .sort(([a], [b]) => {
                          const configA = getProviderConfig(a);
                          const configB = getProviderConfig(b);
                          return configA.displayName.localeCompare(configB.displayName);
                        })
                        .map(([provider, providerModels]) => {
                          const providerConfig = getProviderConfig(provider);
                          const ProviderIcon = providerConfig.icon;

                          return (
                            <div key={provider} className="flex flex-col gap-3">
                              {/* Provider Header */}
                              <div className="flex items-center gap-2.5 px-1 py-1">
                                <div className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-md",
                                  "bg-muted/50",
                                  "border border-border/20"
                                )}>
                                  {providerConfig.logoUrl ? (
                                    <Image
                                      src={providerConfig.logoUrl}
                                      alt={`${providerConfig.displayName} logo`}
                                      width={14}
                                      height={14}
                                      className="object-contain"
                                      unoptimized
                                    />
                                  ) : (
                                    <ProviderIcon className={cn("h-3.5 w-3.5", providerConfig.color)} />
                                  )}
                                </div>
                                <h2 className="text-sm font-semibold text-foreground/80 tracking-tight">
                                  {providerConfig.displayName}
                                </h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-border/40 to-transparent ml-2" />
                              </div>

                              {/* Provider Models Grid */}
                              <div className="grid grid-cols-2 gap-3">
                                {providerModels.map((model) => {
                                  const isSelected = model.id === selectedModelId;
                                  return (
                                    <ModelCard
                                      key={model.id}
                                      model={model}
                                      isSelected={isSelected}
                                      onClick={() => {
                                        onModelChange?.(model.id);
                                        setOpen(false);
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                      {/* Other Models Section */}
                      {groupedModels.nonFlagship.length > 0 && (
                        <div className="flex flex-col gap-4 pt-4 border-t border-border/40 border-dashed">
                          {/* Other Models Header */}
                          <div className="flex items-center gap-2.5 px-1">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Other Models
                            </span>
                            <div className="flex-1 h-px bg-border/40" />
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 h-4.5 font-medium rounded-sm bg-muted text-muted-foreground hover:bg-muted"
                            >
                              {groupedModels.nonFlagship.length}
                            </Badge>
                          </div>

                          {/* Other Models Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {groupedModels.nonFlagship.map((model) => {
                              const isSelected = model.id === selectedModelId;

                              return (
                                <ModelCard
                                  key={model.id}
                                  model={model}
                                  isSelected={isSelected}
                                  onClick={() => {
                                    onModelChange?.(model.id);
                                    setOpen(false);
                                  }}
                                  showProvider={true}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Footer/Status */}
                {error && models.length === AVAILABLE_MODELS.length && (
                  <div className={cn(
                    "px-4 py-2 text-[10px] text-muted-foreground border-t border-border/50",
                    "bg-muted/20"
                  )}>
                    Using offline fallback. {error}
                  </div>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
