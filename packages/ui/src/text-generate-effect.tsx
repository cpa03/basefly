"use client";

import { useEffect, type ComponentType } from "react";
import dynamic from "next/dynamic";
import { motion, stagger, useAnimate } from "framer-motion";

import { cn } from "./utils/cn";

const TextGenerateEffectImpl = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
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
              className="text-black opacity-0 dark:text-white"
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("", className)}>
      <div className="mt-0">
        <div className="max-w-[750px] text-center text-lg font-light text-foreground">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const TypedDynamicComponent = dynamic(
  () => Promise.resolve(TextGenerateEffectImpl),
  {
    ssr: false,
  },
) as ComponentType<{
  words: string;
  className?: string;
}>;

export const TextGenerateEffect = TypedDynamicComponent;
