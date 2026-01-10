import { loggerLink } from "@trpc/client";
import { experimental_createTRPCNextAppDirClient } from "@trpc/next/app-dir/client";

import type { AppRouter } from "@saasfly/api";

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
            "x-trpc-source": "client",
          },
        }),
      ],
    };
  },
});

export { type RouterInputs, type RouterOutputs } from "@saasfly/api";
