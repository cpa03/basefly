import { describe, expect, it } from "vitest";

import {
  duration,
  easing,
  scale,
  seconds,
  ms,
  bezier,
  stagger,
  transition,
  radixAnimations,
  focusRing,
  hoverScale,
  shake,
  ANIMATION,
  type DurationKey,
  type EasingKey,
  type ScaleKey,
  type FocusRingKey,
  type HoverScaleKey,
} from "./animation";

describe("animation.ts - duration", () => {
  it("should have all duration keys with Tailwind classes", () => {
    expect(duration.instant).toBe("duration-100");
    expect(duration.fast).toBe("duration-150");
    expect(duration.normal).toBe("duration-200");
    expect(duration.medium).toBe("duration-300");
    expect(duration.slow).toBe("duration-500");
    expect(duration.dramatic).toBe("duration-1000");
  });
});

describe("animation.ts - easing", () => {
  it("should have all easing keys with Tailwind classes", () => {
    expect(easing.default).toBe("ease-out");
    expect(easing.smooth).toBe("ease-in-out");
    expect(easing.standard).toBe("ease");
    expect(easing.linear).toBe("ease-linear");
  });
});

describe("animation.ts - scale", () => {
  it("should have all scale keys with Tailwind classes", () => {
    expect(scale.subtle).toBe("hover:scale-[1.02]");
    expect(scale.default).toBe("hover:scale-105");
    expect(scale.prominent).toBe("hover:scale-110");
  });
});

describe("animation.ts - seconds", () => {
  it("should have correct second values", () => {
    expect(seconds.instant).toBe(0.1);
    expect(seconds.fast).toBe(0.15);
    expect(seconds.normal).toBe(0.2);
    expect(seconds.medium).toBe(0.3);
    expect(seconds.slow).toBe(0.5);
    expect(seconds.dramatic).toBe(1.0);
  });

  it("should match duration in seconds", () => {
    expect(seconds.instant).toBe(Number(duration.instant.replace("duration-", "")) / 1000);
    expect(seconds.fast).toBe(Number(duration.fast.replace("duration-", "")) / 1000);
    expect(seconds.normal).toBe(Number(duration.normal.replace("duration-", "")) / 1000);
  });
});

describe("animation.ts - ms", () => {
  it("should have correct millisecond values", () => {
    expect(ms.instant).toBe(100);
    expect(ms.fast).toBe(150);
    expect(ms.normal).toBe(200);
    expect(ms.medium).toBe(300);
    expect(ms.slow).toBe(500);
    expect(ms.dramatic).toBe(1000);
  });

  it("should match duration in milliseconds", () => {
    expect(ms.instant).toBe(parseInt(duration.instant.replace("duration-", "")));
  });
});

describe("animation.ts - bezier", () => {
  it("should have correct cubic-bezier arrays", () => {
    expect(bezier.default).toEqual([0.4, 0, 0.2, 1]);
    expect(bezier.bounce).toEqual([0.68, -0.55, 0.265, 1.55]);
    expect(bezier.smooth).toEqual([0.25, 0.1, 0.25, 1]);
    expect(bezier.sharp).toEqual([0.4, 0, 1, 1]);
  });
});

describe("animation.ts - stagger", () => {
  it("should have correct stagger values", () => {
    expect(stagger.fast).toBe(0.05);
    expect(stagger.normal).toBe(0.1);
    expect(stagger.slow).toBe(0.15);
  });
});

describe("animation.ts - transition", () => {
  it("should have pre-built transition combinations", () => {
    expect(transition.fast).toBe("duration-150 ease-out");
    expect(transition.normal).toBe("duration-200 ease-out");
    expect(transition.medium).toBe("duration-300 ease-out");
    expect(transition.slow).toBe("duration-500 ease-in-out");
  });
});

describe("animation.ts - radixAnimations", () => {
  it("should have tooltip animations", () => {
    expect(radixAnimations.tooltip.open).toBe("animate-in fade-in-0 zoom-in-95");
    expect(radixAnimations.tooltip.closed).toBe("animate-out fade-out-0 zoom-out-95");
  });

  it("should have dropdown animations", () => {
    expect(radixAnimations.dropdown.content.open).toBe("animate-in");
  });
});

describe("animation.ts - focusRing", () => {
  it("should have focus ring configurations", () => {
    expect(focusRing.default).toContain("focus-visible:outline-none");
    expect(focusRing.default).toContain("focus-visible:ring-2");
    expect(focusRing.subtle).toContain("focus-visible:ring-1");
    expect(focusRing.none).toBe("");
  });
});

describe("animation.ts - hoverScale", () => {
  it("should have hover scale configurations", () => {
    expect(hoverScale.subtle).toContain("hover:scale-[1.02]");
    expect(hoverScale.default).toContain("hover:scale-105");
    expect(hoverScale.prominent).toContain("hover:scale-110");
    expect(hoverScale.subtle).toContain("transition-transform");
  });
});

describe("animation.ts - shake", () => {
  it("should have shake animation configuration", () => {
    expect(shake.duration).toBe(0.4);
    expect(shake.keyframes.x).toEqual([0, -8, 8, -8, 8, -4, 4, -2, 2, 0]);
    expect(shake.transition.duration).toBe(0.4);
  });
});

describe("animation.ts - ANIMATION", () => {
  it("should have all sub-objects", () => {
    expect(ANIMATION.duration).toBe(duration);
    expect(ANIMATION.easing).toBe(easing);
    expect(ANIMATION.scale).toBe(scale);
    expect(ANIMATION.seconds).toBe(seconds);
    expect(ANIMATION.ms).toBe(ms);
    expect(ANIMATION.bezier).toBe(bezier);
    expect(ANIMATION.stagger).toBe(stagger);
    expect(ANIMATION.transition).toBe(transition);
    expect(ANIMATION.radix).toBe(radixAnimations);
    expect(ANIMATION.focusRing).toBe(focusRing);
    expect(ANIMATION.hoverScale).toBe(hoverScale);
    expect(ANIMATION.shake).toBe(shake);
  });
});

describe("animation.ts - Type exports", () => {
  it("should export DurationKey type", () => {
    const keys: DurationKey[] = ["instant", "fast", "normal", "medium", "slow", "dramatic"];
    expect(keys.length).toBe(6);
  });

  it("should export EasingKey type", () => {
    const keys: EasingKey[] = ["default", "smooth", "standard", "linear"];
    expect(keys.length).toBe(4);
  });

  it("should export ScaleKey type", () => {
    const keys: ScaleKey[] = ["subtle", "default", "prominent"];
    expect(keys.length).toBe(3);
  });

  it("should export FocusRingKey type", () => {
    const keys: FocusRingKey[] = ["default", "subtle", "none"];
    expect(keys.length).toBe(3);
  });

  it("should export HoverScaleKey type", () => {
    const keys: HoverScaleKey[] = ["subtle", "default", "prominent"];
    expect(keys.length).toBe(3);
  });
});
