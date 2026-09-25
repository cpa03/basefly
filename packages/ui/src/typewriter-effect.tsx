"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, stagger, useAnimate, useInView } from "framer-motion";

import { TYPEWRITER_EFFECT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface TypewriterEffectProps {
  words: {
    text: string;
    className?: string;
  }[];
  className?: string;
  cursorClassName?: string;
  "aria-label"?: string;
  role?: string;
}

export const TypewriterEffectImpl = ({
  words,
  className,
  cursorClassName,
  "aria-label": ariaLabel,
  role,
}: TypewriterEffectProps) => {
  // split text inside of words into array of characters
  const wordsArray = words.map((word) => {
    return {
      ...word,
      text: word.text.split(""),
    };
  });

  const [scope, animate] = useAnimate();
  const isInView = useInView(scope);
  useEffect(() => {
    if (isInView) {
      void animate(
        "span",
        {
          display: "inline-block",
          opacity: 1,
          width: "fit-content",
        },
        {
          duration: TYPEWRITER_EFFECT_TOKENS.animation.duration,
          delay: stagger(TYPEWRITER_EFFECT_TOKENS.animation.staggerDelay),
          ease: "easeInOut",
        },
      );
    }
  }, [isInView, animate]);

  const renderWords = () => {
    return (
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <React.Fragment key={`word-${idx}`}>
            {word.text.map((char, index) => (
              <motion.span
                initial={{}}
                key={`char-${index}`}
                className={cn(TYPEWRITER_EFFECT_TOKENS.char, word.className)}
              >
                {char}
              </motion.span>
            ))}
            &nbsp;
          </React.Fragment>
        ))}
      </motion.span>
    );
  };

  return (
    <p
      role={role ?? TYPEWRITER_EFFECT_TOKENS.defaultRole}
      aria-label={ariaLabel ?? TYPEWRITER_EFFECT_TOKENS.defaultAriaLabel}
      tabIndex={0}
      className={cn(
        TYPEWRITER_EFFECT_TOKENS.container.base,
        TYPEWRITER_EFFECT_TOKENS.container.hoverScale,
        TYPEWRITER_EFFECT_TOKENS.container.activeScale,
        className,
      )}
    >
      {renderWords()}
      <motion.span
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: TYPEWRITER_EFFECT_TOKENS.animation.cursorDuration,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className={cn(TYPEWRITER_EFFECT_TOKENS.cursor.base, cursorClassName)}
      ></motion.span>
    </p>
  );
};

const TypedDynamicComponent = dynamic<TypewriterEffectProps>(
  () => Promise.resolve(TypewriterEffectImpl),
  {
    ssr: false,
  },
);

export const TypewriterEffect = TypedDynamicComponent;
