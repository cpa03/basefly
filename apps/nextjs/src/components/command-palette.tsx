"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Github,
  Home,
  LayoutDashboard,
  Moon,
  Search,
  Sparkles,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

import { ANIMATION_TIMING, EXTERNAL_URLS, ROUTES } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@saasfly/ui/command";

interface CommandPaletteProps {
  /**
   * Language code for internationalized routes
   */
  lang?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Command Palette - A micro-UX component for quick navigation and actions
 *
 * Features:
 * - Global keyboard shortcut (⌘K / Ctrl+K) to open
 * - Quick navigation to common pages
 * - Theme switching without navigating
 * - Recent items support (stored in localStorage)
 * - Search through available commands
 * - Full keyboard navigation (arrow keys, enter, escape)
 * - Accessible with proper ARIA labels
 * - Respects reduced motion preferences
 * - Auto-detects platform for accurate shortcut labels (⌘ vs Ctrl)
 *
 * @example
 * ```tsx
 * // Basic usage
 * <CommandPalette lang="en" />
 *
 * // In your layout or page
 * <CommandPalette lang={params.lang} />
 * ```
 */
function CommandPalette({ lang = "en", className }: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [recentItems, setRecentItems] = React.useState<string[]>([]);
  const [platform, setPlatform] = React.useState<"mac" | "other">("other");

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    // Detect platform for keyboard shortcut display
    setPlatform(
      typeof window !== "undefined" && navigator.platform.includes("Mac")
        ? "mac"
        : "other",
    );
    // Load recent items from localStorage
    const stored = localStorage.getItem("command-palette-recent");
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (item): item is string => typeof item === "string",
          );
          setRecentItems(validItems.slice(0, 3));
        }
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Don't trigger when user is typing in contenteditable elements
      if (e.target instanceof HTMLElement && e.target.isContentEditable) {
        return;
      }

      // Toggle command palette with ⌘K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Add item to recent items
  const addToRecent = React.useCallback((id: string) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 3);
      localStorage.setItem("command-palette-recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Navigation handlers
  const navigateTo = React.useCallback(
    (path: string, id: string) => {
      addToRecent(id);
      setOpen(false);
      // Small delay for the dialog to close smoothly
      window.setTimeout(() => {
        router.push(path);
      }, ANIMATION_TIMING.fast);
    },
    [addToRecent, router],
  );

  // Theme toggle handler
  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    // Don't close immediately - let user see the change
    window.setTimeout(() => setOpen(false), ANIMATION_TIMING.fast);
  }, [setTheme, theme]);

  // External link handler
  const openExternal = React.useCallback(
    (url: string, id: string) => {
      addToRecent(id);
      setOpen(false);
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [addToRecent],
  );

  if (!mounted) {
    return null;
  }

  const modifierKey = platform === "mac" ? "⌘" : "Ctrl";

  return (
    <>
      {/* Trigger button - shows ⌘K hint */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex h-8 w-full items-center justify-between",
          "rounded-md border border-input bg-background px-3",
          "text-sm text-muted-foreground",
          "transition-all duration-200 ease-out",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "sm:w-64",
          className,
        )}
        aria-label="Open command palette"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 opacity-50" aria-hidden="true" />
          <span className="hidden sm:inline">Search...</span>
          <span className="sm:hidden">Search</span>
        </span>
        <kbd
          className={cn(
            "pointer-events-none hidden h-5 select-none items-center gap-0.5",
            "rounded border bg-muted px-1.5 font-mono text-[10px] font-medium",
            "opacity-70 transition-opacity group-hover:opacity-100",
            "sm:flex",
          )}
        >
          <span className="text-xs">{modifierKey}</span>K
        </kbd>
      </button>

      {/* Command Dialog */}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        aria-label="Command palette"
      >
        <CommandInput
          placeholder="Type a command or search..."
          aria-label="Search commands"
        />
        <CommandList>
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-8 w-8 opacity-50" />
              <p>No commands found.</p>
            </div>
          </CommandEmpty>

          {/* Recent Items */}
          {recentItems.length > 0 && (
            <CommandGroup heading="Recent">
              {recentItems.includes("home") && (
                <CommandItem
                  onSelect={() => navigateTo(`/${lang}`, "home")}
                  className="cursor-pointer"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                  <CommandShortcut>⌘H</CommandShortcut>
                </CommandItem>
              )}
              {recentItems.includes("docs") && (
                <CommandItem
                  onSelect={() => openExternal(EXTERNAL_URLS.docs.home, "docs")}
                  className="cursor-pointer"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Documentation</span>
                  <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                </CommandItem>
              )}
              {recentItems.includes("dashboard") && (
                <CommandItem
                  onSelect={() =>
                    navigateTo(`/${lang}${ROUTES.dashboard.home}`, "dashboard")
                  }
                  className="cursor-pointer"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </CommandItem>
              )}
              {recentItems.includes("github") && (
                <CommandItem
                  onSelect={() =>
                    openExternal(EXTERNAL_URLS.github.repo, "github")
                  }
                  className="cursor-pointer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                </CommandItem>
              )}
              {recentItems.includes("theme") && (
                <CommandItem onSelect={toggleTheme} className="cursor-pointer">
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>Toggle Theme</span>
                  <CommandShortcut>{modifierKey}⇧L</CommandShortcut>
                </CommandItem>
              )}
            </CommandGroup>
          )}

          {recentItems.length > 0 && <CommandSeparator />}

          {/* Navigation Group */}
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => navigateTo(`/${lang}`, "home")}
              className="cursor-pointer"
            >
              <Home className="mr-2 h-4 w-4" />
              <span>Home</span>
              <CommandShortcut>⌘H</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() =>
                navigateTo(`/${lang}${ROUTES.dashboard.home}`, "dashboard")
              }
              className="cursor-pointer"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => openExternal(EXTERNAL_URLS.docs.home, "docs")}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Documentation</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
            <CommandItem
              onSelect={() => openExternal(EXTERNAL_URLS.github.repo, "github")}
              className="cursor-pointer"
            >
              <Github className="mr-2 h-4 w-4" />
              <span>GitHub Repository</span>
              <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Actions Group */}
          <CommandGroup heading="Actions">
            <CommandItem onSelect={toggleTheme} className="cursor-pointer">
              {theme === "dark" ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
              <CommandShortcut>{modifierKey}⇧L</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Help Footer */}
          <div
            className={cn(
              "flex items-center justify-between px-2 py-3 text-xs text-muted-foreground",
              "border-t border-border",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                  ↑↓
                </kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                  ↵
                </kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">
                Esc
              </kbd>
              to close
            </span>
          </div>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export { CommandPalette, type CommandPaletteProps };
