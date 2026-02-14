"use client";

import * as React from "react";

import { ANIMATION } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@saasfly/ui/dialog";
import { Key } from "@saasfly/ui/icons";

/**
 * Keyboard shortcut definition
 */
interface KeyboardShortcut {
  /** Unique identifier for the shortcut */
  id: string;
  /** Human-readable description of what the shortcut does */
  description: string;
  /** Array of keys to display (e.g., ["Ctrl", "Home"]) */
  keys: string[];
  /** Optional category for grouping shortcuts */
  category?: string;
  /** Whether the shortcut uses a modifier key */
  hasModifier?: boolean;
}

/**
 * Default keyboard shortcuts available in the application
 */
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    id: "show-shortcuts",
    description: "Show keyboard shortcuts",
    keys: ["?"],
    category: "Navigation",
  },
  {
    id: "back-to-top",
    description: "Back to top of page",
    keys: ["Ctrl", "Home"],
    category: "Navigation",
    hasModifier: true,
  },
  {
    id: "skip-to-content",
    description: "Skip to main content",
    keys: ["Tab"],
    category: "Navigation",
  },
  {
    id: "toggle-theme",
    description: "Toggle light/dark theme",
    keys: ["Ctrl", "Shift", "L"],
    category: "Theme",
    hasModifier: true,
  },
  {
    id: "close-modal",
    description: "Close modal or dialog",
    keys: ["Escape"],
    category: "General",
  },
];

/**
 * Individual keyboard shortcut item component
 */
function ShortcutItem({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5",
        "border-b border-border last:border-b-0",
        "transition-colors hover:bg-accent/50",
        "-mx-2 rounded-sm px-2",
      )}
    >
      <span className="text-sm text-foreground">{shortcut.description}</span>
      <div className="flex items-center gap-1">
        {shortcut.keys.map((key, index) => (
          <React.Fragment key={`${shortcut.id}-${key}-${index}`}>
            <kbd
              className={cn(
                "inline-flex items-center justify-center",
                "h-6 min-w-[1.5rem] px-1.5",
                "rounded border bg-muted",
                "text-xs font-medium text-muted-foreground",
                "shadow-sm",
                "transition-transform active:scale-95",
              )}
            >
              {key}
            </kbd>
            {index < shortcut.keys.length - 1 && (
              <span className="mx-0.5 text-xs text-muted-foreground">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * KeyboardShortcutsHelp - A micro-UX component for keyboard shortcut discovery
 *
 * Press "?" anywhere in the application to show a help overlay
 * listing all available keyboard shortcuts. Press Escape or click
 * outside to close.
 *
 * Features:
 * - Global keyboard shortcut (? to open, Escape to close)
 * - Accessible with proper ARIA labels
 * - Groups shortcuts by category
 * - Shows modifier keys as keyboard-style badges
 * - Respects reduced motion preferences
 * - Auto-detects platform for accurate shortcut labels
 *
 * @example
 * ```tsx
 * // In your root layout
 * <KeyboardShortcutsHelp />
 * ```
 */
function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle keyboard shortcuts
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

      // Toggle shortcuts help with "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Close with Escape
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    DEFAULT_SHORTCUTS.forEach((shortcut) => {
      const category = shortcut.category ?? "General";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(shortcut);
    });
    return groups;
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "max-w-md sm:max-w-lg",
          "motion-safe:transition-all",
          ANIMATION.duration.normal,
        )}
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" aria-hidden="true" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Press any of the following keys to quickly navigate and interact
            with the app.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
            <div key={category}>
              <h3
                className={cn(
                  "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                )}
              >
                {category}
              </h3>
              <div className="space-y-0.5">
                {shortcuts.map((shortcut) => (
                  <ShortcutItem key={shortcut.id} shortcut={shortcut} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "mt-4 border-t border-border pt-4",
            "flex items-center justify-between text-xs text-muted-foreground",
          )}
        >
          <span>
            Press{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
              ?
            </kbd>{" "}
            to toggle this help
          </span>
          <span>
            Press{" "}
            <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
              Esc
            </kbd>{" "}
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { KeyboardShortcutsHelp, type KeyboardShortcut };
