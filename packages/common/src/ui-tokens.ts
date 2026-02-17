/**
 * UI Token Configuration
 * Centralized design tokens for consistent theming across all UI components
 *
 * This module eliminates hardcoded Tailwind classes and magic numbers,
 * making the design system more maintainable and customizable.
 */

import { ANIMATION } from "@saasfly/common";

/**
 * Button design tokens
 * Centralized sizing, timing, and effects for button components
 */
export const BUTTON_TOKENS = {
  /** Ripple animation configuration */
  ripple: {
    /** Default ripple size in pixels - extracted from var(--ripple-size, 200px) */
    size: 200,
    /** Duration of ripple animation in milliseconds */
    duration: 600,
    /** CSS custom property name for ripple size */
    cssVar: "--ripple-size",
  },

  /** Button height sizing tokens (in Tailwind spacing units) */
  heights: {
    /** Small button: 36px (h-9) */
    sm: "h-9",
    /** Default button: 40px (h-10) */
    default: "h-10",
    /** Large button: 44px (h-11) */
    lg: "h-11",
    /** Icon button: 40px square (h-10 w-10) */
    icon: "h-10 w-10",
  },

  /** Button padding tokens */
  padding: {
    sm: "px-3",
    default: "px-4 py-2",
    lg: "px-8",
    icon: "",
  },

  /** Border radius tokens */
  radius: {
    default: "rounded-md",
    sm: "rounded-md",
    lg: "rounded-md",
  },

  /** Icon sizing within buttons */
  iconSize: "h-4 w-4",

  /** Loading spinner animation */
  spinnerAnimation: "animate-spin",

  /** Active state scale effect */
  activeScale: "active:scale-[0.97]",

  /** Transition timing */
  transition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
} as const;

/**
 * Input design tokens
 * Centralized sizing and styling for input components
 */
export const INPUT_TOKENS = {
  /** Input heights */
  heights: {
    /** Default input height: 40px (h-10) */
    default: "h-10",
    /** Small input height: 36px (h-9) */
    sm: "h-9",
    /** Large input height: 44px (h-11) */
    lg: "h-11",
  },

  /** Textarea minimum height - extracted from min-h-[80px] */
  textareaMinHeight: 80,

  /** Focus ring configuration */
  focusRing: {
    default:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    error: "focus-visible:ring-red-500",
    success: "focus-visible:ring-green-500",
  },

  /** Border styling */
  border: {
    default: "border border-input",
    error: "border-red-500",
    success: "border-green-500",
  },

  /** Background and text */
  appearance: {
    background: "bg-background",
    text: "text-sm",
    placeholder: "placeholder:text-muted-foreground",
  },

  /** Disabled state */
  disabled: "disabled:cursor-not-allowed disabled:opacity-50",

  /** Padding */
  padding: "px-3 py-2",
} as const;

/**
 * Card design tokens
 * Centralized sizing and styling for card components
 */
export const CARD_TOKENS = {
  /** Border radius */
  radius: "rounded-xl",

  /** Border styling */
  border: "border",

  /** Background */
  background: "bg-card",

  /** Text color */
  textColor: "text-card-foreground",

  /** Shadow (when elevated) */
  shadow: "shadow-sm",

  /** Padding variants */
  padding: {
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  },
} as const;

/**
 * Dialog/Modal design tokens
 */
export const DIALOG_TOKENS = {
  /** Overlay backdrop styling */
  overlay: {
    background: "bg-background/80",
    blur: "backdrop-blur-sm",
  },

  /** Content container */
  content: {
    background: "bg-background",
    border: "border",
    shadow: "shadow-lg",
    radius: "rounded-lg",
  },

  /** Animation timing */
  animation: `${ANIMATION.duration.normal} ${ANIMATION.easing.default}`,

  /** Close button */
  closeButton: {
    position: "absolute right-4 top-4",
    size: "h-4 w-4",
    opacity: "opacity-70 hover:opacity-100",
    transition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
  },
} as const;

/**
 * Status badge design tokens
 */
export const BADGE_TOKENS = {
  /** Size variants */
  sizes: {
    sm: {
      dot: "h-2 w-2",
      text: "text-xs",
      padding: "px-2 py-0.5",
    },
    default: {
      dot: "h-2.5 w-2.5",
      text: "text-sm",
      padding: "px-2.5 py-1",
    },
    lg: {
      dot: "h-3 w-3",
      text: "text-base",
      padding: "px-3 py-1.5",
    },
  },

  /** Border radius */
  radius: "rounded-full",

  /** Loading animation */
  loadingAnimation: "animate-spin",

  /** Role for accessibility */
  role: "status",
} as const;

/**
 * Focus management tokens
 * Consistent focus ring styles across all interactive elements
 */
export const FOCUS_TOKENS = {
  /** Standard focus ring */
  default:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",

  /** Subtle focus ring for smaller elements */
  subtle:
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",

  /** No focus ring (for custom implementations) */
  none: "",

  /** Destructive action focus ring */
  destructive:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
} as const;

/**
 * Animation timing tokens for UI components
 * Re-exports from ANIMATION with component-specific naming
 */
export const UI_ANIMATION = {
  /** Micro-interactions (hover, focus) */
  micro: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,

  /** Standard transitions (most UI elements) */
  standard: `${ANIMATION.duration.normal} ${ANIMATION.easing.default}`,

  /** Emphasis animations (modals, page transitions) */
  emphasis: `${ANIMATION.duration.medium} ${ANIMATION.easing.default}`,

  /** Duration values in milliseconds */
  duration: {
    fast: ANIMATION.ms.fast,
    normal: ANIMATION.ms.normal,
    medium: ANIMATION.ms.medium,
    slow: ANIMATION.ms.slow,
  },

  /** Scale effects */
  scale: {
    subtle: "hover:scale-[1.02]",
    default: "hover:scale-105",
    prominent: "hover:scale-110",
  },
} as const;

// Type exports for TypeScript support
export type ButtonHeight = keyof typeof BUTTON_TOKENS.heights;
export type ButtonPadding = keyof typeof BUTTON_TOKENS.padding;
export type InputHeight = keyof typeof INPUT_TOKENS.heights;
export type CardPadding = keyof typeof CARD_TOKENS.padding;
export type BadgeSize = keyof typeof BADGE_TOKENS.sizes;
export type FocusVariant = keyof typeof FOCUS_TOKENS;
