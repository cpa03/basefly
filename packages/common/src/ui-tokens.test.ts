import { describe, expect, it } from "vitest";

import {
  BADGE_TOKENS,
  BUTTON_TOKENS,
  CARD_TOKENS,
  DIALOG_TOKENS,
  FOCUS_TOKENS,
  INPUT_TOKENS,
  UI_ANIMATION,
  type BadgeSize,
  type ButtonHeight,
  type ButtonPadding,
  type CardPadding,
  type FocusVariant,
  type InputHeight,
} from "./ui-tokens";

describe("ui-tokens.ts - BUTTON_TOKENS", () => {
  it("should have ripple configuration", () => {
    expect(BUTTON_TOKENS.ripple.size).toBe(200);
    expect(BUTTON_TOKENS.ripple.duration).toBe(600);
    expect(BUTTON_TOKENS.ripple.cssVar).toBe("--ripple-size");
  });

  it("should have height variants", () => {
    expect(BUTTON_TOKENS.heights.sm).toBe("h-9");
    expect(BUTTON_TOKENS.heights.default).toBe("h-10");
    expect(BUTTON_TOKENS.heights.lg).toBe("h-11");
    expect(BUTTON_TOKENS.heights.icon).toBe("h-10 w-10");
  });

  it("should have padding variants", () => {
    expect(BUTTON_TOKENS.padding.sm).toBe("px-3");
    expect(BUTTON_TOKENS.padding.default).toBe("px-4 py-2");
    expect(BUTTON_TOKENS.padding.lg).toBe("px-8");
    expect(BUTTON_TOKENS.padding.icon).toBe("");
  });

  it("should have radius variants", () => {
    expect(BUTTON_TOKENS.radius.default).toBe("rounded-md");
    expect(BUTTON_TOKENS.radius.sm).toBe("rounded-md");
    expect(BUTTON_TOKENS.radius.lg).toBe("rounded-md");
  });

  it("should have icon size", () => {
    expect(BUTTON_TOKENS.iconSize).toBe("h-4 w-4");
  });

  it("should have spinner animation", () => {
    expect(BUTTON_TOKENS.spinnerAnimation).toBe("animate-spin");
  });

  it("should have active scale effect", () => {
    expect(BUTTON_TOKENS.activeScale).toBe("active:scale-[0.97]");
  });

  it("should have transition timing", () => {
    expect(BUTTON_TOKENS.transition).toContain("duration-");
    expect(BUTTON_TOKENS.transition).toContain("ease-");
  });
});

describe("ui-tokens.ts - INPUT_TOKENS", () => {
  it("should have height variants", () => {
    expect(INPUT_TOKENS.heights.default).toBe("h-10");
    expect(INPUT_TOKENS.heights.sm).toBe("h-9");
    expect(INPUT_TOKENS.heights.lg).toBe("h-11");
  });

  it("should have textarea minimum height", () => {
    expect(INPUT_TOKENS.textareaMinHeight).toBe(80);
  });

  it("should have focus ring variants", () => {
    expect(INPUT_TOKENS.focusRing.default).toContain(
      "focus-visible:outline-none",
    );
    expect(INPUT_TOKENS.focusRing.default).toContain("focus-visible:ring-2");
    expect(INPUT_TOKENS.focusRing.error).toContain(
      "focus-visible:ring-red-500",
    );
    expect(INPUT_TOKENS.focusRing.success).toContain(
      "focus-visible:ring-green-500",
    );
  });

  it("should have border styling", () => {
    expect(INPUT_TOKENS.border.default).toContain("border");
    expect(INPUT_TOKENS.border.error).toContain("border-red-500");
    expect(INPUT_TOKENS.border.success).toContain("border-green-500");
  });

  it("should have appearance styles", () => {
    expect(INPUT_TOKENS.appearance.background).toBe("bg-background");
    expect(INPUT_TOKENS.appearance.text).toBe("text-sm");
    expect(INPUT_TOKENS.appearance.placeholder).toContain("placeholder:");
  });

  it("should have disabled state", () => {
    expect(INPUT_TOKENS.disabled).toContain("disabled:");
  });

  it("should have padding", () => {
    expect(INPUT_TOKENS.padding).toBe("px-3 py-2");
  });
});

describe("ui-tokens.ts - CARD_TOKENS", () => {
  it("should have border radius", () => {
    expect(CARD_TOKENS.radius).toBe("rounded-xl");
  });

  it("should have border styling", () => {
    expect(CARD_TOKENS.border).toBe("border");
  });

  it("should have background", () => {
    expect(CARD_TOKENS.background).toBe("bg-card");
  });

  it("should have text color", () => {
    expect(CARD_TOKENS.textColor).toBe("text-card-foreground");
  });

  it("should have shadow", () => {
    expect(CARD_TOKENS.shadow).toBe("shadow-sm");
  });

  it("should have padding variants", () => {
    expect(CARD_TOKENS.padding.sm).toBe("p-4");
    expect(CARD_TOKENS.padding.default).toBe("p-6");
    expect(CARD_TOKENS.padding.lg).toBe("p-8");
  });
});

describe("ui-tokens.ts - DIALOG_TOKENS", () => {
  it("should have overlay configuration", () => {
    expect(DIALOG_TOKENS.overlay.background).toContain("bg-");
    expect(DIALOG_TOKENS.overlay.blur).toContain("backdrop-blur");
  });

  it("should have content configuration", () => {
    expect(DIALOG_TOKENS.content.background).toBe("bg-background");
    expect(DIALOG_TOKENS.content.border).toBe("border");
    expect(DIALOG_TOKENS.content.shadow).toBe("shadow-lg");
    expect(DIALOG_TOKENS.content.radius).toBe("rounded-lg");
  });

  it("should have animation timing", () => {
    expect(DIALOG_TOKENS.animation).toContain("duration-");
    expect(DIALOG_TOKENS.animation).toContain("ease-");
  });

  it("should have close button configuration", () => {
    expect(DIALOG_TOKENS.closeButton.position).toContain("right-");
    expect(DIALOG_TOKENS.closeButton.position).toContain("top-");
    expect(DIALOG_TOKENS.closeButton.size).toContain("h-");
    expect(DIALOG_TOKENS.closeButton.size).toContain("w-");
    expect(DIALOG_TOKENS.closeButton.opacity).toContain("opacity");
    expect(DIALOG_TOKENS.closeButton.transition).toContain("duration-");
  });
});

describe("ui-tokens.ts - BADGE_TOKENS", () => {
  it("should have size variants", () => {
    expect(BADGE_TOKENS.sizes.sm).toBeDefined();
    expect(BADGE_TOKENS.sizes.default).toBeDefined();
    expect(BADGE_TOKENS.sizes.lg).toBeDefined();
  });

  it("should have small size configuration", () => {
    const sm = BADGE_TOKENS.sizes.sm;
    expect(sm.dot).toContain("h-");
    expect(sm.text).toContain("text-");
    expect(sm.padding).toContain("px-");
  });

  it("should have default size configuration", () => {
    const def = BADGE_TOKENS.sizes.default;
    expect(def.dot).toContain("h-");
    expect(def.text).toContain("text-");
    expect(def.padding).toContain("px-");
  });

  it("should have large size configuration", () => {
    const lg = BADGE_TOKENS.sizes.lg;
    expect(lg.dot).toContain("h-");
    expect(lg.text).toContain("text-");
    expect(lg.padding).toContain("px-");
  });

  it("should have border radius", () => {
    expect(BADGE_TOKENS.radius).toBe("rounded-full");
  });

  it("should have loading animation", () => {
    expect(BADGE_TOKENS.loadingAnimation).toBe("animate-spin");
  });

  it("should have role for accessibility", () => {
    expect(BADGE_TOKENS.role).toBe("status");
  });
});

describe("ui-tokens.ts - FOCUS_TOKENS", () => {
  it("should have default focus style", () => {
    expect(FOCUS_TOKENS.default).toContain("focus-visible:outline-none");
    expect(FOCUS_TOKENS.default).toContain("focus-visible:ring-");
  });

  it("should have subtle focus style", () => {
    expect(FOCUS_TOKENS.subtle).toContain("focus-visible:outline-none");
    expect(FOCUS_TOKENS.subtle).toContain("focus-visible:ring-");
  });

  it("should have none focus style", () => {
    expect(FOCUS_TOKENS.none).toBe("");
  });

  it("should have destructive focus style", () => {
    expect(FOCUS_TOKENS.destructive).toContain("focus-visible:ring-red-500");
  });
});

describe("ui-tokens.ts - UI_ANIMATION", () => {
  it("should have micro interaction timing", () => {
    expect(UI_ANIMATION.micro).toContain("duration-");
    expect(UI_ANIMATION.micro).toContain("ease-");
  });

  it("should have standard transition timing", () => {
    expect(UI_ANIMATION.standard).toContain("duration-");
    expect(UI_ANIMATION.standard).toContain("ease-");
  });

  it("should have emphasis animation timing", () => {
    expect(UI_ANIMATION.emphasis).toContain("duration-");
    expect(UI_ANIMATION.emphasis).toContain("ease-");
  });

  it("should have duration values in milliseconds", () => {
    expect(UI_ANIMATION.duration.fast).toBeDefined();
    expect(UI_ANIMATION.duration.normal).toBeDefined();
    expect(UI_ANIMATION.duration.medium).toBeDefined();
    expect(UI_ANIMATION.duration.slow).toBeDefined();
    expect(typeof UI_ANIMATION.duration.fast).toBe("number");
  });

  it("should have scale effects", () => {
    expect(UI_ANIMATION.scale.subtle).toContain("hover:scale");
    expect(UI_ANIMATION.scale.default).toContain("hover:scale");
    expect(UI_ANIMATION.scale.prominent).toContain("hover:scale");
  });
});

describe("ui-tokens.ts - Type exports", () => {
  it("should export ButtonHeight type", () => {
    const heights: ButtonHeight[] = ["sm", "default", "lg", "icon"];
    expect(heights.length).toBe(4);
  });

  it("should export ButtonPadding type", () => {
    const paddings: ButtonPadding[] = ["sm", "default", "lg", "icon"];
    expect(paddings.length).toBe(4);
  });

  it("should export InputHeight type", () => {
    const heights: InputHeight[] = ["default", "sm", "lg"];
    expect(heights.length).toBe(3);
  });

  it("should export CardPadding type", () => {
    const paddings: CardPadding[] = ["sm", "default", "lg"];
    expect(paddings.length).toBe(3);
  });

  it("should export BadgeSize type", () => {
    const sizes: BadgeSize[] = ["sm", "default", "lg"];
    expect(sizes.length).toBe(3);
  });

  it("should export FocusVariant type", () => {
    const variants: FocusVariant[] = [
      "default",
      "subtle",
      "none",
      "destructive",
    ];
    expect(variants.length).toBe(4);
  });
});
