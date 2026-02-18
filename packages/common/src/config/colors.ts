/**
 * Color Configuration
 *
 * Centralized color palette for the entire application.
 * All color values should be defined here and imported from this module.
 * This eliminates hardcoded color values scattered across the codebase.
 *
 * @module @saasfly/common/config/colors
 *
 * @example
 * ```ts
 * import { COLORS_CONFIG, getRandomColor } from "@saasfly/common";
 *
 * // Use brand colors
 * console.log(COLORS_CONFIG.brand.primary); // "#3b82f6"
 *
 * // Get a random color from palette
 * const randomColor = getRandomColor();
 * ```
 */

/**
 * Brand colors - Primary brand identity colors
 */
export const BRAND_COLORS = {
  /** Primary brand color - Blue */
  primary: "#3b82f6" as const,
  /** Secondary brand color - Purple */
  secondary: "#8b5cf6" as const,
  /** Accent brand color - Orange */
  accent: "#FF782B" as const,
} as const;

/**
 * Semantic colors - Colors with specific meaning
 */
export const SEMANTIC_COLORS = {
  /** Success states - Green */
  success: "#10b981" as const,
  /** Warning states - Amber */
  warning: "#f59e0b" as const,
  /** Error states - Red */
  error: "#ef4444" as const,
  /** Info states - Blue */
  info: "#3b82f6" as const,
} as const;

/**
 * Neutral colors - Grayscale palette
 */
export const NEUTRAL_COLORS = {
  /** Pure black */
  black: "#000000" as const,
  /** Pure white */
  white: "#ffffff" as const,
  /** Dark gray */
  dark: "#1f2937" as const,
  /** Medium gray */
  medium: "#6b7280" as const,
  /** Light gray */
  light: "#e5e7eb" as const,
  /** Lighter gray */
  lighter: "#f3f4f6" as const,
} as const;

/**
 * Pattern colors - Colors used in SVG patterns and backgrounds
 */
export const PATTERN_COLORS = {
  /** Default pattern color - Black */
  default: "#000000" as const,
  /** Pattern opacity for subtle backgrounds */
  opacity: {
    light: "0.1" as const,
    medium: "0.5" as const,
    dark: "0.8" as const,
  },
} as const;

/**
 * Material Design inspired color palette
 * Used for colorful patterns and visual elements
 */
export const MATERIAL_PALETTE = {
  red: "#e51c23" as const,
  pink: "#e91e63" as const,
  purple: "#9c27b0" as const,
  deepPurple: "#673ab7" as const,
  indigo: "#3f51b5" as const,
  blue: "#5677fc" as const,
  lightBlue: "#03a9f4" as const,
  cyan: "#00bcd4" as const,
  teal: "#009688" as const,
  green: "#259b24" as const,
  lightGreen: "#8bc34a" as const,
  lime: "#afb42b" as const,
  yellow: "#ffeb3b" as const,
  amber: "#ffc107" as const,
  orange: "#ff9800" as const,
  deepOrange: "#ff5722" as const,
  brown: "#795548" as const,
  grey: "#607d8b" as const,
} as const;

/**
 * Gradient colors - Used for gradients and special effects
 */
export const GRADIENT_COLORS = {
  /** Warm gradient - Orange/Amber */
  warm: {
    start: "#ffaa40" as const,
    mid: "#9c40ff" as const,
    end: "#ffaa40" as const,
  },
  /** Cool gradient - Blue/Purple */
  cool: {
    start: "#3b82f6" as const,
    mid: "#8b5cf6" as const,
    end: "#3b82f6" as const,
  },
  /** Sunset gradient */
  sunset: {
    start: "#f97316" as const,
    mid: "#ec4899" as const,
    end: "#8b5cf6" as const,
  },
} as const;

/**
 * Shadow colors - Used for box shadows and elevation
 */
export const SHADOW_COLORS = {
  /** Light shadow - subtle elevation */
  light: {
    DEFAULT: "rgba(0, 0, 0, 0.05)" as const,
    dark: "rgba(0, 0, 0, 0.1)" as const,
  },
  /** Medium shadow - standard elevation */
  medium: {
    DEFAULT: "rgba(0, 0, 0, 0.1)" as const,
    dark: "rgba(0, 0, 0, 0.2)" as const,
  },
  /** Dark shadow - high elevation */
  dark: {
    DEFAULT: "rgba(0, 0, 0, 0.2)" as const,
    dark: "rgba(0, 0, 0, 0.4)" as const,
  },
  /** Dark mode specific shadows */
  darkMode: {
    border: "rgba(255, 255, 255, 0.1)" as const,
    inset: "rgba(255, 255, 255, 0.05)" as const,
    glow: "rgba(255, 255, 255, 0.15)" as const,
  },
} as const;

/**
 * HSL colors - For HSL-based styling
 */
export const HSL_COLORS = {
  /** White in HSL */
  white: "hsl(0 0% 100%/1)" as const,
  /** Black in HSL */
  black: "hsl(0 0% 0%/1)" as const,
  /** Primary in HSL */
  primary: "hsl(217 91% 60%/1)" as const,
} as const;

/**
 * Complete colors configuration
 */
export const COLORS_CONFIG = {
  brand: BRAND_COLORS,
  semantic: SEMANTIC_COLORS,
  neutral: NEUTRAL_COLORS,
  pattern: PATTERN_COLORS,
  material: MATERIAL_PALETTE,
  gradient: GRADIENT_COLORS,
  shadow: SHADOW_COLORS,
  hsl: HSL_COLORS,
} as const;

/**
 * Array of all material palette colors for random selection
 */
export const MATERIAL_COLOR_ARRAY = Object.values(MATERIAL_PALETTE);

/**
 * Get a random color from the material palette
 * @returns A random hex color from the material palette
 */
export function getRandomMaterialColor(): string {
  const randomIndex = Math.floor(Math.random() * MATERIAL_COLOR_ARRAY.length);
  return MATERIAL_COLOR_ARRAY[randomIndex]!;
}

/**
 * Get multiple random colors from the material palette
 * @param count - Number of colors to get
 * @returns Array of random hex colors
 */
export function getRandomMaterialColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(getRandomMaterialColor());
  }
  return colors;
}

/**
 * Get pattern SVG with specified color and opacity
 * @param color - Hex color value
 * @param opacity - Opacity value (0-1)
 * @returns SVG string with color applied
 */
export function getPatternWithColor(
  svgString: string,
  color: string,
  opacity?: string,
): string {
  let result = svgString.replace(/fill="#000"/g, `fill="${color}"`);
  if (opacity) {
    result = result.replace(/opacity="[^"]*"/g, `opacity="${opacity}"`);
  }
  return result;
}

/**
 * Type for brand colors
 */
export type BrandColor = keyof typeof BRAND_COLORS;

/**
 * Type for semantic colors
 */
export type SemanticColor = keyof typeof SEMANTIC_COLORS;

/**
 * Type for material palette colors
 */
export type MaterialColor = keyof typeof MATERIAL_PALETTE;

/**
 * Type for gradient color sets
 */
export type GradientColorSet = keyof typeof GRADIENT_COLORS;

// Default export for convenience
export default COLORS_CONFIG;
