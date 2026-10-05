import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UI_LABELS } from "@saasfly/common";

import { MainNav } from "../main-nav";

vi.mock("@saasfly/ui/icons", () => ({
  Close: () => <span data-testid="icon-close" />,
  Logo: () => <span data-testid="icon-logo" />,
}));

vi.mock("~/components/document-guide", () => ({
  DocumentGuide: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("~/components/mobile-nav", () => ({
  MobileNav: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderMainNav() {
  return render(<MainNav params={{ lang: "en" }} />);
}

describe("MainNav", () => {
  it("renders the mobile menu toggle button", () => {
    renderMainNav();

    const toggle = screen.getByRole("button", {
      name: UI_LABELS.openMobileMenu,
    });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-navigation");
  });

  it("applies the tactile scale transition classes", () => {
    renderMainNav();

    const toggle = screen.getByRole("button", {
      name: UI_LABELS.openMobileMenu,
    });

    expect(toggle.className).toContain("transition-transform");
    expect(toggle.className).toContain("duration-150");
    expect(toggle.className).toContain("hover:scale-[1.03]");
    expect(toggle.className).toContain("active:scale-[0.97]");
  });

  it("gates the scale animation behind prefers-reduced-motion", () => {
    renderMainNav();

    const toggle = screen.getByRole("button", {
      name: UI_LABELS.openMobileMenu,
    });

    expect(toggle.className).toContain("motion-reduce:transition-none");
    expect(toggle.className).toContain("motion-reduce:hover:scale-100");
    expect(toggle.className).toContain("motion-reduce:active:scale-100");
  });

  it("toggles aria-expanded and the accessible label on click", () => {
    renderMainNav();

    const toggle = screen.getByRole("button", {
      name: UI_LABELS.openMobileMenu,
    });

    fireEvent.click(toggle);

    const closeButton = screen.getByRole("button", {
      name: UI_LABELS.closeMobileMenu,
    });
    expect(closeButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(closeButton);

    const reopenedButton = screen.getByRole("button", {
      name: UI_LABELS.openMobileMenu,
    });
    expect(reopenedButton).toHaveAttribute("aria-expanded", "false");
  });
});
