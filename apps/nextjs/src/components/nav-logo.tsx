"use client";

import * as React from "react";
import Link from "next/link";

import { BRAND } from "@saasfly/common";
import { Logo } from "@saasfly/ui/icons";

interface NavLogoProps {
  /**
   * The language code for localization
   */
  lang: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the full logo with text (default: true)
   */
  showText?: boolean;
  /**
   * Custom text to display (defaults to BRAND.name)
   */
  text?: string;
}

/**
 * Shared navigation logo component used across MainNav and MobileNav.
 * Provides consistent logo rendering with proper accessibility attributes.
 *
 * @example
 * ```tsx
 * <NavLogo lang="en" />
 * <NavLogo lang="en" showText={false} />
 * ```
 */
export const NavLogo = React.memo(function NavLogo({
  lang,
  className,
  showText = true,
  text,
}: NavLogoProps) {
  return (
    <Link
      href={`/${lang}`}
      className={className}
      aria-label={`${BRAND.name} home page`}
    >
      <div className="flex items-center space-x-2">
        <Logo />
        {showText && (
          <span className="text-xl font-bold">{text ?? BRAND.name}</span>
        )}
      </div>
    </Link>
  );
});

NavLogo.displayName = "NavLogo";
