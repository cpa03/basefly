import { MARQUEE_TOKENS } from "@saasfly/common";
import { cn } from "./utils/cn";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = MARQUEE_TOKENS.defaultRepeat,
  role = MARQUEE_TOKENS.defaultRole,
  "aria-label": ariaLabel = MARQUEE_TOKENS.defaultAriaLabel,
  ...props
}: MarqueeProps) {
  // Use CSS to detect reduced motion preference
  // The 'motion-reduce:animate-none' class will disable animations for users
  // who have "prefers-reduced-motion: reduce" in their OS settings

  return (
    <div
      role={role}
      aria-label={ariaLabel}
      {...props}
      className={cn(
        MARQUEE_TOKENS.root.base,
        MARQUEE_TOKENS.root.hoverScale,
        {
          [MARQUEE_TOKENS.root.horizontal]: !vertical,
          [MARQUEE_TOKENS.root.vertical]: vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 ? "true" : undefined}
            className={cn(MARQUEE_TOKENS.track.base, {
              [MARQUEE_TOKENS.track.horizontal]: !vertical,
              [MARQUEE_TOKENS.track.vertical]: vertical,
              [MARQUEE_TOKENS.track.pauseOnHover]: pauseOnHover,
              [MARQUEE_TOKENS.track.reverse]: reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
