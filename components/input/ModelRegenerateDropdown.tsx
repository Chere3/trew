"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RefreshCw, Search, X, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProviderConfig, normalizeProviderName } from "@/lib/models/providers";
import type { Model } from "./ModelSelector";
import { ModelCard } from "./ModelCard";

export interface ModelRegenerateDropdownProps {
  models: Model[];
  currentModelId?: string;
  onModelSelect: (modelId: string) => void;
  className?: string;
}

export function ModelRegenerateDropdown({
  models,
  currentModelId,
  onModelSelect,
  className,
}: ModelRegenerateDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Group models: flagship by provider, then others
  const groupedModels = useMemo(() => {
    const flagshipByProvider = new Map<string, Model[]>();
    const nonFlagship: Model[] = [];
    let autoModel: Model | null = null;

    filteredModels.forEach((model) => {
      if (model.id === "auto") {
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

  // Clear search when dropdown closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-7 w-7 p-0 hover:bg-muted", className)}
          title="Regenerate with different model"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "w-[480px] p-0 overflow-hidden",
          "bg-gradient-to-b from-card to-background",
          "shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_12px_36px_rgba(0,0,0,0.15),0_4px_12px_rgba(0,0,0,0.08)]",
          "dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_36px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)]",
          "border-none ring-1 ring-border/50",
          "rounded-xl"
        )}
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col gap-0">
          {/* Search Input */}
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
                autoFocus
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
          <ScrollArea className="h-[400px]">
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
              <div className="flex flex-col gap-4 p-4">
                {/* Auto Model */}
                {groupedModels.autoModel && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-1">
                      <Wand2 className="h-3.5 w-3.5 text-primary" />
                      <DropdownMenuLabel className="text-xs font-semibold text-foreground/80 tracking-tight px-0 py-0">
                        Smart Routing
                      </DropdownMenuLabel>
                    </div>
                    <ModelCard
                      model={groupedModels.autoModel}
                      isSelected={currentModelId === "auto"}
                      onClick={() => {
                        onModelSelect("auto");
                        setOpen(false);
                      }}
                    />
                  </div>
                )}

                {/* Flagship Models by Provider */}
                {groupedModels.flagshipByProvider.size > 0 && (
                  <>
                    {groupedModels.autoModel && <DropdownMenuSeparator />}
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
                          <div key={provider} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-1">
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
                              <DropdownMenuLabel className="text-xs font-semibold text-foreground/80 tracking-tight px-0 py-0">
                                {providerConfig.displayName}
                              </DropdownMenuLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {providerModels.map((model) => (
                                <ModelCard
                                  key={model.id}
                                  model={model}
                                  isSelected={currentModelId === model.id}
                                  onClick={() => {
                                    onModelSelect(model.id);
                                    setOpen(false);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                  </>
                )}

                {/* Other Models */}
                {groupedModels.nonFlagship.length > 0 && (
                  <>
                    {(groupedModels.flagshipByProvider.size > 0 || groupedModels.autoModel) && (
                      <DropdownMenuSeparator />
                    )}
                    <div className="flex flex-col gap-2">
                      <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 py-0">
                        Other Models
                      </DropdownMenuLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {groupedModels.nonFlagship.map((model) => (
                          <ModelCard
                            key={model.id}
                            model={model}
                            isSelected={currentModelId === model.id}
                            onClick={() => {
                              onModelSelect(model.id);
                              setOpen(false);
                            }}
                            showProvider={true}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
