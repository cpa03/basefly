import { describe, it, expect } from "vitest";
import {
  TRANSITION_PRESETS,
  VISUAL_EFFECTS,
  TOAST_CONFIG,
  FEEDBACK_TIMING,
  ANIMATION_TIMING,
  SEMANTIC_COLORS,
  FORM_COLORS,
  FORM_TIMING,
  NOTIFICATION_COLORS,
  THEMES,
  PAGE_PROGRESS_CONFIG,
  NAVBAR_CONFIG,
  Z_INDEX,
  GRADIENT_COLORS,
  PATTERN_CONFIG,
  type TransitionPresetKey,
  type Theme,
  type ZIndexKey,
} from "./ui";

describe("ui", () => {
  describe("TRANSITION_PRESETS", () => {
    it("should have container transition", () => {
      expect(TRANSITION_PRESETS.container).toContain("transition-all");
      expect(TRANSITION_PRESETS.container).toContain("duration-300");
    });

    it("should have button transition", () => {
      expect(TRANSITION_PRESETS.button).toContain("transition-all");
      expect(TRANSITION_PRESETS.button).toContain("duration-150");
    });

    it("should have link transition", () => {
      expect(TRANSITION_PRESETS.link).toContain("transition-colors");
    });
  });

  describe("VISUAL_EFFECTS", () => {
    it("should have shimmer configuration", () => {
      expect(VISUAL_EFFECTS.shimmer.color).toContain("255, 255, 255");
      expect(VISUAL_EFFECTS.shimmer.duration).toBe("2s");
    });

    it("should have shadow configurations", () => {
      expect(VISUAL_EFFECTS.shadows.buttonHover).toContain("rgba");
      expect(VISUAL_EFFECTS.shadows.card).toContain("rgba");
    });
  });

  describe("TOAST_CONFIG", () => {
    it("should have correct toast configuration", () => {
      expect(TOAST_CONFIG.limit).toBe(1);
      expect(TOAST_CONFIG.removeDelay).toBe(1000000);
    });
  });

  describe("FEEDBACK_TIMING", () => {
    it("should have timing values", () => {
      expect(FEEDBACK_TIMING.copySuccess).toBe(2000);
      expect(FEEDBACK_TIMING.toastDisplay).toBe(5000);
      expect(FEEDBACK_TIMING.tooltipDelay).toBe(200);
    });
  });

  describe("ANIMATION_TIMING", () => {
    it("should have animation timing values", () => {
      expect(ANIMATION_TIMING.fast).toBe(150);
      expect(ANIMATION_TIMING.normal).toBe(200);
      expect(ANIMATION_TIMING.slow).toBe(300);
      expect(ANIMATION_TIMING.stagger).toBe(50);
    });
  });

  describe("SEMANTIC_COLORS", () => {
    it("should have success colors", () => {
      expect(SEMANTIC_COLORS.success.icon).toContain("green");
    });

    it("should have destructive colors", () => {
      expect(SEMANTIC_COLORS.destructive.background).toContain("red");
    });
  });

  describe("FORM_COLORS", () => {
    it("should have error colors", () => {
      expect(FORM_COLORS.error.border).toContain("red");
      expect(FORM_COLORS.error.text).toContain("red");
    });

    it("should have success colors", () => {
      expect(FORM_COLORS.success.border).toContain("green");
    });

    it("should have required indicator", () => {
      expect(FORM_COLORS.required.indicator).toContain("red");
    });
  });

  describe("FORM_TIMING", () => {
    it("should have timing values", () => {
      expect(FORM_TIMING.debounceMs).toBe(300);
      expect(FORM_TIMING.resetDelay).toBe(2000);
    });
  });

  describe("NOTIFICATION_COLORS", () => {
    it("should have payment color", () => {
      expect(NOTIFICATION_COLORS.payment).toBe("#00C9A7");
    });

    it("should have signup color", () => {
      expect(NOTIFICATION_COLORS.signup).toBe("#FFB800");
    });

    it("should have deployment color", () => {
      expect(NOTIFICATION_COLORS.deployment).toBe("#1E86FF");
    });
  });

  describe("THEMES", () => {
    it("should have light, dark, and system themes", () => {
      expect(THEMES).toContain("light");
      expect(THEMES).toContain("dark");
      expect(THEMES).toContain("system");
    });
  });

  describe("PAGE_PROGRESS_CONFIG", () => {
    it("should have progress bar configuration", () => {
      expect(PAGE_PROGRESS_CONFIG.defaultHeight).toBe(3);
      expect(PAGE_PROGRESS_CONFIG.defaultDelay).toBe(100);
      expect(PAGE_PROGRESS_CONFIG.maxProgress).toBe(90);
    });
  });

  describe("NAVBAR_CONFIG", () => {
    it("should have scroll threshold", () => {
      expect(NAVBAR_CONFIG.scrollThreshold).toBe(50);
    });
  });

  describe("Z_INDEX", () => {
    it("should have modal z-index", () => {
      expect(Z_INDEX.modal).toBe("z-50");
    });

    it("should have toast z-index above modal", () => {
      expect(Z_INDEX.toast).toBe("z-[100]");
    });

    it("should have progress bar at highest priority", () => {
      expect(Z_INDEX.progressBar).toBe("z-[9999]");
    });
  });

  describe("GRADIENT_COLORS", () => {
    it("should have primary gradient colors", () => {
      expect(GRADIENT_COLORS.primary.start).toBe("#ffaa40");
      expect(GRADIENT_COLORS.primary.middle).toBe("#9c40ff");
    });

    it("should have method to get gradient class", () => {
      expect(GRADIENT_COLORS.getPrimaryGradientClass()).toContain("from-");
      expect(GRADIENT_COLORS.getPrimaryGradientClass()).toContain("via-");
      expect(GRADIENT_COLORS.getPrimaryGradientClass()).toContain("to-");
    });
  });

  describe("PATTERN_CONFIG", () => {
    it("should have default opacity", () => {
      expect(PATTERN_CONFIG.defaultOpacity).toBe(0.4);
    });
  });

  describe("Type exports", () => {
    it("should export TransitionPresetKey type", () => {
      const key: TransitionPresetKey = "button";
      expect(key).toBe("button");
    });

    it("should export Theme type", () => {
      const theme: Theme = "dark";
      expect(theme).toBe("dark");
    });

    it("should export ZIndexKey type", () => {
      const key: ZIndexKey = "modal";
      expect(key).toBe("modal");
    });
  });
});
