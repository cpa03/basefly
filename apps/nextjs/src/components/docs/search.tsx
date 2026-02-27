"use client";

import { CommandPalette } from "~/components/command-palette";

interface DocsSearchProps {
  lang: string;
}

/**
 * DocsSearch - Documentation search component with command palette
 *
 * Uses the enhanced CommandPalette component which provides:
 * - ⌘K keyboard shortcut to open
 * - Quick navigation to docs, dashboard, and other pages
 * - Theme switching
 * - Recent items tracking
 * - Full keyboard navigation and accessibility
 */
export function DocsSearch({ lang }: DocsSearchProps) {
  return <CommandPalette lang={lang} className="h-8 sm:w-64" />;
}
