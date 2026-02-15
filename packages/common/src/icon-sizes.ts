/**
 * Icon sizing system - Centralized icon dimensions for consistency
 *
 * @example
 * ```tsx
 * import { ICON_SIZES } from "@saasfly/common";
 * <Icon className={ICON_SIZES.sm} />
 * ```
 */

export const ICON_SIZES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
  "3xl": "h-12 w-12",
} as const;

export type IconSizeKey = keyof typeof ICON_SIZES;

export function getIconSize(size: IconSizeKey): string {
  return ICON_SIZES[size];
}

export const BUTTON_ICON_SIZES = {
  default: ICON_SIZES.sm,
  sm: ICON_SIZES.xs,
  lg: ICON_SIZES.md,
} as const;

export const NAV_ICON_SIZES = {
  default: ICON_SIZES.sm,
  menu: ICON_SIZES.md,
  brand: ICON_SIZES.lg,
} as const;

export const FEATURE_ICON_SIZES = {
  default: ICON_SIZES.lg,
  card: ICON_SIZES.md,
  hero: ICON_SIZES.xl,
} as const;

export const STATUS_ICON_SIZES = {
  inline: ICON_SIZES.xs,
  default: ICON_SIZES.sm,
  large: ICON_SIZES.md,
} as const;

export const SOCIAL_ICON_SIZES = {
  default: ICON_SIZES.sm,
  large: ICON_SIZES.md,
} as const;

export const ICON_PRESETS = {
  button: BUTTON_ICON_SIZES,
  nav: NAV_ICON_SIZES,
  feature: FEATURE_ICON_SIZES,
  status: STATUS_ICON_SIZES,
  social: SOCIAL_ICON_SIZES,
} as const;
