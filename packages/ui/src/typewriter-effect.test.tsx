import React, { type ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TypewriterEffect } from "./typewriter-effect";

// Mock next/dynamic to resolve the loader directly to the component.
// Next.js dynamic() resolves the loader to a component (not a module),
// so the mock adapts the promise to the React.lazy module shape.
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: () => Promise<ComponentType>) => {
    const DynamicComponent = (props: Record<string, unknown>) => {
      const [Comp, setComp] = React.useState<ComponentType | null>(null);

      React.useEffect(() => {
        let mounted = true;
        void loader().then((Component) => {
          if (mounted) setComp(() => Component);
        });
        return () => {
          mounted = false;
        };
      }, []);

      return Comp ? React.createElement(Comp, props) : null;
    };
    return DynamicComponent;
  },
}));

// Stub IntersectionObserver used by framer-motion's useInView
class IntersectionObserverStub {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

const words = [
  { text: "Hello" },
  { text: "world", className: "text-blue-500" },
];

describe("TypewriterEffect Component", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should render each character of the provided words", async () => {
    render(<TypewriterEffect words={words} />);

    expect(await screen.findByText("H")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
    // "l" and "o" appear in both "Hello" and "world"
    expect(screen.getAllByText("l")).toHaveLength(3);
    expect(screen.getAllByText("o")).toHaveLength(2);
    expect(screen.getByText("w")).toBeInTheDocument();
    expect(screen.getByText("r")).toBeInTheDocument();
    expect(screen.getByText("d")).toBeInTheDocument();
  });

  it("should apply per-word className to its characters", async () => {
    const { container } = render(<TypewriterEffect words={words} />);

    await screen.findByText("H");

    const blueChars = container.querySelectorAll(".text-blue-500");
    expect(blueChars.length).toBe(5); // "world" has 5 characters
  });

  it("should render the blinking cursor", async () => {
    const { container } = render(<TypewriterEffect words={words} />);

    await screen.findByText("H");

    const cursor = container.querySelector(".bg-blue-500");
    expect(cursor).toBeInTheDocument();
  });

  it("should merge custom className into the paragraph", async () => {
    const { container } = render(
      <TypewriterEffect words={words} className="custom-typewriter" />,
    );

    await screen.findByText("H");

    const paragraph = container.querySelector(".custom-typewriter");
    expect(paragraph).toBeInTheDocument();
  });

  it("should merge cursorClassName into the cursor element", async () => {
    const { container } = render(
      <TypewriterEffect words={words} cursorClassName="custom-cursor" />,
    );

    await screen.findByText("H");

    const cursor = container.querySelector(".custom-cursor");
    expect(cursor).toBeInTheDocument();
  });

  it("should render hidden characters initially", async () => {
    const { container } = render(<TypewriterEffect words={words} />);

    await screen.findByText("H");

    const hiddenChars = container.querySelectorAll(".hidden");
    expect(hiddenChars.length).toBeGreaterThan(0);
  });
});
