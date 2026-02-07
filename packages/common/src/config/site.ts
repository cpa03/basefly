/**
 * Site Configuration Module
 * 
 * This module provides a centralized, environment-driven configuration
 * for all site-related settings. No hardcoded values - everything is
 * configurable via environment variables with sensible defaults.
 * 
 * @module @saasfly/common/config/site
 */

import { env } from "../env.mjs";

/**
 * Site configuration with environment-driven values
 * All values can be overridden via environment variables
 */
export const siteConfig = {
  /** Site name displayed throughout the application */
  name: env.NEXT_PUBLIC_SITE_NAME ?? "Basefly",
  
  /** Site description for SEO and meta tags */
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "We provide an easier way to build SaaS services in production",
  
  /** Site URL for SEO and external links */
  url: env.NEXT_PUBLIC_SITE_URL ?? "https://github.com/basefly/basefly",
  
  /** Open Graph image URL */
  ogImage: "",
  
  /** External links */
  links: {
    github: env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/basefly",
  },
} as const;

/**
 * GitHub repository configuration
 */
export const githubConfig = {
  owner: env.NEXT_PUBLIC_GITHUB_OWNER ?? "basefly",
  repo: env.NEXT_PUBLIC_GITHUB_REPO ?? "basefly",
  // Set to null to fetch dynamically, or provide a string value
  stars: null as string | null,
} as const;

/**
 * CLI installation commands
 */
export const cliConfig = {
  /** Primary installation command displayed on the homepage */
  installCommand: env.NEXT_PUBLIC_CLI_INSTALL_COMMAND ?? "bun create basefly",
  
  /** Alternative commands for different package managers */
  alternatives: {
    npm: env.NEXT_PUBLIC_CLI_NPM_COMMAND ?? "npx create-basefly",
    yarn: env.NEXT_PUBLIC_CLI_YARN_COMMAND ?? "yarn create basefly",
    pnpm: env.NEXT_PUBLIC_CLI_PNPM_COMMAND ?? "pnpm create basefly",
  },
} as const;

/**
 * Support and contact configuration
 */
export const supportConfig = {
  email: env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@basefly.io",
  domain: env.NEXT_PUBLIC_DOMAIN ?? "basefly.io",
} as const;

/**
 * Type for site configuration
 */
export type SiteConfig = typeof siteConfig;

/**
 * Type for GitHub configuration
 */
export type GithubConfig = typeof githubConfig;

/**
 * Type for CLI configuration
 */
export type CliConfig = typeof cliConfig;

/**
 * Type for support configuration
 */
export type SupportConfig = typeof supportConfig;
