"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ThemeToggleVariant = "dropdown" | "button" | "switch";

interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
  className?: string;
}

export function ThemeToggle({ variant = "dropdown", className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === "switch") {
    // Simple switch for SettingsPanel - only toggles between light/dark
    return (
      <div className={cn("flex items-center justify-between", className)}>
        <div className="space-y-0.5">
          <Label>Dark mode</Label>
          <p className="text-sm text-muted-foreground">
            Switch between light and dark themes
          </p>
        </div>
        <Switch
          checked={resolvedTheme === "dark"}
          onCheckedChange={(checked) => {
            setTheme(checked ? "dark" : "light");
          }}
        />
      </div>
    );
  }

  if (variant === "button") {
    // Cycle through System → Light → Dark → System
    const cycleTheme = () => {
      if (theme === "system") {
        setTheme("light");
      } else if (theme === "light") {
        setTheme("dark");
      } else {
        setTheme("system");
      }
    };

    const getIcon = () => {
      // During SSR, show a consistent default to avoid hydration mismatch
      if (!mounted) {
        return <Sun className="h-4 w-4" />;
      }
      if (theme === "system") {
        return <Monitor className="h-4 w-4" />;
      }
      return resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      );
    };

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={cycleTheme}
        className={className}
        aria-label="Toggle theme"
      >
        {getIcon()}
      </Button>
    );
  }

  // Default: dropdown with all three options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label="Select theme"
        >
          {!mounted ? (
            <Sun className="h-4 w-4" />
          ) : resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(theme === "light" && "bg-accent")}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(theme === "dark" && "bg-accent")}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(theme === "system" && "bg-accent")}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
