export const SCROLL_OFFSETS = {
  default: 100,
  formError: 100,
  anchor: 80,
  stickyHeader: 64,
  mobile: 60,
} as const;

export const SCROLL_DELAYS = {
  default: 100,
  formError: 100,
  routeChange: 0,
  smoothScroll: 50,
  debounce: 16,
} as const;

export const SCROLL_THRESHOLDS = {
  default: 100,
  navbar: 50,
  infiniteScroll: 200,
  scrollToTop: 400,
  sectionHighlight: 100,
} as const;

export const SCROLL_BEHAVIOR = {
  default: "smooth" as const,
  instant: "auto" as const,
  formError: "smooth" as const,
} as const;

export const SCROLL_CONFIG = {
  offsets: SCROLL_OFFSETS,
  delays: SCROLL_DELAYS,
  thresholds: SCROLL_THRESHOLDS,
  behavior: SCROLL_BEHAVIOR,
} as const;

export type ScrollOffsetKey = keyof typeof SCROLL_OFFSETS;
export type ScrollDelayKey = keyof typeof SCROLL_DELAYS;
export type ScrollThresholdKey = keyof typeof SCROLL_THRESHOLDS;

export function getScrollOffset(key: ScrollOffsetKey): number {
  return SCROLL_OFFSETS[key] ?? SCROLL_OFFSETS.default;
}

export function getScrollDelay(key: ScrollDelayKey): number {
  return SCROLL_DELAYS[key] ?? SCROLL_DELAYS.default;
}

export function getScrollThreshold(key: ScrollThresholdKey): number {
  return SCROLL_THRESHOLDS[key] ?? SCROLL_THRESHOLDS.default;
}

interface ScrollOptionsWithKeys {
  top?: number;
  left?: number;
  behavior?: ScrollBehavior;
  offsetKey?: ScrollOffsetKey;
  delayKey?: ScrollDelayKey;
}

export function createScrollOptions(
  scrollOptions: ScrollOptionsWithKeys = {},
  config?: {
    offsetKey?: ScrollOffsetKey;
    delayKey?: ScrollDelayKey;
  },
): { options: ScrollToOptions; delay: number } {
  // Support both: offsetKey/delayKey in first param OR second param
  const offsetKey = scrollOptions.offsetKey ?? config?.offsetKey ?? "default";
  const delayKey = scrollOptions.delayKey ?? config?.delayKey ?? "default";
  const behavior = scrollOptions.behavior ?? SCROLL_BEHAVIOR.default;

  return {
    options: {
      top:
        scrollOptions.top !== undefined
          ? scrollOptions.top -
            (SCROLL_OFFSETS[offsetKey] ?? SCROLL_OFFSETS.default)
          : undefined,
      left: scrollOptions.left,
      behavior,
    },
    delay: SCROLL_DELAYS[delayKey] ?? SCROLL_DELAYS.default,
  };
}
