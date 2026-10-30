import React from "react";
import { HEADER_TOKENS } from "@saasfly/common";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
  role?: string;
  "aria-label"?: string;
}

export const DashboardHeader = React.memo(function DashboardHeader({
  heading,
  text,
  children,
  className = "",
  role = HEADER_TOKENS.container.defaultRole,
  "aria-label": ariaLabel = HEADER_TOKENS.container.defaultAriaLabel,
}: DashboardHeaderProps): React.JSX.Element {
  return (
    <header
      role={role}
      aria-label={ariaLabel}
      className={`${HEADER_TOKENS.container.base} ${className}`.trim()}
    >
      <div className="grid gap-1">
        <h1 className={HEADER_TOKENS.heading}>{heading}</h1>
        {text && <p className={HEADER_TOKENS.text}>{text}</p>}
      </div>
      {children && <div className={HEADER_TOKENS.actions.base}>{children}</div>}
    </header>
  );
});

DashboardHeader.displayName = "DashboardHeader";
