"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { Locale } from "~/config/i18n-config";

interface Dictionary {
  common: {
    errors: {
      title: string;
      dashboard_error: string;
      page_error: string;
      try_again: string;
      error_id: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function extractLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  const validLocales: Locale[] = ["en", "zh", "ko", "ja"];
  if (validLocales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return "en";
}

export function useClientDictionary() {
  const pathname = usePathname();
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const locale = extractLocaleFromPathname(pathname);

    import(`~/config/dictionaries/${locale}.json`)
      .then((module: { default: Dictionary }) => {
        setDict(module.default);
        setIsLoading(false);
      })
      .catch(() => {
        import("~/config/dictionaries/en.json")
          .then((module: { default: Dictionary }) => {
            setDict(module.default);
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      });
  }, [pathname]);

  return { dict, isLoading };
}
