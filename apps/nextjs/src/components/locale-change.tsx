"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ICON_SIZES } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { Check, Languages } from "@saasfly/ui/icons";

import { i18n, localeMap } from "~/config/i18n-config";

interface LocaleChangeProps {
  /**
   * The URL path to navigate to after changing locale
   */
  url: string;
  /**
   * The current active locale
   */
  currentLocale?: string;
}

/**
 * LocaleChange - Language selector dropdown with accessibility support
 *
 * Features:
 * - Shows available locales from i18n config
 * - Indicates current locale with checkmark and aria-current
 * - Keyboard accessible (Tab, Arrow keys, Enter)
 * - Navigates to same page in selected locale
 *
 * @example
 * ```tsx
 * <LocaleChange url="/dashboard" currentLocale="en" />
 * ```
 */
export function LocaleChange({ url, currentLocale }: LocaleChangeProps) {
  const router = useRouter();

  function onClick(locale: string) {
    router.push(`/${locale}/` + url);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 px-0 transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Change language. Current: ${currentLocale ? localeMap[currentLocale as keyof typeof localeMap] : "unknown"}`}
        >
          <Languages className={ICON_SIZES.sm} aria-hidden="true" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => {
          const isActive = locale === currentLocale;
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => onClick(locale)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "cursor-pointer",
                isActive && "bg-accent/50",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <span>{localeMap[locale]}</span>
                {isActive && (
                  <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                )}
              </span>
              <span className="sr-only">
                {isActive ? "(currently selected)" : ""}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
