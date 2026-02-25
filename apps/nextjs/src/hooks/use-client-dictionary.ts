"use client";

import { useEffect, useSyncExternalStore } from "react";
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

// SSR-safe external store for dictionary data
// useSyncExternalStore ensures SSR and client initial render match
const dictionaryStore = {
  data: null as Dictionary | null,
  subscribers: new Set<() => void>(),

  subscribe: (callback: () => void) => {
    dictionaryStore.subscribers.add(callback);
    return () => {
      dictionaryStore.subscribers.delete(callback);
    };
  },

  getSnapshot: () => {
    return dictionaryStore.data;
  },

  getServerSnapshot: () => {
    return null; // Server starts with null - matches SSR initial render
  },

  setData: (data: Dictionary | null) => {
    dictionaryStore.data = data;
    dictionaryStore.subscribers.forEach((callback) => callback());
  },
};

export function useClientDictionary() {
  const pathname = usePathname();

  // Load dictionary when pathname changes
  useEffect(() => {
    const locale = extractLocaleFromPathname(pathname);

    import(`~/config/dictionaries/${locale}.json`)
      .then((module: { default: Dictionary }) => {
        dictionaryStore.setData(module.default);
      })
      .catch(() => {
        // Fallback to English
        import("~/config/dictionaries/en.json")
          .then((module: { default: Dictionary }) => {
            dictionaryStore.setData(module.default);
          })
          .catch(() => {
            // Silent fail - store remains null
          });
      });
  }, [pathname]);

  // SSR-safe subscription to dictionary store
  // useSyncExternalStore ensures:
  // 1. Server renders with null (getServerSnapshot)
  // 2. Client initial render also uses null (getSnapshot)
  // 3. After hydration, useEffect runs and updates the store
  const dictionary = useSyncExternalStore(
    dictionaryStore.subscribe,
    dictionaryStore.getSnapshot,
    dictionaryStore.getServerSnapshot,
  );

  // Derived loading state - dictionary is loaded when not null
  const isLoading = dictionary === null;

  return { dict: dictionary, isLoading };
}
