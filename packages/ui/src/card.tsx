import * as React from "react";

import { CARD_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Enables interactive hover effects (lift and shadow enhancement)
   * Use when the card is clickable or interactive
   * @default false
   */
  interactive?: boolean;
}

const Card = React.memo(
  React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, interactive = false, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          CARD_TOKENS.base,
          interactive && [
            CARD_TOKENS.interactive.cursor,
            CARD_TOKENS.interactive.transition,
            CARD_TOKENS.interactive.hoverTranslate,
            CARD_TOKENS.interactive.hoverScale,
            CARD_TOKENS.interactive.activeScale,
            CARD_TOKENS.interactive.hoverShadow,
            CARD_TOKENS.interactive.focusRing,
          ],
          className,
        )}
        {...props}
      />
    ),
  ),
);
Card.displayName = "Card";

const CardHeader = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(CARD_TOKENS.header.base, className)}
        {...props}
      />
    ),
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.memo(
  React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(CARD_TOKENS.title.base, className)}
      {...props}
    >
      {props.children}
    </h3>
  )),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.memo(
  React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(CARD_TOKENS.description.base, className)}
      {...props}
    />
  )),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div ref={ref} className={cn(CARD_TOKENS.content.base, className)} {...props} />
    ),
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(CARD_TOKENS.footer.base, className)}
        {...props}
      />
    ),
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
