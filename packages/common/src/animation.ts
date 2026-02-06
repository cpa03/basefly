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
} as const;

/** Type for duration keys */
export type DurationKey = keyof typeof duration;

/** Type for easing keys */
export type EasingKey = keyof typeof easing;

/** Type for scale keys */
export type ScaleKey = keyof typeof scale;

export default ANIMATION;
