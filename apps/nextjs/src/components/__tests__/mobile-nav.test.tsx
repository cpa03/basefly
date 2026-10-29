import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MOBILE_NAV_TOKENS } from "@saasfly/common";

import { MobileNav } from "../mobile-nav";

vi.mock("@saasfly/ui/icons", () => ({
  Logo: () => <span data-testid="icon-logo" />,
}));

vi.mock("~/config/site", () => ({
  siteConfig: {
    name: "Basefly",
  },
}));

vi.mock("~/hooks/use-lock-body", () => ({
  useLockBody: vi.fn(),
}));

describe("MobileNav", () => {
  const items = [
    { title: "Features", href: "/#features" },
    { title: "Pricing", href: "/pricing" },
    { title: "Disabled Item", href: "/disabled", disabled: true },
  ];

  it("renders section with correct ARIA attributes and role", () => {
    render(<MobileNav items={items} />);

    const dialog = screen.getByRole("dialog", {
      name: MOBILE_NAV_TOKENS.section.defaultAriaLabel,
    });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("renders navigation items with tactile scale micro-interactions and focus ring", () => {
    render(<MobileNav items={items} />);

    const featuresLink = screen.getByRole("link", { name: "Features" });
    expect(featuresLink).toBeInTheDocument();
    expect(featuresLink.className).toContain("hover:scale-[1.01]");
    expect(featuresLink.className).toContain("active:scale-[0.99]");
    expect(featuresLink.className).toContain("focus-visible:ring-ring");
  });

  it("handles disabled navigation items correctly", () => {
    render(<MobileNav items={items} />);

    const disabledLink = screen.getByRole("link", { name: "Disabled Item" });
    expect(disabledLink).toHaveAttribute("aria-disabled", "true");
    expect(disabledLink).toHaveAttribute("tabIndex", "-1");
    expect(disabledLink.className).toContain("pointer-events-none");
  });

  it("invokes menuItemClick callback when an enabled link is clicked", () => {
    const handleClick = vi.fn();
    render(<MobileNav items={items} menuItemClick={handleClick} />);

    const pricingLink = screen.getByRole("link", { name: "Pricing" });
    fireEvent.click(pricingLink);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
