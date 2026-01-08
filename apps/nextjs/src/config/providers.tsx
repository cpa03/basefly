// app/providers.tsx
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

import { env } from "~/env.mjs";

const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => console.log(JSON.stringify({ level: "info", msg, ...meta })),
  warn: (msg: string, meta?: Record<string, unknown>) => console.warn(JSON.stringify({ level: "warn", msg, ...meta })),
  error: (msg: string, err?: Error | unknown, meta?: Record<string, unknown>) => console.error(JSON.stringify({ level: "error", msg, error: err, ...meta })),
};

if (typeof window !== "undefined") {
  const posthogKey = env.NEXT_PUBLIC_POSTHOG_KEY + "";
  const posthogHost = env.NEXT_PUBLIC_POSTHOG_HOST + "";

  if (posthogKey && posthogHost) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false,
    });
  } else {
    logger.error("PostHog environment variables are missing");
  }
}

export function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return <></>;
}

export function PHProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
