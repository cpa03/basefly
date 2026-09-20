"use client";

import { FC, ReactNode, useMemo, useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";

import { TEXT_REVEAL_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

const RELATIVE_POSITION_STYLE = { position: "relative" as const };

interface TextRevealByWordProps {
  text: string;
  className?: string;
  "aria-label"?: string;
  role?: string;
}

export const TextRevealByWord: FC<TextRevealByWordProps> = ({
  text,
  className,
  "aria-label": ariaLabel = TEXT_REVEAL_TOKENS.defaultAriaLabel,
  role = TEXT_REVEAL_TOKENS.defaultRole,
}) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <div
      ref={targetRef}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        TEXT_REVEAL_TOKENS.container.base,
        TEXT_REVEAL_TOKENS.container.hoverScale,
        TEXT_REVEAL_TOKENS.container.activeScale,
        className,
      )}
      style={RELATIVE_POSITION_STYLE}
    >
      <div className={TEXT_REVEAL_TOKENS.stickyWrapper}>
        <p ref={targetRef} className={TEXT_REVEAL_TOKENS.paragraph}>
          {words.map((word, i) => {
            const start = i / words.length;
            const end = start + 1 / words.length;
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            );
          })}
        </p>
      </div>
    </div>
  );
};

interface WordProps {
  children: ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

const Word: FC<WordProps> = ({ children, progress, range }) => {
  const opacity = useTransform(progress, range, [0, 1]);
  return (
    <span className={TEXT_REVEAL_TOKENS.word.container}>
      <span className={TEXT_REVEAL_TOKENS.word.background}>{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={TEXT_REVEAL_TOKENS.word.animated}
      >
        {children}
      </motion.span>
    </span>
  );
};

export default TextRevealByWord;
