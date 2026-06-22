"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";

import { BUTTON_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

import { buttonVariants, type ButtonVariantProps } from "./button-variants";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const useButtonRipple = () => {
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const idCounter = React.useRef(0);

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const newRipple: Ripple = {
        id: idCounter.current++,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      setRipples((prev) => [...prev, newRipple]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, BUTTON_TOKENS.ripple.duration);
    },
    [],
  );

  return { ripples, createRipple };
};

const ButtonRipple: React.FC<{
  ripple: Ripple;
  variant?: keyof typeof BUTTON_TOKENS.ripple.colors;
}> = ({ ripple, variant }) => {
  const rippleColor =
    BUTTON_TOKENS.ripple.colors[variant ?? "default"] ??
    BUTTON_TOKENS.ripple.colors.default;

  const rippleSize = `${BUTTON_TOKENS.ripple.size}px`;

  return (
    <span
      className={cn(
        "pointer-events-none absolute rounded-full motion-safe:animate-ripple",
        "motion-reduce:hidden",
        rippleColor,
      )}
      style={{
        left: ripple.x,
        top: ripple.y,
        transform: "translate(-50%, -50%)",
        width: rippleSize,
        height: rippleSize,
      }}
    />
  );
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariantProps {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  /**
   * Whether to enable the ripple click effect
   * @default true
   */
  enableRipple?: boolean;
}

const Button = React.memo(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
      {
        className,
        variant,
        size,
        asChild = false,
        isLoading,
        loadingText,
        enableRipple = true,
        children,
        onClick,
        ...props
      },
      ref,
    ) => {
      const { ripples, createRipple } = useButtonRipple();
      const Comp = asChild ? Slot : "button";

      const handleClick = React.useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
          if (enableRipple && !asChild && !isLoading && !props.disabled) {
            createRipple(event);
          }
          onClick?.(event);
        },
        [
          enableRipple,
          asChild,
          isLoading,
          props.disabled,
          createRipple,
          onClick,
        ],
      );

      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            BUTTON_TOKENS.activeScale,
          )}
          ref={ref}
          disabled={isLoading ?? props.disabled}
          aria-busy={isLoading}
          onClick={handleClick}
          {...props}
        >
          {isLoading && (
            <Loader2
              className={cn("h-4 w-4 animate-spin", loadingText ? "mr-2" : "")}
              aria-hidden="true"
            />
          )}
          {isLoading && loadingText ? (
            <span className="truncate">{loadingText}</span>
          ) : (
            children
          )}
          {enableRipple &&
            !asChild &&
            ripples.map((ripple) => (
              <ButtonRipple
                key={ripple.id}
                ripple={ripple}
                variant={variant ?? "default"}
              />
            ))}
        </Comp>
      );
    },
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonVariantProps } from "./button-variants";
