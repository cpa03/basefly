import { BRAND_CONFIG, COMPANY_CONFIG, REPOSITORY_CONFIG } from "./project";

/**
 * Site configuration - uses centralized project config
 * @deprecated Import from PROJECT_CONFIG directly instead
 */
export const siteConfig = {
  name: BRAND_CONFIG.legacyName,
  description: BRAND_CONFIG.longDescription,
  url: REPOSITORY_CONFIG.legacyUrl,
  ogImage: BRAND_CONFIG.assets.ogImage,
  links: {
    github: REPOSITORY_CONFIG.legacyUrl,
  },
};
