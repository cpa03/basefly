import { MARKETING_FALLBACKS } from "@saasfly/common";
import { TextRevealByWord as TextReveal } from "@saasfly/ui/text-reveal";

export function WordReveal() {
  return (
    <div
      role="region"
      aria-label="Text reveal presentation"
      className="z-10 flex min-h-[16rem] items-center justify-center rounded-lg transition-transform duration-200 ease-in-out hover:scale-[1.002] active:scale-[0.998] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-black"
    >
      <TextReveal text={MARKETING_FALLBACKS.wordReveal} />
    </div>
  );
}
