"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { BUTTON_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

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
  variant?: string;
}> = ({ ripple, variant }) => {
  const getRippleColor = () => {
    switch (variant) {
      case "default":
      case "destructive":
        return "bg-white/30";
      case "outline":
      case "ghost":
      case "link":
        return "bg-primary/20";
      case "secondary":
        return "bg-primary/20";
      default:
        return "bg-white/30";
    }
  };

  const rippleSize = `${BUTTON_TOKENS.ripple.size}px`;

  return (
    <span
      className={cn(
        "pointer-events-none absolute rounded-full motion-safe:animate-ripple",
        "motion-reduce:hidden",
        getRippleColor(),
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

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  /**
   * Whether to enable the ripple click effect
   * @default true
   */
  enableRipple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading,
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
      [enableRipple, asChild, isLoading, props.disabled, createRipple, onClick],
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        aria-busy={isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
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
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
