"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ICON_SIZES } from "@saasfly/common";
import { Button } from "@saasfly/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { Languages } from "@saasfly/ui/icons";

import { i18n, localeMap } from "~/config/i18n-config";

export function LocaleChange({ url }: { url: string }) {
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
          aria-label="Change language"
        >
          <Languages className={ICON_SIZES.sm} aria-hidden="true" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => onClick(locale)}>
            <span>{localeMap[locale]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
