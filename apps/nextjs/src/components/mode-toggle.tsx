"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { THEME_STRINGS } from "@saasfly/common";
import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { Laptop, Moon, Sun } from "@saasfly/ui/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";

type Theme = "light" | "dark" | "system";

const THEMES: Theme[] = ["light", "dark", "system"];

/**
 * ModeToggle - Theme switching component with keyboard shortcut support
 *
 * Features:
 * - Keyboard shortcut: Cmd/Ctrl + Shift + L to cycle themes
 * - Tooltip with shortcut hint for discoverability
 * - Cycles through: light → dark → system → light
 * - Smooth icon animations
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <ModeToggle />
 * ```
 */
export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + Shift + L to cycle themes
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd/Ctrl + Shift + L
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();

        // Get current theme index and cycle to next
        const currentTheme = (theme ?? "system") as Theme;
        const currentIndex = THEMES.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const nextTheme = THEMES[nextIndex] as string;

        setTheme(nextTheme);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [theme, setTheme]);

  // Determine current icon to show based on resolved theme
  const currentIcon = mounted ? (
    resolvedTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
  ) : (
    // Show both icons during SSR to avoid hydration mismatch
    <>
      <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </>
  );

  // Format shortcut based on platform
  const shortcutLabel = React.useMemo(() => {
    const isMac =
      typeof navigator !== "undefined" &&
      /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    return isMac ? "⌘⇧L" : "Ctrl+Shift+L";
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-8 w-8 px-0"
                aria-label={
                  mounted
                    ? `Toggle theme (current: ${theme ?? "system"})`
                    : "Toggle theme"
                }
              >
                {currentIcon}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>{THEME_STRINGS.light}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>{THEME_STRINGS.dark}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" />
              <span>{THEME_STRINGS.system}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom" sideOffset={8}>
          <p>Toggle theme</p>
          <p className="text-xs text-muted-foreground">{shortcutLabel}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
