import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { TRANSITION_PRESETS, GRADIENT_COLORS } from "@saasfly/common/config/ui";
import { cn } from "@saasfly/ui";
import { AnimatedGradientText } from "@saasfly/ui/animated-gradient-text";

export function DocumentGuide({ children }: { children: ReactNode }) {
  return (
    <AnimatedGradientText>
      🚀 <hr className="mx-2 h-4 w-[1px] shrink-0 bg-gray-300" aria-hidden="true" />{" "}
      <span
        className={cn(
          `animate-gradient inline bg-gradient-to-r ${GRADIENT_COLORS.getPrimaryGradientClass()} bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
        )}
      >
        {children}
      </span>
      <ChevronRight
        className={`ml-1 size-3 transition-transform ${TRANSITION_PRESETS.container} ease-in-out group-hover:translate-x-0.5`}
      />
    </AnimatedGradientText>
  );
}
