/**
 * OpenNext Cloudflare Configuration
 * @see https://opennext.js.org/cloudflare/get-started
 * @see https://opennext.js.org/cloudflare/caching
 *
 * This configuration file customizes the OpenNext adapter for Cloudflare Workers.
 * The adapter enables Next.js apps to run on Cloudflare's edge network.
 *
 * Available options:
 * - enableCacheInterception: Improves cold start performance for ISR/SSG routes
 * - incrementalCache: Configure ISR/SSG caching (requires KV or R2 bindings)
 * - queue: Enable on-demand revalidation (requires Durable Objects)
 * - tagCache: Enable cache tagging for granular revalidation
 *
 * Note: For production ISR caching, add KV namespace or R2 bucket bindings
 * in wrangler.toml and configure incrementalCache accordingly.
 */
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  /**
   * Enable cache interception to bypass NextServer for cached routes.
   * This improves cold start performance for ISR/SSG pages by serving
   * cached content directly without loading the full Next.js runtime.
   * @see https://opennext.js.org/cloudflare/caching#cache-interception
   */
  enableCacheInterception: true,
});
