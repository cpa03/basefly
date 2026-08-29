import React from "react";
import { render } from "@testing-library/react";
import { SCROLL_AREA_TOKENS } from "@saasfly/common";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ScrollArea, ScrollBar } from "./scroll-area";

// Radix ScrollArea relies on ResizeObserver, which is not implemented in
// happy-dom. Provide a minimal no-op stub for the duration of these tests.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe("ScrollArea Component", () => {
  it("should render children inside the viewport", () => {
    const { container } = render(
      <ScrollArea>
        <p>Scrollable content</p>
      </ScrollArea>,
    );
    const viewport = container.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    expect(viewport).not.toBeNull();
    expect(viewport).toHaveTextContent("Scrollable content");
  });

  it("should apply base root classes", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root).toHaveClass("relative");
    expect(root).toHaveClass("overflow-hidden");
  });

  it("should apply custom className to the root", () => {
    const { container } = render(
      <ScrollArea className="custom-scroll-class">
        <p>Content</p>
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("custom-scroll-class");
  });

  it("should apply viewport classes", () => {
    const { container } = render(
      <ScrollArea>
        <p>Content</p>
      </ScrollArea>,
    );
    const viewport = container.querySelector(
      "[data-radix-scroll-area-viewport]",
    );
    expect(viewport).toHaveClass("h-full");
    expect(viewport).toHaveClass("w-full");
    expect(viewport).toHaveClass("rounded-[inherit]");
  });

  it("should render ScrollBar element with token classes when ScrollBar is rendered", () => {
    const { container } = render(
      <ScrollArea>
        <ScrollBar className="custom-scrollbar" />
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).not.toBeNull();
  });

  it("should pass accessibility attributes and tokens properly when rendered inside ScrollArea", () => {
    const { container } = render(
      <ScrollArea>
        <ScrollBar className="test-scrollbar" aria-label="Custom label" />
      </ScrollArea>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass(SCROLL_AREA_TOKENS.root);
  });
});
