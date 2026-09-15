import React from "react";

import { METEORS_TOKENS } from "@saasfly/common";

import { cn } from "./utils/cn";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteorCount = number ?? METEORS_TOKENS.defaultCount;
  const meteorStylesRef = React.useRef<
    { left: string; animationDelay: string; animationDuration: string }[]
  >([]);

  if (meteorStylesRef.current.length !== meteorCount) {
    /* eslint-disable react-hooks/purity -- Initialize random styles once per meteor count */
    meteorStylesRef.current = Array.from({ length: meteorCount }, () => ({
      left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
      animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
      animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
    }));
    /* eslint-enable react-hooks/purity */
  }
  const meteorStyles = meteorStylesRef.current;

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={"meteor" + idx}
          role={METEORS_TOKENS.defaultRole}
          aria-hidden={METEORS_TOKENS.ariaHidden}
          className={cn(
            METEORS_TOKENS.particle.base,
            METEORS_TOKENS.trail.base,
            METEORS_TOKENS.particle.motionReduce,
            className,
          )}
          style={{
            top: 0,
            ...style,
          }}
        ></span>
      ))}
    </>
  );
};
