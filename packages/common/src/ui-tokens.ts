/**
 * UI Token Configuration
 * Centralized design tokens for consistent theming across all UI components
 *
 * This module eliminates hardcoded Tailwind classes and magic numbers,
 * making the design system more maintainable and customizable.
 */

import { ANIMATION } from "./animation";

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
    /** Ripple colors by button variant */
    colors: {
      default: "bg-white/30",
      destructive: "bg-white/30",
      outline: "bg-primary/20",
      ghost: "bg-primary/20",
      link: "bg-primary/20",
      secondary: "bg-primary/20",
    },
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
    base: "fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
    background: "bg-background/80",
    blur: "backdrop-blur-sm",
  },

  /** Content container */
  content: {
    base: "fixed bottom-0 z-50 grid w-full gap-4 rounded-b-lg border bg-background p-6 shadow-lg animate-in md:bottom-auto data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-bottom-10 md:max-w-lg md:rounded-lg md:zoom-in-90 data-[state=open]:md:slide-in-from-bottom-0",
    background: "bg-background",
    border: "border",
    shadow: "shadow-lg",
    radius: "rounded-lg",
  },

  /** Animation timing */
  animation: `${ANIMATION.duration.normal} ${ANIMATION.easing.default}`,

  /** Close button */
  closeButton: {
    base: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
    hoverScale: "hover:scale-110",
    activeScale: "active:scale-95",
    position: "absolute right-4 top-4",
    size: "h-4 w-4",
    opacity: "opacity-70 hover:opacity-100",
    transition: `${ANIMATION.duration.fast} ${ANIMATION.easing.default}`,
  },
  header: {
    base: "flex flex-col space-y-1.5",
  },
  footer: {
    base: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  },
  title: {
    base: "text-lg font-semibold leading-none tracking-tight",
  },
  description: {
    base: "text-sm text-muted-foreground",
  },
  defaultAriaLabel: "Close",
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
 * Location badge design tokens
 */
export const LOCATION_BADGE_TOKENS = {
  container:
    "inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-sm text-secondary-foreground",
} as const;

/**
 * Switch design tokens
 * Centralized layout, styling, and animations for Switch component
 */
export const SWITCH_TOKENS = {
  /** Track (container) styling */
  track: {
    base: "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all",
    size: "h-[24px] w-[44px]",
    states: {
      checked: "data-[state=checked]:bg-primary",
      unchecked: "data-[state=unchecked]:bg-input",
    },
    disabled: "disabled:cursor-not-allowed disabled:opacity-50",
    focusRing:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    hoverScale: "hover:scale-[1.03]",
    activeScale: "active:scale-[0.97]",
  },
  /** Thumb (circle slider) styling */
  thumb: {
    base: "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-all",
    size: "h-5 w-5",
    states: {
      checked:
        "data-[state=checked]:translate-x-5 data-[state=checked]:scale-110",
      unchecked:
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:scale-100",
    },
  },
  /** Default fallback aria-label */
  defaultAriaLabel: "Toggle switch",
  /** Transition duration and easing */
  transition: "duration-200 ease-out",
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
/**
 * Callout design tokens
 * Centralized styles and variants for callout components
 */
export const CALLOUT_TOKENS = {
  /** Root base classes */
  base: "mt-6 flex items-start rounded-md border px-4 py-3 transition-all duration-200",
  /** Spring micro-interactions */
  animations: {
    hoverScale: "hover:scale-[1.015]",
    activeScale: "active:scale-[0.995]",
    hoverShadow: "hover:shadow-md transition-shadow duration-200",
  },
  /** Specific variants configuration */
  variants: {
    info: "border-blue-200 bg-blue-100 text-blue-800 dark:border-blue-200/40 dark:bg-blue-900/40 dark:text-blue-200",
    danger:
      "border-red-200 bg-red-100 text-red-900 dark:border-red-200/30 dark:bg-red-900/40 dark:text-red-200",
    warning:
      "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-400/30 dark:bg-orange-400/20 dark:text-orange-300",
    default: "",
  },
} as const;

/**
 * Accordion design tokens
 * Centralized sizing, styling, and animations for Accordion component
 */
export const ACCORDION_TOKENS = {
  /** Item border styling */
  itemBorder: "border-b",
  /** Trigger layout and alignment */
  trigger: {
    base: "flex flex-1 items-center justify-between py-4 text-left font-medium transition-all hover:underline max-sm:text-sm",
    hoverScale: "hover:scale-[1.015]",
    activeScale: "active:scale-[0.985]",
    focusRing:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  },
  /** Content wrapper styling */
  content: {
    base: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    padding: "pb-4 pt-0",
  },
  /** Chevron down layout and animations */
  chevron: {
    size: "h-4 w-4 shrink-0",
    transition: "transition-transform duration-200",
    openRotation: "[&[data-state=open]>svg]:rotate-180",
  },
} as const;

/**
 * Select design tokens
 * Centralized sizing, styling, and transitions for Select component
 */
export const SELECT_TOKENS = {
  trigger: {
    base: "group flex w-full items-center justify-between rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    size: "h-10 px-3 py-2",
    focusRing: "focus:ring-2 focus:ring-ring focus:ring-offset-2",
    hoverScale: "hover:scale-[1.01]",
    activeScale: "active:scale-[0.99]",
    transition: "transition-all duration-200 ease-out",
  },
  chevron: {
    size: "h-4 w-4 shrink-0",
    opacity: "opacity-50",
    transition: "transition-transform duration-200 ease-out",
    openRotation: "group-data-[state=open]:rotate-180",
  },
  content: {
    base: "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
    popperTranslate: "translate-y-1",
  },
  viewport: {
    base: "relative p-1",
    popperSize:
      "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
  },
  label: {
    base: "py-1.5 pl-8 pr-2 text-sm font-semibold",
  },
  item: {
    base: "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    indicatorWrapper:
      "absolute left-2 flex h-3.5 w-3.5 items-center justify-center",
    indicatorSize: "h-4 w-4",
  },
  separator: {
    base: "-mx-1 my-1 h-px bg-muted",
  },
} as const;

/**
 * Checkbox design tokens
 * Centralized styles, transitions, and scales for the Checkbox component
 */
export const CHECKBOX_TOKENS = {
  root: {
    base: "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    states: {
      checked:
        "data-[state=checked]:scale-110 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:animate-in data-[state=checked]:zoom-in-50",
      unchecked: "data-[state=unchecked]:scale-100",
    },
    hoverScale: "hover:scale-[1.05]",
    activeScale: "active:scale-[0.95]",
  },
  indicator: {
    base: "flex items-center justify-center text-current transition-transform duration-200 ease-out",
    states: {
      checked: "data-[state=checked]:scale-100",
      unchecked: "data-[state=unchecked]:scale-0",
    },
  },
  iconSize: "h-4 w-4",
  defaultAriaLabel: "Toggle checkbox",
  transition: "duration-200 ease-out",
} as const;

/**
 * Textarea design tokens
 * Centralized layout, styling, and transitions for Textarea component
 */
export const TEXTAREA_TOKENS = {
  /** Minimum height in pixels */
  minHeight: "min-h-[80px]",
  /** Base textarea style */
  base: "flex w-full rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  /** Padding */
  padding: "px-3 py-2",
  /** Hover and focus transition and timing with subtle tactile spring interaction */
  transition:
    "transition-all duration-200 ease-in-out hover:border-muted-foreground/50",
  /** Active scale spring micro-interaction */
  activeScale: "active:scale-[0.995]",
  /** Error state styling */
  error: {
    border: "border-destructive",
    focusRing: "focus-visible:ring-destructive",
  },
  /** Default fallback aria-label */
  defaultAriaLabel: "Text area input",
} as const;

/**
 * DataTableEmpty design tokens
 * Centralized layout, styling, micro-UX transitions, and accessibility for DataTableEmpty component
 */
export const DATA_TABLE_EMPTY_TOKENS = {
  /** Root cell container styling */
  cell: "p-0",
  /** Container layout and sizing */
  container: {
    base: "group flex min-h-[280px] flex-col items-center justify-center border-0 bg-transparent px-8 py-12 transition-all duration-300 ease-out",
    hoverScale: "hover:scale-[1.005]",
    activeScale: "active:scale-[0.995]",
  },
  /** Icon wrapper styling and hover micro-interaction */
  iconWrapper: {
    base: "flex h-16 w-16 items-center justify-center rounded-full bg-muted transition-all duration-300 ease-out group-hover:scale-110 group-hover:bg-muted/80 motion-safe:transition-transform motion-safe:duration-300",
    iconSize:
      "h-8 w-8 text-muted-foreground transition-colors duration-300 group-hover:text-primary",
  },
  /** Content wrapper */
  contentWrapper:
    "mx-auto flex max-w-[400px] flex-col items-center text-center motion-safe:transition-all motion-safe:duration-300 motion-safe:delay-75",
  /** Title typography */
  title:
    "text-lg font-semibold text-foreground motion-safe:transition-colors motion-safe:duration-200 group-hover:text-foreground/90",
  /** Description typography */
  description:
    "mt-2 text-sm text-muted-foreground leading-relaxed motion-safe:transition-colors motion-safe:duration-200",
  /** Action container */
  action:
    "mt-6 motion-safe:transition-all motion-safe:duration-300 motion-safe:translate-y-0 motion-safe:opacity-100 motion-safe:delay-100",
  /** Accessibility fallback */
  defaultAriaLabel: "Empty state: No results found",
} as const;

/**
 * Popover design tokens
 * Centralized layout, styling, transitions, and accessibility for Popover component
 */
export const POPOVER_TOKENS = {
  trigger: {
    base: "inline-flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    hoverScale: "hover:scale-[1.01]",
    activeScale: "active:scale-[0.99]",
  },
  content: {
    base: "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 transition-all duration-200 ease-out",
  },
  defaultAriaLabel: "Popover content",
} as const;

/**
 * Tabs design tokens
 * Centralized layout, styling, micro-UX transitions, and accessibility for Tabs component
 */
export const TABS_TOKENS = {
  list: {
    base: "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  },
  trigger: {
    base: "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    hoverScale: "hover:scale-[1.01]",
    activeScale: "active:scale-[0.99]",
  },
  content: {
    base: "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  },
} as const;

/**
 * CopyButton design tokens
 * Centralized layout, styling, micro-UX transitions, and accessibility for CopyButton component
 */
export const COPY_BUTTON_TOKENS = {
  /** Root base layout */
  base: "relative inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  /** Tactile spring scale micro-interactions */
  animations: {
    hoverScale: "hover:scale-[1.03]",
    activeScale: "active:scale-[0.97]",
    pressScale: "scale-90",
  },
  /** Size variants */
  sizes: {
    sm: {
      button: "h-7 w-7",
      icon: "h-3.5 w-3.5",
    },
    default: {
      button: "h-9 w-9",
      icon: "h-4 w-4",
    },
    lg: {
      button: "h-11 w-11",
      icon: "h-5 w-5",
    },
  },
  /** Variant styles */
  variants: {
    default: "bg-background border border-input hover:bg-muted hover:text-foreground",
    ghost: "bg-transparent hover:bg-muted hover:text-foreground",
    outline: "bg-transparent border border-input hover:bg-muted hover:text-foreground",
  },
  /** Success feedback styling */
  success: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
  /** Default fallback aria labels and tooltips */
  defaultTooltipText: "Copy to clipboard",
  defaultSuccessText: "Copied!",
  transition: "transition-all duration-200 ease-out",
} as const;

/**
 * Table design tokens
 * Centralized layout, styling, micro-UX transitions, and accessibility for Table component
 */
export const TABLE_TOKENS = {
  /** Table wrapper element */
  wrapper: "w-full overflow-auto",
  /** Root table element */
  table: "w-full caption-bottom text-sm",
  /** Header section styling */
  header: "[&_tr]:border-b",
  /** Body section styling */
  body: "[&_tr:last-child]:border-0",
  /** Footer section styling */
  footer: "bg-primary font-medium text-primary-foreground",
  /** Row styling and micro-interactions */
  row: {
    base: "border-b transition-all duration-200 hover:bg-muted/50 data-[state=selected]:bg-muted",
    disabled: "pointer-events-none text-muted-foreground opacity-80",
    hoverScale: "hover:scale-[1.002]",
    activeScale: "active:scale-[0.998]",
  },
  /** Header cell styling */
  head: "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
  /** Body cell styling */
  cell: "p-4 align-middle [&:has([role=checkbox])]:pr-0",
  /** Caption styling */
  caption: "mt-4 text-sm text-muted-foreground",
} as const;

/**
 * Sheet design tokens
 * Centralized sizing, styling, transitions, and accessibility for Sheet component
 */
export const SHEET_TOKENS = {
  portal: {
    positions: {
      top: "items-start",
      bottom: "items-end",
      left: "justify-start",
      right: "justify-end",
    },
  },
  overlay: {
    base: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
  },
  variants: {
    position: {
      top: "animate-in slide-in-from-top w-full duration-300",
      bottom: "animate-in slide-in-from-bottom w-full duration-300",
      left: "animate-in slide-in-from-left h-full duration-300",
      right: "animate-in slide-in-from-right h-full duration-300",
    },
  },
  content: {
    base: "fixed z-50 scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg border",
  },
  closeButton: {
    base: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-all duration-200 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary",
    hoverScale: "hover:scale-110",
    activeScale: "active:scale-95",
    iconSize: "h-4 w-4",
  },
  header: "flex flex-col space-y-2 text-center sm:text-left",
  footer: "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
  title: "text-lg font-semibold text-foreground",
  description: "text-sm text-muted-foreground",
  defaultAriaLabel: "Close",
} as const;

export type ButtonHeight = keyof typeof BUTTON_TOKENS.heights;
export type ButtonPadding = keyof typeof BUTTON_TOKENS.padding;
export type InputHeight = keyof typeof INPUT_TOKENS.heights;
export type CardPadding = keyof typeof CARD_TOKENS.padding;
export type BadgeSize = keyof typeof BADGE_TOKENS.sizes;
export type FocusVariant = keyof typeof FOCUS_TOKENS;
