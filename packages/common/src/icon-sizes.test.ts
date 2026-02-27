import { describe, expect, it } from "vitest";

import {
  ICON_SIZES,
  getIconSize,
  BUTTON_ICON_SIZES,
  NAV_ICON_SIZES,
  FEATURE_ICON_SIZES,
  STATUS_ICON_SIZES,
  SOCIAL_ICON_SIZES,
  ICON_PRESETS,
  type IconSizeKey,
} from "./icon-sizes";

describe("icon-sizes.ts - ICON_SIZES", () => {
  it("should have all expected size keys", () => {
    expect(ICON_SIZES.xs).toBe("h-3 w-3");
    expect(ICON_SIZES.sm).toBe("h-4 w-4");
    expect(ICON_SIZES.md).toBe("h-5 w-5");
    expect(ICON_SIZES.lg).toBe("h-6 w-6");
    expect(ICON_SIZES.xl).toBe("h-8 w-8");
    expect(ICON_SIZES["2xl"]).toBe("h-10 w-10");
    expect(ICON_SIZES["3xl"]).toBe("h-12 w-12");
  });

  it("should have correct Tailwind classes for all sizes", () => {
    Object.values(ICON_SIZES).forEach((size) => {
      expect(size).toMatch(/^h-\d+ w-\d+$/);
    });
  });
});

describe("icon-sizes.ts - getIconSize", () => {
  it("should return correct size for each key", () => {
    expect(getIconSize("xs")).toBe("h-3 w-3");
    expect(getIconSize("sm")).toBe("h-4 w-4");
    expect(getIconSize("md")).toBe("h-5 w-5");
    expect(getIconSize("lg")).toBe("h-6 w-6");
    expect(getIconSize("xl")).toBe("h-8 w-8");
    expect(getIconSize("2xl")).toBe("h-10 w-10");
    expect(getIconSize("3xl")).toBe("h-12 w-12");
  });
});

describe("icon-sizes.ts - BUTTON_ICON_SIZES", () => {
  it("should have default, sm, and lg keys", () => {
    expect(BUTTON_ICON_SIZES.default).toBe(ICON_SIZES.sm);
    expect(BUTTON_ICON_SIZES.sm).toBe(ICON_SIZES.xs);
    expect(BUTTON_ICON_SIZES.lg).toBe(ICON_SIZES.md);
  });
});

describe("icon-sizes.ts - NAV_ICON_SIZES", () => {
  it("should have default, menu, and brand keys", () => {
    expect(NAV_ICON_SIZES.default).toBe(ICON_SIZES.sm);
    expect(NAV_ICON_SIZES.menu).toBe(ICON_SIZES.md);
    expect(NAV_ICON_SIZES.brand).toBe(ICON_SIZES.lg);
  });
});

describe("icon-sizes.ts - FEATURE_ICON_SIZES", () => {
  it("should have default, card, and hero keys", () => {
    expect(FEATURE_ICON_SIZES.default).toBe(ICON_SIZES.lg);
    expect(FEATURE_ICON_SIZES.card).toBe(ICON_SIZES.md);
    expect(FEATURE_ICON_SIZES.hero).toBe(ICON_SIZES.xl);
  });
});

describe("icon-sizes.ts - STATUS_ICON_SIZES", () => {
  it("should have inline, default, and large keys", () => {
    expect(STATUS_ICON_SIZES.inline).toBe(ICON_SIZES.xs);
    expect(STATUS_ICON_SIZES.default).toBe(ICON_SIZES.sm);
    expect(STATUS_ICON_SIZES.large).toBe(ICON_SIZES.md);
  });
});

describe("icon-sizes.ts - SOCIAL_ICON_SIZES", () => {
  it("should have default and large keys", () => {
    expect(SOCIAL_ICON_SIZES.default).toBe(ICON_SIZES.sm);
    expect(SOCIAL_ICON_SIZES.large).toBe(ICON_SIZES.md);
  });
});

describe("icon-sizes.ts - ICON_PRESETS", () => {
  it("should have all preset categories", () => {
    expect(ICON_PRESETS.button).toBe(BUTTON_ICON_SIZES);
    expect(ICON_PRESETS.nav).toBe(NAV_ICON_SIZES);
    expect(ICON_PRESETS.feature).toBe(FEATURE_ICON_SIZES);
    expect(ICON_PRESETS.status).toBe(STATUS_ICON_SIZES);
    expect(ICON_PRESETS.social).toBe(SOCIAL_ICON_SIZES);
  });
});

describe("icon-sizes.ts - Type exports", () => {
  it("should export IconSizeKey type", () => {
    const sizes: IconSizeKey[] = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
    sizes.forEach((size) => {
      expect(getIconSize(size)).toBeDefined();
    });
  });
});
