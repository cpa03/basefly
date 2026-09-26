"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { ANIMATED_TOOLTIP_TOKENS } from "@saasfly/common";

export interface AnimatedTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    id: number;
    name: string;
    designation: string;
    image: string;
    link?: string;
  }[];
  role?: string;
  "aria-label"?: string;
}

export const AnimatedTooltip = ({
  items,
  className,
  role = ANIMATED_TOOLTIP_TOKENS.defaultRole,
  "aria-label": ariaLabel = ANIMATED_TOOLTIP_TOKENS.defaultAriaLabel,
  ...props
}: AnimatedTooltipProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const springConfig = { stiffness: 100, damping: 5 };
  const x = useMotionValue(0);
  const rotateSpring = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateSpring = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  // rotate the tooltip - only apply spring animations if user prefers motion
  const rotate = shouldReduceMotion ? undefined : rotateSpring;

  // translate the tooltip
  const translateX = shouldReduceMotion ? undefined : translateSpring;

  const handleMouseMove = (event: React.MouseEvent<HTMLImageElement>) => {
    const halfWidth = event.currentTarget.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  };

  // Reduced motion: instant visibility without animation
  const reducedMotionInitial = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 20, scale: 0.6 };
  const reducedMotionAnimate = shouldReduceMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring" as const,
          stiffness: 260,
          damping: 10,
        },
      };
  const reducedMotionExit = shouldReduceMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 20, scale: 0.6 };

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={className}
      {...props}
    >
      {items.map((item) => (
        <div
          className={ANIMATED_TOOLTIP_TOKENS.container.base}
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence mode="popLayout">
            {hoveredIndex === item.id && (
              <motion.div
                initial={reducedMotionInitial}
                animate={reducedMotionAnimate}
                exit={reducedMotionExit}
                style={{
                  translateX,
                  rotate,
                  whiteSpace: "nowrap",
                }}
                className={ANIMATED_TOOLTIP_TOKENS.tooltip.base}
              >
                <div className={ANIMATED_TOOLTIP_TOKENS.tooltip.gradientPrimary} />
                <div className={ANIMATED_TOOLTIP_TOKENS.tooltip.gradientSecondary} />
                <div className={ANIMATED_TOOLTIP_TOKENS.tooltip.nameText}>
                  {item.name}
                </div>
                <div className={ANIMATED_TOOLTIP_TOKENS.tooltip.designationText}>
                  {item.designation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {item.link ? (
            <Link
              href={item.link}
              target="_blank"
              className={ANIMATED_TOOLTIP_TOKENS.link.base}
            >
              <Image
                onMouseMove={handleMouseMove}
                height={100}
                width={100}
                src={item.image}
                alt={item.name}
                sizes="56px"
                className={ANIMATED_TOOLTIP_TOKENS.image.base}
              />
            </Link>
          ) : (
            <Image
              onMouseMove={handleMouseMove}
              height={100}
              width={100}
              src={item.image}
              alt={item.name}
              sizes="56px"
              className={ANIMATED_TOOLTIP_TOKENS.image.base}
            />
          )}
        </div>
      ))}
    </div>
  );
};
