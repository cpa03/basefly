"use client";

import React from "react";
import Link from "next/link";

import React from "react";

import { BRAND, EXTERNAL_URLS, UI_LABELS } from "@saasfly/common";
import { Close, Logo } from "@saasfly/ui/icons";

import { DocumentGuide } from "~/components/document-guide";
import { MobileNav } from "~/components/mobile-nav";
import { useMobileMenu } from "~/hooks/use-mobile-menu";
import type { MainNavItem } from "~/types";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  params: {
    lang: string;
  };
  marketing?: Record<string, string | object>;
}

export const MainNav = React.memo(function MainNav({
  items,
  children,
  params: { lang },
  marketing,
}: MainNavProps) {
  const { isOpen, toggle, close } = useMobileMenu();

  const handleMenuItemClick = React.useCallback(() => {
    close();
  }, [close]);

  return (
    <div className="flex gap-6 md:gap-10">
      <div className="flex items-center">
        <Link
          href={`/${lang}`}
          className="hidden items-center space-x-2 md:flex"
        >
          <div className="text-3xl">{BRAND.name}</div>
        </Link>

        <Link
          href={EXTERNAL_URLS.docs.home}
          target="_blank"
          className="ml-4 hidden md:flex lg:flex xl:flex"
        >
          <DocumentGuide>
            {typeof marketing?.introducing === "string"
              ? marketing?.introducing
              : `Introducing ${BRAND.name}`}
          </DocumentGuide>
        </Link>
      </div>

      <button
        className="flex items-center space-x-2 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
        onClick={toggle}
        aria-label={
          isOpen ? UI_LABELS.closeMobileMenu : UI_LABELS.openMobileMenu
        }
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
      >
        {isOpen ? <Close /> : <Logo />}
        <span className="font-bold">{UI_LABELS.mobileMenu}</span>
      </button>
      {isOpen && items && (
        <MobileNav items={items} menuItemClick={handleMenuItemClick}>
          {children}
        </MobileNav>
      )}
    </div>
  );
});
