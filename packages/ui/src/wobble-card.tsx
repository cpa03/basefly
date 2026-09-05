"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { WOBBLE_CARD_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface WobbleCardProps {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  "aria-label"?: string;
}

export const WobbleCard = ({
  children,
  containerClassName,
  className,
  "aria-label": ariaLabel,
}: WobbleCardProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;
    setMousePosition({ x, y });
  };
  return (
    <motion.section
      role="region"
      aria-label={ariaLabel ?? WOBBLE_CARD_TOKENS.defaultAriaLabel}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        WOBBLE_CARD_TOKENS.container.base,
        WOBBLE_CARD_TOKENS.container.hoverScale,
        WOBBLE_CARD_TOKENS.container.activeScale,
        containerClassName,
      )}
    >
      <div
        className={WOBBLE_CARD_TOKENS.innerContainer.base}
        style={{
          boxShadow: WOBBLE_CARD_TOKENS.innerContainer.boxShadow,
        }}
      >
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: "transform 0.1s ease-out",
          }}
          className={cn(WOBBLE_CARD_TOKENS.contentWrapper, className)}
        >
          <Noise />
          {children}
        </motion.div>
      </div>
    </motion.section>
  );
};

const Noise = () => {
  return (
    <div
      className={WOBBLE_CARD_TOKENS.noise.base}
      style={{
        backgroundImage: WOBBLE_CARD_TOKENS.noise.bgImage,
        backgroundSize: WOBBLE_CARD_TOKENS.noise.bgSize,
      }}
    ></div>
  );
};
