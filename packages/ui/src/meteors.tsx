import React from "react";

import { cn } from "./utils/cn";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number ?? 20).fill(true);
  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:-translate-y-[50%] before:transform before:bg-gradient-to-r before:from-[#64748b] before:to-transparent before:content-['']",
            className,
          )}
          style={{
            top: 0,
            left: ((idx * 37) % 800) - 400 + "px",
            animationDelay: ((idx * 17) % 60) / 100 + 0.2 + "s",
            animationDuration: ((idx * 23) % 8) + 2 + "s",
          }}
        ></span>
      ))}
    </>
  );
};
