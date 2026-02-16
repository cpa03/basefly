import { loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";

import type { AppRouter } from "@saasfly/api";
import { TRPC_SOURCE_VALUES } from "@saasfly/common";

import { endingLink, transformer } from "./shared";

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
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
