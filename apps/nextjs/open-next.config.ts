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
// Uncomment the following imports when enabling ISR caching:
// import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
// import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
// import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  /**
   * Enable cache interception to bypass NextServer for cached routes.
   * This improves cold start performance for ISR/SSG pages by serving
   * cached content directly without loading the full Next.js runtime.
   * @see https://opennext.js.org/cloudflare/caching#cache-interception
   */
  enableCacheInterception: true,

  /**
   * ISR/SSG Incremental Cache Configuration
   * Uncomment one of the following options after setting up the binding:
   *
   * Option 1: KV Namespace (fast but eventually consistent)
   * - Add KV binding in wrangler.toml: binding = "NEXT_INC_CACHE_KV"
   * - incrementalCache: kvIncrementalCache,
   *
   * Option 2: R2 Bucket (recommended for production - more consistent)
   * - Add R2 binding in wrangler.toml: binding = "NEXT_INC_CACHE_R2_BUCKET"
   * - incrementalCache: r2IncrementalCache,
   *
   * @see https://opennext.js.org/cloudflare/caching#incremental-cache
   */
  // incrementalCache: kvIncrementalCache,

  /**
   * Queue for time-based revalidation (revalidatePath/revalidateTag)
   * Requires Durable Objects binding in wrangler.toml
   * @see https://opennext.js.org/cloudflare/caching#queue
   */
  // queue: doQueue,

  /**
   * Tag cache for on-demand revalidation with revalidateTag/revalidatePath
   * Requires D1 database binding in wrangler.toml
   * @see https://opennext.js.org/cloudflare/caching#tag-cache
   */
  // tagCache: d1NextTagCache,
});
