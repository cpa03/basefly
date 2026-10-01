"use client";

import { useEffect, useState } from "react";
import * as React from "react";

import { INFINITE_MOVING_CARDS_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface InfiniteMovingCardsProps extends React.ComponentPropsWithoutRef<"div"> {
  items: {
    quote: string;
    name: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  role = INFINITE_MOVING_CARDS_TOKENS.defaultRole,
  "aria-label": ariaLabel = INFINITE_MOVING_CARDS_TOKENS.defaultAriaLabel,
  ...props
}: InfiniteMovingCardsProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (duplicatedItem instanceof HTMLElement) {
          duplicatedItem.setAttribute("aria-hidden", "true");
        }
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      if (containerRef.current) {
        if (direction === "left") {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "forwards",
          );
        } else {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "reverse",
          );
        }
      }

      if (containerRef.current) {
        const duration =
          INFINITE_MOVING_CARDS_TOKENS.speeds[speed] ??
          INFINITE_MOVING_CARDS_TOKENS.speeds.fast;
        containerRef.current.style.setProperty(
          "--animation-duration",
          duration,
        );
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStart(true);
    }
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      tabIndex={0}
      className={cn(INFINITE_MOVING_CARDS_TOKENS.container.base, className)}
      {...props}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          INFINITE_MOVING_CARDS_TOKENS.scroller.base,
          start && INFINITE_MOVING_CARDS_TOKENS.scroller.animate,
          pauseOnHover && INFINITE_MOVING_CARDS_TOKENS.scroller.pauseOnHover,
          INFINITE_MOVING_CARDS_TOKENS.scroller.motionReduce,
        )}
      >
        {items.map((item) => (
          <li
            className={cn(
              INFINITE_MOVING_CARDS_TOKENS.card.base,
              INFINITE_MOVING_CARDS_TOKENS.card.hoverScale,
              INFINITE_MOVING_CARDS_TOKENS.card.activeScale,
            )}
            style={{
              background: INFINITE_MOVING_CARDS_TOKENS.card.gradient,
            }}
            key={item.name}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>
              <span className={INFINITE_MOVING_CARDS_TOKENS.quote}>
                {item.quote}
              </span>
              <div className="relative z-20 mt-6 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className={INFINITE_MOVING_CARDS_TOKENS.author}>
                    {item.name}
                  </span>
                  <span className={INFINITE_MOVING_CARDS_TOKENS.title}>
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
