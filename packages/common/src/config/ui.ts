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

/** Visual effect configuration type */
export interface VisualEffects {
  shimmer: {
    color: string;
    size: string;
    duration: string;
    background: string;
  };
  shadows: {
    buttonHover: string;
    cardHover: string;
    glow: string;
  };
}

/**
 * Visual effects configuration
 * Centralized values for shimmer, shadows, and glow effects
 */
export const VISUAL_EFFECTS: VisualEffects = {
  shimmer: {
    color: "#ffffff",
    size: "0.1em",
    duration: "1.5s",
    background: "radial-gradient(ellipse 80% 50% at 50% 120%,rgba(62, 61, 117),rgba(18, 18, 38))",
  },
  shadows: {
    buttonHover: "0 0 40px 8px rgba(62,61,117,0.7)",
    cardHover: "0 10px 40px -10px rgba(0,0,0,0.2)",
    glow: "0 0 20px 4px rgba(62,61,117,0.5)",
  },
};
