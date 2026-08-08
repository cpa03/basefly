import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Callout } from "./callout";

describe("Callout component", () => {
  it("renders children content correctly", () => {
    render(<Callout>Test Children Content</Callout>);
    expect(screen.getByText("Test Children Content")).toBeDefined();
  });

  it("applies the default status role when type is info or default", () => {
    render(<Callout type="info">Info Callout</Callout>);
    const element = screen.getByRole("status");
    expect(element).toBeDefined();
  });

  it("applies the alert role when type is danger or warning", () => {
    render(<Callout type="danger">Danger Callout</Callout>);
    const element = screen.getByRole("alert");
    expect(element).toBeDefined();
  });

  it("renders the icon when provided and has aria-hidden=true", () => {
    render(<Callout icon="💡">Icon Callout</Callout>);
    const iconElement = screen.getByText("💡");
    expect(iconElement).toBeDefined();
    expect(iconElement.getAttribute("aria-hidden")).toBe("true");
  });
});
