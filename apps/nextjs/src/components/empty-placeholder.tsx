import * as React from "react";

import { cn } from "@saasfly/ui";
import * as Icons from "@saasfly/ui/icons";
import { ANIMATION } from "@saasfly/common";

// Note: This component uses dynamic icon access by name, which requires namespace import
// For type safety, the name prop is validated against: keyof typeof Icons

type EmptyPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

export function EmptyPlaceholder({
  className,
  children,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        `group flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50 transition-all ${ANIMATION.duration.medium} ${ANIMATION.easing.default} hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm`,
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}

interface EmptyPlaceholderIconProps
  extends Partial<React.SVGProps<SVGSVGElement>> {
  name: keyof typeof Icons;
}

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({
  name,
  className, // ...props
}: EmptyPlaceholderIconProps) {
  const Icon = Icons[name];

  if (!Icon) {
    return null;
  }

  return (
    <div className={`flex h-20 w-20 items-center justify-center rounded-full bg-muted transition-transform ${ANIMATION.duration.medium} ${ANIMATION.easing.default} group-hover:scale-110 group-hover:bg-muted/80`}>
      <Icon className={cn(`h-10 w-10 transition-colors ${ANIMATION.duration.medium} group-hover:text-primary`, className)} />
    </div>
  );
};

type EmptyPlacholderTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  ...props
}: EmptyPlacholderTitleProps) {
  return (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
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
      className={cn(
        "mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
