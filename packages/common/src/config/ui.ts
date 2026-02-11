/**
 * UI Configuration
 * Centralized configuration for UI components and behaviors
 */

/** Toast configuration type */
export interface ToastConfig {
  limit: number;
  removeDelay: number;
}

/** Feedback timing configuration type */
export interface FeedbackTiming {
  copySuccess: number;
  toastDisplay: number;
  tooltipDelay: number;
  snackbarDelay: number;
}

/** Animation timing configuration type */
export interface AnimationTiming {
  fast: number;
  normal: number;
  slow: number;
  stagger: number;
}

/** Semantic color tokens for consistent theming */
export interface SemanticColors {
  success: {
    icon: string;
    text: string;
  };
  destructive: {
    background: string;
    ring: string;
  };
}

/**
 * Toast notification configuration
 */
export const TOAST_CONFIG: ToastConfig = {
  /** Maximum number of toasts displayed simultaneously */
  limit: 1,
  /** Delay in ms before removing dismissed toasts from DOM */
  removeDelay: 1000000, // ~16 minutes
};

/**
 * Feedback timing configuration
 * Standard durations for user feedback elements
 */
export const FEEDBACK_TIMING: FeedbackTiming = {
  /** Duration to show copy success indicator (ms) */
  copySuccess: 2000,
  /** Default toast display duration (ms) */
  toastDisplay: 5000,
  /** Tooltip hover delay (ms) */
  tooltipDelay: 200,
  /** Snackbar auto-dismiss delay (ms) */
  snackbarDelay: 3000,
};

/**
 * Animation timing configuration
 * Standard durations for animations and transitions
 */
export const ANIMATION_TIMING: AnimationTiming = {
  /** Fast transitions (hover states, etc.) */
  fast: 150,
  /** Normal transitions (most UI elements) */
  normal: 200,
  /** Slow transitions (page transitions, modals) */
  slow: 300,
  /** Stagger delay for lists */
  stagger: 50,
};

/**
 * Semantic color tokens
 * Use these instead of hardcoded color classes for consistency
 */
export const SEMANTIC_COLORS: SemanticColors = {
  success: {
    icon: "text-green-500",
    text: "text-green-600",
  },
  destructive: {
    background: "bg-red-600",
    ring: "focus:ring-red-600",
  },
};

/**
 * Transition presets for consistent animations across components
 * @deprecated Use ANIMATION from @saasfly/common instead
 */
export const TRANSITION_PRESETS = {
  /** Container transitions for cards and sections */
  container: "transition-all duration-200 ease-out",
  /** Interactive element transitions for buttons and links */
  interactive: "transition-colors duration-150 ease-out",
  /** Transform transitions for scale effects */
  transform: "transition-transform duration-150 ease-out",
  /** Shimmer effect for loading states */
  shimmer: "animate-shimmer",
  /** Shadow transitions */
  shadows: "transition-shadow duration-200 ease-out",
} as const;

/**
 * Visual effects configuration
 * @deprecated Use ANIMATION from @saasfly/common instead
 */
export const VISUAL_EFFECTS = {
  /** Transition presets */
  transition: TRANSITION_PRESETS,
  /** Shimmer button configuration */
  shimmer: {
    color: "#ffffff",
    size: "1px",
    duration: "2s",
    background: "#000000",
  },
  /** Shadow effects */
  shadows: {
    buttonHover: "0 0 20px rgba(0,0,0,0.3)",
  },
} as const;

/** Type for visual effects configuration */
export type VisualEffects = typeof VISUAL_EFFECTS;
