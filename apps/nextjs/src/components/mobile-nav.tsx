"use client";

import * as React from "react";
import Link from "next/link";

import { MOBILE_NAV_TOKENS } from "@saasfly/common";
import { Z_INDEX } from "@saasfly/common/config/ui";
import { cn } from "@saasfly/ui";
import { Logo } from "@saasfly/ui/icons";

import { siteConfig } from "~/config/site";
import { useLockBody } from "~/hooks/use-lock-body";
import type { MainNavItem } from "~/types";

interface MobileNavProps {
  items: MainNavItem[];
  children?: React.ReactNode;
  menuItemClick?: () => void;
}

export function MobileNav({ items, children, menuItemClick }: MobileNavProps) {
  useLockBody();

  return (
    <section
      id="mobile-navigation"
      role={MOBILE_NAV_TOKENS.section.defaultRole}
      aria-modal="true"
      aria-label={MOBILE_NAV_TOKENS.section.defaultAriaLabel}
      className={cn(
        MOBILE_NAV_TOKENS.section.base,
        Z_INDEX.modal,
      )}
    >
      <div className={MOBILE_NAV_TOKENS.wrapper}>
        <Link href="/" className={MOBILE_NAV_TOKENS.brandLink.base}>
          <Logo />
          <span className="font-bold">{siteConfig.name}</span>
        </Link>
        <nav className={MOBILE_NAV_TOKENS.nav.base} aria-label={MOBILE_NAV_TOKENS.nav.defaultAriaLabel}>
          <ul className={MOBILE_NAV_TOKENS.list}>
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.disabled ? "#" : item.href}
                  className={cn(
                    MOBILE_NAV_TOKENS.itemLink.base,
                    item.disabled && MOBILE_NAV_TOKENS.itemLink.disabled,
                  )}
                  onClick={
                    item.disabled ? (e) => e.preventDefault() : menuItemClick
                  }
                  aria-disabled={item.disabled}
                  tabIndex={item.disabled ? -1 : undefined}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {children}
      </div>
    </section>
  );
}
