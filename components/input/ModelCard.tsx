"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Check, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { getProviderConfig } from "@/lib/models/providers";
import type { Model } from "./ModelSelector";

interface ModelCardProps {
  model: Model;
  isSelected: boolean;
  onClick: () => void;
  showProvider?: boolean;
}

export function ModelCard({ model, isSelected, onClick, showProvider = false }: ModelCardProps) {
  const modelProviderConfig = getProviderConfig(model.provider);
  const ModelIcon = modelProviderConfig.icon || Brain;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 text-left group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Retro button styling - clearer distinction between states
        isSelected
          ? cn(
            "border-primary/60 bg-primary/5",
            "shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),inset_0_0_0_1px_rgba(var(--primary),0.1)]",
            "ring-1 ring-primary/20"
          )
          : cn(
            "border-border/60 bg-card",
            "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
            "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
          )
      )}
      aria-selected={isSelected}
      role="option"
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground shadow-sm">
            <Check className="h-3 w-3 stroke-[3]" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 transition-all duration-200 overflow-hidden",
            "border",
            isSelected
              ? "bg-primary/15 border-primary/20 shadow-inner"
              : "bg-muted/40 border-border/40 shadow-sm group-hover:bg-muted/60"
          )}
        >
          {modelProviderConfig.logoUrl ? (
            <Image
              src={modelProviderConfig.logoUrl}
              alt={`${modelProviderConfig.displayName} logo`}
              width={20}
              height={20}
              className={cn(
                "object-contain transition-opacity",
                isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"
              )}
              unoptimized
            />
          ) : (
            <ModelIcon className={cn("h-5 w-5", modelProviderConfig.color)} />
          )}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className={cn(
            "text-sm font-bold truncate leading-tight transition-colors",
            isSelected ? "text-primary" : "text-foreground group-hover:text-foreground/90"
          )}>
            {model.name}
          </h3>
          {showProvider && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate font-medium opacity-80">
              {model.provider}
            </p>
          )}
        </div>
      </div>

      {/* Description - Only show if enough space or filtered */}
      {model.description && (
        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed font-medium">
          {model.description}
        </p>
      )}

      {/* Capabilities */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto pt-2">
        {model.capabilities?.contextWindow && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-5 font-medium border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
          >
            {model.capabilities.contextWindow}
          </Badge>
        )}
        {model.capabilities?.speed && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-5 font-medium border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
          >
            {model.capabilities.speed}
          </Badge>
        )}
        {model.intelligenceIndex && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-5 font-medium border border-border/50 bg-muted/30 text-muted-foreground hover:bg-muted/50"
          >
            IQ: {model.intelligenceIndex.toFixed(1)}
          </Badge>
        )}
      </div>
    </button>
  );
}
