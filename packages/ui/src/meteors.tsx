import React from "react";

import { cn } from "./utils/cn";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteorCount = number ?? 20;
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
          className={cn(
            "absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
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
