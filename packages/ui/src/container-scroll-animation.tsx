"use client";

import React, { useRef } from "react";
import { motion, MotionValue, useScroll, useTransform } from "framer-motion";

import { CONTAINER_SCROLL_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";

const RELATIVE_POSITION_STYLE = { position: "relative" as const };
const PERSPECTIVE_STYLE = { perspective: "1000px" };

export interface ContainerScrollProps
  extends React.HTMLAttributes<HTMLDivElement> {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}

export const ContainerScroll = ({
  titleComponent,
  children,
  className,
  role = CONTAINER_SCROLL_TOKENS.defaultRole,
  "aria-label": ariaLabel = CONTAINER_SCROLL_TOKENS.defaultAriaLabel,
  ...props
}: ContainerScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className={cn(
        CONTAINER_SCROLL_TOKENS.container.base,
        CONTAINER_SCROLL_TOKENS.container.hoverScale,
        CONTAINER_SCROLL_TOKENS.container.activeScale,
        CONTAINER_SCROLL_TOKENS.container.focusRing,
        className,
      )}
      ref={containerRef}
      style={RELATIVE_POSITION_STYLE}
      role={role}
      aria-label={ariaLabel}
      tabIndex={0}
      {...props}
    >
      <div
        className={CONTAINER_SCROLL_TOKENS.innerWrapper.base}
        style={PERSPECTIVE_STYLE}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
  className,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className={cn(CONTAINER_SCROLL_TOKENS.header.base, className)}
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
  className,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className={cn(CONTAINER_SCROLL_TOKENS.card.base, className)}
    >
      <div className={CONTAINER_SCROLL_TOKENS.card.inner}>{children}</div>
    </motion.div>
  );
};
