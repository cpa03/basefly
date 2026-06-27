import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TailwindIndicator } from "../tailwind-indicator";

describe("TailwindIndicator", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders current breakpoint indicator in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");

    render(<TailwindIndicator />);
    expect(screen.getByText("xs")).toBeInTheDocument();
  });

  it("returns null in production mode", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { container } = render(<TailwindIndicator />);
    expect(container.innerHTML).toBe("");
  });

  it("renders in development mode when NODE_ENV is not set (defaults to dev behavior)", () => {
    const { container } = render(<TailwindIndicator />);
    // Component renders in non-production environments
    expect(container.innerHTML).not.toBe("");
  });
});
