"use client";

import React from "react";
import Link from "next/link";

import { BRAND, EXTERNAL_URLS } from "@saasfly/common";
import { Close, Logo } from "@saasfly/ui/icons";

import { DocumentGuide } from "~/components/document-guide";
import { MobileNav } from "~/components/mobile-nav";
import type { MainNavItem } from "~/types";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  params: {
    lang: string;
  };
  marketing?: Record<string, string | object>;
}

export function MainNav({
  items,
  children,
  params: { lang },
  marketing,
}: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  
  const toggleMenu = React.useCallback(() => {
    setShowMobileMenu((prev) => !prev);
  }, []);
  
  const handleMenuItemClick = React.useCallback(() => {
    toggleMenu();
  }, [toggleMenu]);

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
        className="flex items-center space-x-2 md:hidden"
        onClick={toggleMenu}
        aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        aria-expanded={showMobileMenu}
        aria-controls="mobile-navigation"
      >
        {showMobileMenu ? <Close /> : <Logo />}
        <span className="font-bold">Menu</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items} menuItemClick={handleMenuItemClick}>
          {children}
        </MobileNav>
      )}
    </div>
  );
}
