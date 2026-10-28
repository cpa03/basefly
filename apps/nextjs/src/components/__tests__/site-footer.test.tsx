import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SITE_FOOTER_TOKENS } from "@saasfly/common";

import { SiteFooter } from "../site-footer";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    alt,
    src,
    width,
    height,
  }: {
    alt?: string;
    src?: string;
    width?: number;
    height?: number;
  }) =>
    React.createElement("img", {
      "data-testid": "footer-logo",
      alt,
      src,
      width,
      height,
    }),
}));

// Mock ModeToggle
vi.mock("~/components/mode-toggle", () => ({
  ModeToggle: () =>
    React.createElement("div", { "data-testid": "mode-toggle" }, "ModeToggle"),
}));

describe("SiteFooter", () => {
  const defaultDict = {
    copyright: "© ${currentYear} Basefly. All rights reserved.",
  };

  it("renders with default role and aria-label", () => {
    render(<SiteFooter dict={defaultDict} />);

    const footer = screen.getByRole("contentinfo", { name: "Site footer" });
    expect(footer).toBeInTheDocument();
  });

  it("allows custom role and aria-label", () => {
    render(
      <SiteFooter
        dict={defaultDict}
        role="region"
        aria-label="Custom footer label"
      />,
    );

    const footer = screen.getByRole("region", { name: "Custom footer label" });
    expect(footer).toBeInTheDocument();
  });

  it("renders logo image with alt text and sizes from SITE_FOOTER_TOKENS", () => {
    render(<SiteFooter dict={defaultDict} />);

    const logo = screen.getByTestId("footer-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "Basefly logo");
    expect(logo).toHaveAttribute(
      "width",
      String(SITE_FOOTER_TOKENS.branding.logoSize),
    );
    expect(logo).toHaveAttribute(
      "height",
      String(SITE_FOOTER_TOKENS.branding.logoSize),
    );
  });

  it("renders copyright text formatted with current year", () => {
    render(<SiteFooter dict={defaultDict} />);

    const currentYear = new Date().getFullYear();
    const copyright = screen.getByText(
      `© ${currentYear} Basefly. All rights reserved.`,
    );
    expect(copyright).toBeInTheDocument();
    expect(copyright).toHaveClass(SITE_FOOTER_TOKENS.branding.copyrightText);
  });

  it("renders ModeToggle component", () => {
    render(<SiteFooter dict={defaultDict} />);

    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("merges custom className into footer base tokens", () => {
    render(<SiteFooter dict={defaultDict} className="my-custom-footer" />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("my-custom-footer");
    expect(footer).toHaveClass(SITE_FOOTER_TOKENS.footer.base);
  });
});
