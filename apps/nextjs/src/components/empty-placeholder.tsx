import * as React from "react";

import { EMPTY_PLACEHOLDER_TOKENS } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Help as HelpCircle } from "@saasfly/ui/icons";
import * as Icons from "@saasfly/ui/icons";

// Note: This component uses dynamic icon access by name, which requires namespace import
// For type safety, the name prop is validated against: keyof typeof Icons

type EmptyPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function EmptyPlaceholder({
  className,
  children,
  role = EMPTY_PLACEHOLDER_TOKENS.defaultRole,
  "aria-label": ariaLabel = EMPTY_PLACEHOLDER_TOKENS.defaultAriaLabel,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={cn(EMPTY_PLACEHOLDER_TOKENS.container.base, className)}
      {...props}
    >
      <div className={EMPTY_PLACEHOLDER_TOKENS.container.contentWrapper}>
        {children}
      </div>
    </div>
  );
}

interface EmptyPlaceholderIconProps extends Partial<
  React.SVGProps<SVGSVGElement>
> {
  name: keyof typeof Icons;
}

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({
  name,
  className, // ...props
}: EmptyPlaceholderIconProps) {
  const Icon = Icons[name] || HelpCircle;

  return (
    <div className={EMPTY_PLACEHOLDER_TOKENS.iconWrapper.base}>
      <Icon
        className={cn(EMPTY_PLACEHOLDER_TOKENS.iconWrapper.icon, className)}
      />
    </div>
  );
};

type EmptyPlacholderTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children: React.ReactNode;
};

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  children,
  ...props
}: EmptyPlacholderTitleProps) {
  return (
    <h2
      className={cn(EMPTY_PLACEHOLDER_TOKENS.title, className)}
      {...props}
    >
      {children}
    </h2>
  );
};

type EmptyPlacholderDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlacholderDescriptionProps) {
  return (
    <p
      className={cn(EMPTY_PLACEHOLDER_TOKENS.description, className)}
      {...props}
    />
  );
};
