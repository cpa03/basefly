import { loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";

import type { AppRouter } from "@saasfly/api";
import { TRPC_SOURCE_VALUES } from "@saasfly/common";

import { endingLink, transformer } from "./shared";

/**
 * Performance optimization: Configure React Query defaults
 * - staleTime: 30 seconds - Prevents unnecessary refetches on mount/window focus
 *   for recently fetched data. This reduces API calls while keeping data reasonably fresh.
 * - gcTime: 5 minutes - Keeps unused data in cache longer, improving navigation performance.
 */
const REACT_QUERY_DEFAULTS = {
  staleTime: 30 * 1000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
} as const;

export const trpc = experimental_createTRPCNextAppDirClient<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        loggerLink({
          enabled: () => true,
        }),
        endingLink({
          headers: {
            "x-trpc-source": TRPC_SOURCE_VALUES.CLIENT,
          },
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: REACT_QUERY_DEFAULTS,
        },
      },
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
