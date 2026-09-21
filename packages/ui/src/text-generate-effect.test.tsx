import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TEXT_GENERATE_EFFECT_TOKENS } from "@saasfly/common";

import { TextGenerateEffect } from "./text-generate-effect";

describe("TextGenerateEffect", () => {
  it("renders with default props, role, and aria-label", async () => {
    render(<TextGenerateEffect words="Hello world" />);

    const element = await screen.findByRole(
      TEXT_GENERATE_EFFECT_TOKENS.defaultRole,
    );
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute(
      "aria-label",
      TEXT_GENERATE_EFFECT_TOKENS.defaultAriaLabel,
    );
  });

  it("applies custom aria-label and role when provided", async () => {
    render(
      <TextGenerateEffect
        words="Test words"
        role="group"
        aria-label="Custom generator label"
      />,
    );

    const element = await screen.findByRole("group");
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute("aria-label", "Custom generator label");
  });

  it("applies token classes and custom className", async () => {
    render(
      <TextGenerateEffect
        words="Token test"
        className="custom-text-generate"
      />,
    );

    const element = await screen.findByRole(
      TEXT_GENERATE_EFFECT_TOKENS.defaultRole,
    );
    expect(element.className).toContain("custom-text-generate");
    expect(element.className).toContain(
      TEXT_GENERATE_EFFECT_TOKENS.container.hoverScale,
    );
    expect(element.className).toContain(
      TEXT_GENERATE_EFFECT_TOKENS.container.activeScale,
    );
  });
});
