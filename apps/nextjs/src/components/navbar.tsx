"use client";

import React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import type { User } from "@saasfly/auth";
import { NAVBAR_CONFIG, TRANSITION_PRESETS, UI_STRINGS } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";

import { GitHubStar } from "~/components/github-star";
import { LocaleChange } from "~/components/locale-change";
import useScroll from "~/hooks/use-scroll";
import { useSigninModal } from "~/hooks/use-signin-modal";
import type { MainNavItem } from "~/types";
import { MainNav } from "./main-nav";
import { UserAccountNav } from "./user-account-nav";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  disabled?: boolean;
}

const NavLink = React.memo(function NavLink({
  href,
  children,
  isActive,
  disabled,
}: NavLinkProps) {
  return (
    <Link
      href={disabled ? "#" : href}
      aria-disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      tabIndex={disabled ? -1 : undefined}
      className={cn(
        "group relative flex items-center text-lg font-medium sm:text-sm",
        TRANSITION_PRESETS.link,
        "text-foreground/70 hover:text-foreground",
        isActive && "font-semibold text-blue-500",
        disabled && "cursor-not-allowed opacity-80",
      )}
    >
      <span>{children}</span>
      <span
        className={cn(
          "absolute -bottom-1 left-0 h-0.5 w-full origin-left",
          "bg-current",
          "motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out",
          "group-hover:motion-safe:scale-x-100",
          "group-focus-visible:motion-safe:scale-x-100",
          isActive && "motion-safe:scale-x-100",
        )}
        aria-hidden="true"
      />
    </Link>
  );
});

interface NavBarProps {
  user: Pick<User, "name" | "image" | "email"> | undefined;
  items?: MainNavItem[];
  children?: React.ReactNode;
  rightElements?: React.ReactNode;
  scroll?: boolean;
  params: {
    lang: string;
  };
  marketing: Record<string, string | object>;
  dropdown: Record<string, string>;
}

export function NavBar({
  user,
  items,
  children,
  rightElements,
  scroll = false,
  params: { lang },
  marketing,
  dropdown,
}: NavBarProps) {
  const scrolled = useScroll(NAVBAR_CONFIG.scrollThreshold);
  const signInModal = useSigninModal();
  const segment = useSelectedLayoutSegment();

  return (
    <header
      className={`sticky top-0 z-40 flex w-full justify-center border-border bg-background/60 backdrop-blur-xl transition-all ${
        scroll ? (scrolled ? "border-b" : "bg-background/0") : "border-b"
      }`}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <MainNav
          items={items}
          params={{ lang: `${lang}` }}
          marketing={marketing}
        >
          {children}
        </MainNav>

        <div className="flex items-center space-x-3">
          {items?.length ? (
            <nav className="hidden gap-6 md:flex">
              {items?.map((item, index) => (
                <NavLink
                  key={index}
                  href={
                    item.disabled
                      ? "#"
                      : item.href.startsWith("http")
                        ? item.href
                        : `/${lang}${item.href}`
                  }
                  isActive={item.href.startsWith(`/${segment}`)}
                  disabled={item.disabled}
                >
                  {item.title}
                </NavLink>
              ))}
            </nav>
          ) : null}

          <div className="h-8 w-[1px] bg-accent"></div>

          {rightElements}

          <div className="hidden md:flex lg:flex xl:flex">
            <GitHubStar />
          </div>
          <LocaleChange url={"/"} />
          {!user ? (
            <Link href={`/${lang}/login`}>
              <Button variant="outline" size="sm">
                {typeof marketing.login === "string"
                  ? marketing.login
                  : UI_STRINGS.login}
              </Button>
            </Link>
          ) : null}

          {user ? (
            <UserAccountNav
              user={user}
              params={{ lang: `${lang}` }}
              dict={dropdown}
            />
          ) : (
            <Button
              className="px-3"
              variant="default"
              size="sm"
              onClick={signInModal.onOpen}
            >
              {typeof marketing.signup === "string"
                ? marketing.signup
                : UI_STRINGS.signup}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
