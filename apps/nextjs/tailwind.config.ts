import type { Config } from "tailwindcss";

import baseConfig from "@saasfly/tailwind-config";

export default {
  // Tailwind only emits utilities present in `content`; `@saasfly/common`
  // holds shared design-token class strings rendered by @saasfly/ui.
  content: [
    ...baseConfig.content,
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/common/src/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
} satisfies Config;
