/**
 * Animation timing constants for consistent transitions across the application.
 * These constants provide complete Tailwind class names that work with Tailwind's JIT compiler.
 *
 * Usage:
 * ```tsx
 * import { ANIMATION } from "@saasfly/common";
 *
 * // In className
 * className={`transition-all ${ANIMATION.transition.duration.medium} ${ANIMATION.transition.scale.default}`}
 *
 * // In Framer Motion (use seconds)
 * transition={{ duration: ANIMATION.seconds.medium }}
 * ```
 */

/** Tailwind transition duration classes */
export const duration = {
  /** 100ms - Instant feedback */
  instant: "duration-100",
  /** 150ms - Quick micro-interactions */
  fast: "duration-150",
  /** 200ms - Standard hover effects */
  normal: "duration-200",
  /** 300ms - Emphasis animations */
  medium: "duration-300",
  /** 500ms - Dramatic transitions */
  slow: "duration-500",
  /** 1000ms - Major state changes */
  dramatic: "duration-1000",
} as const;

/** Tailwind transition timing function classes */
export const easing = {
  /** ease-out - Standard for UI interactions */
  default: "ease-out",
  /** ease-in-out - Smooth transitions */
  smooth: "ease-in-out",
  /** ease - Standard ease */
  standard: "ease",
  /** linear - Constant speed */
  linear: "ease-linear",
} as const;

/** Tailwind scale transform classes for hover effects */
export const scale = {
  /** Subtle scale for cards */
  subtle: "hover:scale-[1.02]",
  /** Standard scale for buttons */
  default: "hover:scale-105",
  /** Prominent scale for emphasis */
  prominent: "hover:scale-110",
} as const;

/** Duration values in seconds for Framer Motion and other JS animation libraries */
export const seconds = {
  /** 0.1s - Instant feedback */
  instant: 0.1,
  /** 0.15s - Quick micro-interactions */
  fast: 0.15,
  /** 0.2s - Standard hover effects */
  normal: 0.2,
  /** 0.3s - Emphasis animations */
  medium: 0.3,
  /** 0.5s - Dramatic transitions */
  slow: 0.5,
  /** 1.0s - Major state changes */
  dramatic: 1.0,
} as const;

/** Duration values in milliseconds */
export const ms = {
  instant: 100,
  fast: 150,
  normal: 200,
  medium: 300,
  slow: 500,
  dramatic: 1000,
} as const;

/** Easing functions as cubic-bezier arrays for Framer Motion */
export const bezier = {
  /** Standard ease-out for UI interactions */
  default: [0.4, 0, 0.2, 1] as const,
  /** Bounce effect for playful elements */
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
  /** Smooth ease for entrances */
  smooth: [0.25, 0.1, 0.25, 1] as const,
  /** Sharp ease for exits */
  sharp: [0.4, 0, 1, 1] as const,
} as const;

/** Stagger delays in seconds for list animations */
export const stagger = {
  /** 0.05s - Fast stagger for quick lists */
  fast: 0.05,
  /** 0.1s - Normal stagger for standard lists */
  normal: 0.1,
  /** 0.15s - Slow stagger for dramatic reveals */
  slow: 0.15,
} as const;

/** Pre-built transition class combinations for common use cases */
export const transition = {
  /** Quick micro-interaction */
  fast: `${duration.fast} ${easing.default}`,
  /** Standard hover effect */
  normal: `${duration.normal} ${easing.default}`,
  /** Emphasis animation */
  medium: `${duration.medium} ${easing.default}`,
  /** Dramatic transition */
  slow: `${duration.slow} ${easing.smooth}`,
} as const;

/** Radix UI animation class constants for consistent component animations */
export const radixAnimations = {
  /** Tooltip animation classes - fade and zoom */
  tooltip: {
    open: "animate-in fade-in-0 zoom-in-95",
    closed: "animate-out fade-out-0 zoom-out-95",
    slideBottom: "data-[side=bottom]:slide-in-from-top-2",
    slideLeft: "data-[side=left]:slide-in-from-right-2",
    slideRight: "data-[side=right]:slide-in-from-left-2",
    slideTop: "data-[side=top]:slide-in-from-bottom-2",
    get all() {
      return `${this.open} ${this.closed} ${this.slideBottom} ${this.slideLeft} ${this.slideRight} ${this.slideTop}`;
    },
  },
  /** Dropdown menu animation classes */
  dropdown: {
    content: {
      open: "animate-in",
      slideBottom: "data-[side=bottom]:slide-in-from-top-2",
      slideLeft: "data-[side=left]:slide-in-from-right-2",
      slideRight: "data-[side=right]:slide-in-from-left-2",
      slideTop: "data-[side=top]:slide-in-from-bottom-2",
      get all() {
        return `${this.open} ${this.slideBottom} ${this.slideLeft} ${this.slideRight} ${this.slideTop}`;
      },
    },
    subContent: {
      open: "animate-in",
      slideBottom: "data-[side=bottom]:slide-in-from-top-1",
      slideLeft: "data-[side=left]:slide-in-from-right-1",
      slideRight: "data-[side=right]:slide-in-from-left-1",
      slideTop: "data-[side=top]:slide-in-from-bottom-1",
      get all() {
        return `${this.open} ${this.slideBottom} ${this.slideLeft} ${this.slideRight} ${this.slideTop}`;
      },
    },
  },
} as const;

/** Focus ring configuration for consistent keyboard navigation */
export const focusRing = {
  /** Standard focus ring for interactive elements */
  default:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  /** Subtle focus ring for smaller elements */
  subtle:
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
  /** No focus ring (for custom implementations) */
  none: "",
} as const;

/** Hover scale configuration for micro-interactions */
export const hoverScale = {
  /** Subtle scale for cards and containers */
  subtle: "hover:scale-[1.02] transition-transform duration-150 ease-out",
  /** Standard scale for buttons */
  default: "hover:scale-105 transition-transform duration-150 ease-out",
  /** Prominent scale for emphasis */
  prominent: "hover:scale-110 transition-transform duration-150 ease-out",
} as const;

/** Shake animation configuration for form validation errors */
export const shake = {
  /** Duration of the shake animation in seconds */
  duration: 0.4,
  /** Keyframes for horizontal shake motion */
  keyframes: {
    x: [0, -8, 8, -8, 8, -4, 4, -2, 2, 0],
  },
  /** Timing configuration for Framer Motion */
  transition: {
    duration: 0.4,
    ease: "easeInOut" as const,
  },
} as const;

/** Complete animation presets */
export const ANIMATION = {
  duration,
  easing,
  scale,
  seconds,
  ms,
  bezier,
  stagger,
  transition,
  radix: radixAnimations,
  focusRing,
  hoverScale,
  shake,
} as const;

/** Type for duration keys */
export type DurationKey = keyof typeof duration;

/** Type for easing keys */
export type EasingKey = keyof typeof easing;

/** Type for scale keys */
export type ScaleKey = keyof typeof scale;

/** Type for focus ring keys */
export type FocusRingKey = keyof typeof focusRing;

/** Type for hover scale keys */
export type HoverScaleKey = keyof typeof hoverScale;

export default ANIMATION;
