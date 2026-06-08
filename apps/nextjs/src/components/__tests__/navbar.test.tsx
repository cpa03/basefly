import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NavBar } from "../navbar";

// Mock hooks
vi.mock("~/hooks/use-scroll", () => ({
  default: () => false,
}));

vi.mock("~/hooks/use-signin-modal", () => ({
  useSigninModal: () => ({
    isOpen: false,
    onOpen: vi.fn(),
    onClose: vi.fn(),
  }),
}));

// Mock sub-components
vi.mock("../main-nav", () => ({
  MainNav: vi
    .fn()
    .mockImplementation(
      ({
        children,
        params,
      }: {
        children: React.ReactNode;
        params: { lang: string };
      }) => (
        <nav data-testid="main-nav" data-lang={params.lang}>
          {children}
        </nav>
      ),
    ),
}));

vi.mock("../user-account-nav", () => ({
  UserAccountNav: vi
    .fn()
    .mockImplementation(
      ({ user }: { user: { name: string } }) =>
        <div data-testid="user-account-nav" data-user={user.name} />,
    ),
}));

vi.mock("../github-star", () => ({
  GitHubStar: () => <div data-testid="github-star" />,
}));

vi.mock("../locale-change", () => ({
  LocaleChange: ({
    currentLocale,
  }: {
    currentLocale: string;
  }) => <div data-testid="locale-change" data-locale={currentLocale} />,
}));

// Mock @saasfly/ui/button
vi.mock("@saasfly/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
    onClick?: () => void;
  }) => (
    <button
      data-variant={variant}
      data-size={size}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

const defaultMarketing = {
  login: "Sign in",
  signup: "Get started",
};

const defaultDropdown = {
  dashboard: "Dashboard",
  billing: "Billing",
  settings: "Settings",
  sign_out: "Sign out",
  open_user_menu: "Open user menu",
};

const defaultItems = [
  { href: "/features", title: "Features" },
  { href: "/pricing", title: "Pricing" },
];

describe("NavBar", () => {
  it("renders the header element", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    const header = document.querySelector("header");
    expect(header).toBeInTheDocument();
  });

  it("renders MainNav with children", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    expect(screen.getByTestId("main-nav")).toBeInTheDocument();
  });

  it("renders language selector", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    const localeChange = screen.getByTestId("locale-change");
    expect(localeChange).toBeInTheDocument();
    expect(localeChange).toHaveAttribute("data-locale", "en");
  });

  it("renders GitHub star button", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    expect(screen.getByTestId("github-star")).toBeInTheDocument();
  });

  it("renders login and signup buttons when user is not signed in", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
  });

  it("renders UserAccountNav when user is signed in", () => {
    render(
      <NavBar
        user={{ name: "John Doe", image: null, email: "john@example.com" }}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    const userNav = screen.getByTestId("user-account-nav");
    expect(userNav).toBeInTheDocument();
    expect(userNav).toHaveAttribute("data-user", "John Doe");
  });

  it("does not render sign-in/signup buttons when user is signed in", () => {
    render(
      <NavBar
        user={{ name: "John Doe", image: null, email: "john@example.com" }}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("Get started")).not.toBeInTheDocument();
  });

  it("renders navigation items when provided", () => {
    render(
      <NavBar
        user={undefined}
        items={defaultItems}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
  });

  it("renders with the language parameter in links", () => {
    render(
      <NavBar
        user={undefined}
        items={defaultItems}
        params={{ lang: "fr" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    // Features link should include the lang prefix
    const featuresLink = screen.getByText("Features").closest("a");
    expect(featuresLink).toHaveAttribute("href", "/fr/features");
  });

  it("applies border by default when scroll is false", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    const header = document.querySelector("header");
    expect(header?.className).toContain("border-b");
  });

  it("applies children as custom content", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "en" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      >
        <span data-testid="custom-child">Custom Content</span>
      </NavBar>,
    );

    expect(screen.getByTestId("custom-child")).toBeInTheDocument();
  });

  it("passes lang params to MainNav correctly", () => {
    render(
      <NavBar
        user={undefined}
        params={{ lang: "ko" }}
        marketing={defaultMarketing}
        dropdown={defaultDropdown}
      />,
    );

    const mainNav = screen.getByTestId("main-nav");
    expect(mainNav).toHaveAttribute("data-lang", "ko");
  });
});
