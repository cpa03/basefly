import "server-only";

import type { Locale } from "~/config/i18n-config";

/**
 * Dictionary cache configuration
 * @internal
 */
interface CacheEntry<T> {
  /** The cached dictionary data */
  data: T;
  /** Timestamp when this entry was cached (ms since epoch) */
  timestamp: number;
}

/**
 * Cache time-to-live in milliseconds (default: 5 minutes)
 * Can be overridden via DICTIONARY_CACHE_TTL_MS environment variable
 * This ensures dictionaries stay fresh while reducing I/O overhead
 */
const CACHE_TTL_MS =
  Number(process.env.DICTIONARY_CACHE_TTL_MS) || 5 * 60 * 1000;

/**
 * In-memory cache for loaded dictionaries
 * Keyed by locale to avoid repeated dynamic imports
 * @internal
 */
const dictionaryCache = new Map<Locale, CacheEntry<unknown>>();

/**
 * Checks if a cache entry has expired based on TTL
 * @param entry - The cache entry to check
 * @returns true if the entry has expired
 */
function isExpired<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) return true;
  return Date.now() - entry.timestamp > CACHE_TTL_MS;
}

/**
 * Retrieves a value from cache or loads it using the provided loader function
 * @param locale - The locale key for caching
 * @param loader - Async function to load the data if not cached
 * @returns The cached or freshly loaded dictionary data
 */
async function getOrLoad<T>(
  locale: Locale,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = dictionaryCache.get(locale) as CacheEntry<T> | undefined;

  if (cached && !isExpired(cached)) {
    return cached.data;
  }

  const data = await loader();
  dictionaryCache.set(locale, { data, timestamp: Date.now() });
  return data;
}

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () =>
    import("~/config/dictionaries/en.json").then((module) => module.default),
  zh: () =>
    import("~/config/dictionaries/zh.json").then((module) => module.default),
  ko: () =>
    import("~/config/dictionaries/ko.json").then((module) => module.default),
  ja: () =>
    import("~/config/dictionaries/ja.json").then((module) => module.default),
};

/**
 * Retrieves the dictionary for a given locale with caching support.
 *
 * This function implements an in-memory cache with a 5-minute TTL to reduce
 * the overhead of repeated dynamic imports during server-side rendering.
 * Subsequent calls within the TTL window return cached data without I/O.
 *
 * @param locale - The locale to load (e.g., 'en', 'zh', 'ko', 'ja')
 * @returns Promise resolving to the dictionary object for the locale
 * @example
 * ```ts
 * const dict = await getDictionary('en');
 * console.log(dict.common.dashboard.heading);
 * ```
 */
export const getDictionary = async <TLocale extends Locale>(
  locale: TLocale,
) => {
  const loader = dictionaries[locale] ?? dictionaries.en;
  return getOrLoad(locale, loader as () => Promise<unknown>) as Promise<
    Awaited<ReturnType<(typeof dictionaries)[TLocale]>>
  >;
};

/**
 * Returns a function that loads the dictionary for a given locale.
 *
 * Note: This returns a thunk for compatibility; prefer getDictionary() for caching.
 *
 * @param locale - The locale to load
 * @returns A function that when called loads and returns the dictionary
 * @deprecated Use getDictionary() directly for better caching support
 */
export const getDictionarySync = (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
