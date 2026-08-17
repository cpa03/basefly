import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SparklesCore } from "./sparkles";

// Mock tsparticles to avoid WebGL/canvas engine initialization in happy-dom
vi.mock("@tsparticles/react", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const {
      particlesLoaded: _particlesLoaded,
      options: _options,
      ...rest
    } = props;
    return React.createElement("div", {
      "data-testid": "tsparticles",
      ...rest,
    });
  },
  initParticlesEngine: vi.fn(() => Promise.resolve()),
}));

vi.mock("@tsparticles/slim", () => ({
  loadSlim: vi.fn(() => Promise.resolve()),
}));

describe("SparklesCore Component", () => {
  it("should render the container div", async () => {
    const { container } = render(<SparklesCore />);

    const containerDiv = container.firstElementChild as HTMLElement;
    expect(containerDiv).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("tsparticles")).toBeInTheDocument(),
    );
  });

  it("should mark the decorative container as aria-hidden", async () => {
    const { container } = render(<SparklesCore />);

    const containerDiv = container.firstElementChild as HTMLElement;
    expect(containerDiv).toHaveAttribute("aria-hidden", "true");
    await waitFor(() =>
      expect(screen.getByTestId("tsparticles")).toBeInTheDocument(),
    );
  });

  it("should merge custom className into the container", async () => {
    const { container } = render(<SparklesCore className="custom-sparkles" />);

    const containerDiv = container.firstElementChild as HTMLElement;
    expect(containerDiv).toHaveClass("custom-sparkles");
    await waitFor(() =>
      expect(screen.getByTestId("tsparticles")).toBeInTheDocument(),
    );
  });

  it("should not render particles before the engine initializes", async () => {
    render(<SparklesCore />);

    expect(screen.queryByTestId("tsparticles")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId("tsparticles")).toBeInTheDocument(),
    );
  });

  it("should render particles after the engine initializes", async () => {
    render(<SparklesCore />);

    await waitFor(() => {
      expect(screen.getByTestId("tsparticles")).toBeInTheDocument();
    });
  });

  it("should pass the id prop to the particles component", async () => {
    render(<SparklesCore id="custom-particles" />);

    await waitFor(() => {
      expect(screen.getByTestId("tsparticles")).toHaveAttribute(
        "id",
        "custom-particles",
      );
    });
  });
});
