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
    elevated:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
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

/**
 * Extended semantic color tokens for form validation states
 * Centralized to eliminate hardcoded Tailwind classes
 */
export const FORM_COLORS = {
  error: {
    border: "border-red-500",
    ring: "focus-visible:ring-red-500",
    text: "text-red-600",
    icon: "text-red-500",
    background: "bg-red-600",
  },
  success: {
    border: "border-green-500",
    ring: "focus-visible:ring-green-500",
    text: "text-green-600",
    icon: "text-green-500",
  },
  required: {
    indicator: "text-red-500",
  },
} as const;

/**
 * Form timing configuration
 * Centralized debounce, delay, and reset timings
 */
export const FORM_TIMING = {
  /** Default debounce delay for input validation (ms) */
  debounceMs: 300,
  /** Default reset delay for form submission state (ms) */
  resetDelay: 2000,
  /** Delay before removing toasts from DOM (ms) */
  toastRemoveDelay: 1000000,
  /** Delay before auto-completing progress (ms) */
  progressAutoCompleteDelay: 50,
} as const;

/** Type for form color config */
export type FormColors = typeof FORM_COLORS;

/**
 * Notification colors for UI components
 * Centralized colors for notification cards, badges, and status indicators
 */
export const NOTIFICATION_COLORS = {
  /** Teal/Green - for payment/success notifications */
  payment: "#00C9A7",
  /** Gold/Yellow - for user/signup notifications */
  signup: "#FFB800",
  /** Pink/Red - for message/email notifications */
  message: "#FF3D71",
  /** Blue - for deployment/system notifications */
  deployment: "#1E86FF",
} as const;

/**
 * Type for notification color keys
 */
export type NotificationColorKey = keyof typeof NOTIFICATION_COLORS;

/**
 * Available theme options
 * Centralized to ensure consistency across theme toggle components
 */
export const THEMES = ["light", "dark", "system"] as const;

/** Type for theme values */
export type Theme = (typeof THEMES)[number];

/**
 * Page progress bar configuration
 * Centralized animation and timing constants
 */
export const PAGE_PROGRESS_CONFIG = {
  /** Default height of the progress bar in pixels */
  defaultHeight: 3,
  /** Default delay before animation starts (ms) */
  defaultDelay: 100,
  /** Maximum progress value before completion (0-100) */
  maxProgress: 90,
  /** Progress increment multiplier for smooth animation */
  incrementMultiplier: 0.05,
  /** Delay before hiding after completion (ms) */
  hideDelay: 200,
  /** Duration of the fade out transition (ms) */
  fadeDuration: 300,
  /** Time to wait before auto-completing (ms) */
  autoCompleteDelay: 50,
} as const;

/**
 * Navbar configuration
 * Scroll and appearance settings
 */
export const NAVBAR_CONFIG = {
  /** Scroll threshold in pixels before triggering navbar style change */
  scrollThreshold: 50,
} as const;
