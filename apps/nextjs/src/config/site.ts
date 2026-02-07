/**
 * Next.js App Site Configuration
 * 
 * This module re-exports site configuration from the common package
 * and provides Next.js-specific site settings. No hardcoded values.
 * 
 * @module ~/config/site
 */

import { 
  siteConfig as commonSiteConfig, 
  githubConfig, 
  cliConfig 
} from "@saasfly/common/config/site";

/**
 * Site configuration - re-exported from common package
 * All values are environment-driven with sensible defaults
 */
export const siteConfig = {
  ...commonSiteConfig,
};

/**
 * Extended site configuration for Next.js app
 * Includes GitHub and CLI settings
 */
export const extendedSiteConfig = {
  ...commonSiteConfig,
  github: githubConfig,
  cli: cliConfig,
} as const;

/**
 * Type for extended site configuration
 */
export type ExtendedSiteConfig = typeof extendedSiteConfig;
