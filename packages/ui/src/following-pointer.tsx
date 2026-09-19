// Core component that receives mouse positions and renders pointer and content
"use client";

import React, { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  type MotionValue,
} from "framer-motion";

import { FOLLOWER_POINTER_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export const FollowerPointerCard = ({
  children,
  className,
  title,
  "aria-label": ariaLabel,
  role = FOLLOWER_POINTER_TOKENS.defaultRole,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
  "aria-label"?: string;
  role?: string;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isInside, setIsInside] = useState<boolean>(false); // Add this line

  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rect) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      x.set(e.clientX - rect.left + scrollX);
      y.set(e.clientY - rect.top + scrollY);
    }
  };
  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleMouseEnter = () => {
    setIsInside(true);
  };
  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{
        cursor: FOLLOWER_POINTER_TOKENS.card.cursor,
      }}
      ref={ref}
      role={role}
      aria-label={ariaLabel ?? FOLLOWER_POINTER_TOKENS.defaultAriaLabel}
      className={cn(
        FOLLOWER_POINTER_TOKENS.card.base,
        FOLLOWER_POINTER_TOKENS.card.hoverScale,
        FOLLOWER_POINTER_TOKENS.card.activeScale,
        className,
      )}
    >
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  title?: string | React.ReactNode;
}) => {
  const [pointerColor] = React.useState(
    () =>
      FOLLOWER_POINTER_TOKENS.colors[
        Math.floor(Math.random() * FOLLOWER_POINTER_TOKENS.colors.length)
      ] ?? FOLLOWER_POINTER_TOKENS.colors[0],
  );
  return (
    <motion.div
      className={FOLLOWER_POINTER_TOKENS.pointerContainer.base}
      style={{
        top: y,
        left: x,
        pointerEvents: FOLLOWER_POINTER_TOKENS.pointerContainer.pointerEvents as React.CSSProperties["pointerEvents"],
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className={FOLLOWER_POINTER_TOKENS.svg}
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{
          backgroundColor: pointerColor,
        }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className={FOLLOWER_POINTER_TOKENS.titleBadge}
      >
        {title ?? FOLLOWER_POINTER_TOKENS.defaultTitle}
      </motion.div>
    </motion.div>
  );
};
