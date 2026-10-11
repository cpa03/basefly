import { cva, type VariantProps } from "class-variance-authority";

import { BUTTON_TOKENS } from "@saasfly/common";

/**
 * Button variants using class-variance-authority
 * This is kept separate from the Button component to allow usage in both
 * server and client components.
 */
export const buttonVariants = cva(BUTTON_TOKENS.base, {
  variants: {
    variant: BUTTON_TOKENS.variants,
    size: {
      default: `${BUTTON_TOKENS.heights.default} ${BUTTON_TOKENS.padding.default}`,
      sm: `${BUTTON_TOKENS.heights.sm} ${BUTTON_TOKENS.radius.sm} ${BUTTON_TOKENS.padding.sm}`,
      lg: `${BUTTON_TOKENS.heights.lg} ${BUTTON_TOKENS.radius.lg} ${BUTTON_TOKENS.padding.lg}`,
      icon: BUTTON_TOKENS.heights.icon,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
