"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, stagger, useAnimate } from "framer-motion";

import { TEXT_GENERATE_EFFECT_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export interface TextGenerateEffectProps {
  words: string;
  className?: string;
  "aria-label"?: string;
  role?: string;
}

const TextGenerateEffectImpl = ({
  words,
  className,
  "aria-label": ariaLabel,
  role,
}: TextGenerateEffectProps) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    if (scope.current) {
      void animate(
        "span",
        {
          opacity: 1,
        },
        {
          duration: 2,
          delay: stagger(0.1),
        },
      );
    }
  }, [scope, animate, words]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={TEXT_GENERATE_EFFECT_TOKENS.word}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div
      role={role ?? TEXT_GENERATE_EFFECT_TOKENS.defaultRole}
      aria-label={ariaLabel ?? TEXT_GENERATE_EFFECT_TOKENS.defaultAriaLabel}
      tabIndex={0}
      className={cn(
        TEXT_GENERATE_EFFECT_TOKENS.container.base,
        TEXT_GENERATE_EFFECT_TOKENS.container.hoverScale,
        TEXT_GENERATE_EFFECT_TOKENS.container.activeScale,
        className,
      )}
    >
      <div className={TEXT_GENERATE_EFFECT_TOKENS.innerWrapper}>
        <div className={TEXT_GENERATE_EFFECT_TOKENS.textContainer}>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};

export const TextGenerateEffect = dynamic<TextGenerateEffectProps>(
  () => Promise.resolve(TextGenerateEffectImpl),
  {
    ssr: false,
  },
);
