import { describe, expect, it } from "vitest";

import {
  createScrollOptions,
  getScrollDelay,
  getScrollOffset,
  getScrollThreshold,
  SCROLL_BEHAVIOR,
  SCROLL_CONFIG,
  SCROLL_DELAYS,
  SCROLL_OFFSETS,
  SCROLL_THRESHOLDS,
  type ScrollDelayKey,
  type ScrollOffsetKey,
  type ScrollThresholdKey,
} from "./scroll";

describe("scroll", () => {
  describe("SCROLL_OFFSETS", () => {
    it("should have default offset", () => {
      expect(SCROLL_OFFSETS.default).toBe(100);
    });

    it("should have specialized offsets", () => {
      expect(SCROLL_OFFSETS.formError).toBe(100);
      expect(SCROLL_OFFSETS.anchor).toBe(80);
      expect(SCROLL_OFFSETS.stickyHeader).toBe(64);
      expect(SCROLL_OFFSETS.mobile).toBe(60);
    });
  });

  describe("SCROLL_DELAYS", () => {
    it("should have default delay", () => {
      expect(SCROLL_DELAYS.default).toBe(100);
    });

    it("should have specialized delays", () => {
      expect(SCROLL_DELAYS.formError).toBe(100);
      expect(SCROLL_DELAYS.routeChange).toBe(0);
      expect(SCROLL_DELAYS.smoothScroll).toBe(50);
      expect(SCROLL_DELAYS.debounce).toBe(16);
    });
  });

  describe("SCROLL_THRESHOLDS", () => {
    it("should have navbar threshold", () => {
      expect(SCROLL_THRESHOLDS.navbar).toBe(50);
    });

    it("should have specialized thresholds", () => {
      expect(SCROLL_THRESHOLDS.infiniteScroll).toBe(200);
      expect(SCROLL_THRESHOLDS.scrollToTop).toBe(400);
      expect(SCROLL_THRESHOLDS.sectionHighlight).toBe(100);
    });
  });

  describe("SCROLL_BEHAVIOR", () => {
    it("should have default behavior", () => {
      expect(SCROLL_BEHAVIOR.default).toBe("smooth");
    });

    it("should have instant behavior", () => {
      expect(SCROLL_BEHAVIOR.instant).toBe("auto");
    });
  });

  describe("SCROLL_CONFIG", () => {
    it("should combine all scroll configurations", () => {
      expect(SCROLL_CONFIG.offsets).toBe(SCROLL_OFFSETS);
      expect(SCROLL_CONFIG.delays).toBe(SCROLL_DELAYS);
      expect(SCROLL_CONFIG.thresholds).toBe(SCROLL_THRESHOLDS);
      expect(SCROLL_CONFIG.behavior).toBe(SCROLL_BEHAVIOR);
    });
  });

  describe("getScrollOffset", () => {
    it("should return offset for valid key", () => {
      expect(getScrollOffset("default")).toBe(100);
      expect(getScrollOffset("anchor")).toBe(80);
      expect(getScrollOffset("stickyHeader")).toBe(64);
    });

    it("should return default offset for invalid key", () => {
      expect(getScrollOffset("invalid" as ScrollOffsetKey)).toBe(100);
    });
  });

  describe("getScrollDelay", () => {
    it("should return delay for valid key", () => {
      expect(getScrollDelay("default")).toBe(100);
      expect(getScrollDelay("routeChange")).toBe(0);
      expect(getScrollDelay("smoothScroll")).toBe(50);
    });

    it("should return default delay for invalid key", () => {
      expect(getScrollDelay("invalid" as ScrollDelayKey)).toBe(100);
    });
  });

  describe("getScrollThreshold", () => {
    it("should return threshold for valid key", () => {
      expect(getScrollThreshold("navbar")).toBe(50);
      expect(getScrollThreshold("scrollToTop")).toBe(400);
    });

    it("should return default threshold for invalid key", () => {
      expect(getScrollThreshold("invalid" as ScrollThresholdKey)).toBe(100);
    });
  });

  describe("createScrollOptions", () => {
    it("should create options with default keys", () => {
      const result = createScrollOptions();
      expect(result.options.behavior).toBe("smooth");
      expect(result.delay).toBe(100);
    });

    it("should use provided top position", () => {
      const result = createScrollOptions({ top: 200 });
      expect(result.options.top).toBe(100); // 200 - default offset (100)
    });

    it("should use custom offset key", () => {
      const result = createScrollOptions({ top: 200, offsetKey: "anchor" });
      expect(result.options.top).toBe(120); // 200 - anchor offset (80)
    });

    it("should use custom delay key", () => {
      const result = createScrollOptions({}, { delayKey: "smoothScroll" });
      expect(result.delay).toBe(50);
    });

    it("should use custom behavior", () => {
      const result = createScrollOptions({ behavior: "auto" });
      expect(result.options.behavior).toBe("auto");
    });

    it("should handle left position", () => {
      const result = createScrollOptions({ left: 50 });
      expect(result.options.left).toBe(50);
    });

    it("should handle all options together", () => {
      const result = createScrollOptions(
        { top: 300, left: 100, behavior: "auto" },
        { offsetKey: "stickyHeader", delayKey: "routeChange" },
      );
      expect(result.options.top).toBe(236); // 300 - stickyHeader offset (64)
      expect(result.options.left).toBe(100);
      expect(result.options.behavior).toBe("auto");
      expect(result.delay).toBe(0);
    });
  });

  describe("Type exports", () => {
    it("should export ScrollOffsetKey type", () => {
      const key: ScrollOffsetKey = "default";
      expect(key).toBe("default");
    });

    it("should export ScrollDelayKey type", () => {
      const key: ScrollDelayKey = "smoothScroll";
      expect(key).toBe("smoothScroll");
    });

    it("should export ScrollThresholdKey type", () => {
      const key: ScrollThresholdKey = "navbar";
      expect(key).toBe("navbar");
    });
  });
});
