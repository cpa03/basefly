/**
 * UI Configuration
 * Centralized configuration for UI components and behaviors
 */

/** Transition preset classes for consistent animations */
export const TRANSITION_PRESETS = {
  /** Container transitions for cards and sections */
  container: "transition-all duration-300 ease-out",
  /** Interactive element transitions */
  interactive: "transition-all duration-200 ease-out",
  /** Button transitions */
  button: "transition-all duration-150 ease-out",
  /** Link transitions */
  link: "transition-colors duration-150",
} as const;

/** Visual effects configuration */
export const VISUAL_EFFECTS = {
  /** Shimmer animation defaults */
  shimmer: {
    color: "rgba(255, 255, 255, 0.5)",
    size: "1px",
    duration: "2s",
    background: "linear-gradient(to right, #3b82f6, #8b5cf6, #3b82f6)",
  },
  /** Shadow defaults */
  shadows: {
    buttonHover: "0 10px 40px -10px rgba(59, 130, 246, 0.5)",
    card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    elevated: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
} as const;

/** Type for transition preset keys */
export type TransitionPresetKey = keyof typeof TRANSITION_PRESETS;

/** Type for visual effects config */
export type VisualEffects = typeof VISUAL_EFFECTS;

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


