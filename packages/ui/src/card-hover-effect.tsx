"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HOVER_EFFECT_CARD_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        HOVER_EFFECT_CARD_TOKENS.grid,
        className,
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link}
          key={item?.link}
          aria-label={item.title || HOVER_EFFECT_CARD_TOKENS.defaultAriaLabel}
          className={cn(
            HOVER_EFFECT_CARD_TOKENS.link.base,
            HOVER_EFFECT_CARD_TOKENS.link.hoverScale,
            HOVER_EFFECT_CARD_TOKENS.link.activeScale,
          )}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className={HOVER_EFFECT_CARD_TOKENS.hoverBackground}
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        HOVER_EFFECT_CARD_TOKENS.card.base,
        className,
      )}
    >
      <div className={HOVER_EFFECT_CARD_TOKENS.card.contentWrapper}>
        <div className={HOVER_EFFECT_CARD_TOKENS.card.innerPadding}>{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn(HOVER_EFFECT_CARD_TOKENS.title, className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        HOVER_EFFECT_CARD_TOKENS.description,
        className,
      )}
    >
      {children}
    </p>
  );
};
