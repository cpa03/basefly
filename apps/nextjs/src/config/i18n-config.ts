/**
 * Internationalization Configuration
 * 
 * Uses centralized configuration from @saasfly/common.
 * 
 * Flexy Principle: No hardcoded locales - everything is configurable!
 */

import { I18N_CONFIG, type Locale } from "@saasfly/common/config/app";

export const i18n = {
  defaultLocale: I18N_CONFIG.defaultLocale,
  locales: [...I18N_CONFIG.locales],
} as const;

export type { Locale };

/**
 * Locale display names
 */
export const localeMap = I18N_CONFIG.localeNames;
