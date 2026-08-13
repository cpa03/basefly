import React, { type ComponentType } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TextGenerateEffect } from "./text-generate-effect";

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

describe("TextGenerateEffect Component", () => {
  it("should render each word of the provided text", async () => {
    render(<TextGenerateEffect words="Hello world example" />);

    expect(await screen.findByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
    expect(screen.getByText("example")).toBeInTheDocument();
  });

  it("should render words as motion spans with hidden initial opacity", async () => {
    const { container } = render(<TextGenerateEffect words="Hello world" />);

    await screen.findByText("Hello");

    const spans = container.querySelectorAll("span");
    const wordSpans = Array.from(spans).filter((span) =>
      span.className.includes("opacity-0"),
    );
    expect(wordSpans.length).toBe(2);
  });

  it("should merge custom className into the wrapper", async () => {
    const { container } = render(
      <TextGenerateEffect words="Hello world" className="custom-generate" />,
    );

    await screen.findByText("Hello");

    const wrapper = container.querySelector(".custom-generate");
    expect(wrapper).toBeInTheDocument();
  });

  it("should render a single word", async () => {
    render(<TextGenerateEffect words="Solo" />);

    expect(await screen.findByText("Solo")).toBeInTheDocument();
  });
});
