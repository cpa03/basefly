/**
 * Internationalization (i18n) Configuration
 * 
 * This module provides environment-driven internationalization settings.
 * All locale configuration can be customized via environment variables.
 * 
 * @module ~/config/i18n-config
 */

/**
 * Parse locales from environment variable
 */
function parseLocales(envValue: string | undefined, fallback: string[]): readonly string[] {
  if (!envValue) return fallback as readonly string[];
  return envValue.split(",").map(s => s.trim()).filter(Boolean) as readonly string[];
}

/**
 * Default supported locales
 */
const DEFAULT_LOCALES = ["en", "zh", "ko", "ja"] as const;

/**
 * Default locale
 */
const DEFAULT_DEFAULT_LOCALE = "zh";

/**
 * i18n configuration with environment-driven values
 */
export const i18n = {
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? DEFAULT_DEFAULT_LOCALE,
  locales: parseLocales(process.env.NEXT_PUBLIC_SUPPORTED_LOCALES, [...DEFAULT_LOCALES]),
} as const;

/**
 * Type for supported locales
 */
export type Locale = (typeof i18n)["locales"][number];

/**
 * Locale display names mapping
 * This can be extended or customized as needed
 */
export const localeMap: Record<string, string> = {
  en: "English",
  zh: "中文",
  ko: "한국어",
  ja: "日本語",
} as const;

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return i18n.locales.includes(locale as Locale);
}

/**
 * Get display name for a locale
 */
export function getLocaleDisplayName(locale: string): string {
  return localeMap[locale] ?? locale;
}
