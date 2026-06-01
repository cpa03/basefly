import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { TailwindIndicator } from "../tailwind-indicator";

const originalEnv = process.env.NODE_ENV;

describe("TailwindIndicator", () => {
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("renders current breakpoint indicator in development mode", () => {
    process.env.NODE_ENV = "development";

    render(<TailwindIndicator />);
    expect(screen.getByText("xs")).toBeInTheDocument();
  });

  it("returns null in production mode", () => {
    process.env.NODE_ENV = "production";

    const { container } = render(<TailwindIndicator />);
    expect(container.innerHTML).toBe("");
  });

  it("renders in development mode when NODE_ENV is not set (defaults to dev behavior)", () => {
    delete process.env.NODE_ENV;

    const { container } = render(<TailwindIndicator />);
    // Component renders in non-production environments
    expect(container.innerHTML).not.toBe("");
  });
});
