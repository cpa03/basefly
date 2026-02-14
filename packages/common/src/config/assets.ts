/**
 * Asset Paths Configuration
 * Centralized configuration for static asset paths
 * Allows easy asset path updates and environment-specific overrides
 */

/** Base paths for different asset categories */
export const ASSET_BASE_PATHS = {
  /** Root path for images */
  images: "/images",
  /** Root path for avatar images */
  avatars: "/images/avatars",
  /** Root path for sponsor/partner logos */
  sponsors: "/images",
} as const;

/** Specific asset file paths */
export const ASSETS = {
  /** Site logo */
  logo: `${ASSET_BASE_PATHS.avatars}/saasfly-logo.svg`,
  /** Clerk sponsor logo */
  clerkLogo: `${ASSET_BASE_PATHS.sponsors}/clerk.png`,
} as const;

/**
 * Get full asset path with optional base URL override
 * @param path - Asset path relative to public folder
 * @param baseUrl - Optional base URL for CDN deployments
 * @returns Full asset URL
 */
export function getAssetPath(path: string, baseUrl?: string): string {
  if (baseUrl) {
    return `${baseUrl}${path}`;
  }
  return path;
}
