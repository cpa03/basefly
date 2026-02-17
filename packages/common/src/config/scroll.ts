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
  return SCROLL_OFFSETS[key];
}

export function getScrollDelay(key: ScrollDelayKey): number {
  return SCROLL_DELAYS[key];
}

export function getScrollThreshold(key: ScrollThresholdKey): number {
  return SCROLL_THRESHOLDS[key];
}

export function createScrollOptions(
  options: Partial<ScrollToOptions> & {
    offsetKey?: ScrollOffsetKey;
    delayKey?: ScrollDelayKey;
  } = {},
): { options: ScrollToOptions; delay: number } {
  const {
    offsetKey = "default",
    delayKey = "default",
    behavior = SCROLL_BEHAVIOR.default,
    ...scrollOptions
  } = options;

  return {
    options: {
      top:
        scrollOptions.top !== undefined
          ? scrollOptions.top - SCROLL_OFFSETS[offsetKey]
          : undefined,
      left: scrollOptions.left,
      behavior,
    },
    delay: SCROLL_DELAYS[delayKey],
  };
}
