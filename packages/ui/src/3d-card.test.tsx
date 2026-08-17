import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardBody, CardContainer, CardItem, useMouseEnter } from "./3d-card";

describe("CardContainer Component", () => {
  it("should render children inside the container", () => {
    render(
      <CardContainer>
        <div>Card content</div>
      </CardContainer>,
    );

    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("should apply perspective style to the outer container", () => {
    const { container } = render(
      <CardContainer>
        <div>Content</div>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveStyle("perspective: 1000px");
  });

  it("should merge containerClassName into the outer container", () => {
    const { container } = render(
      <CardContainer containerClassName="custom-outer">
        <div>Content</div>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveClass("custom-outer");
  });

  it("should merge className into the inner card wrapper", () => {
    const { container } = render(
      <CardContainer className="custom-inner">
        <div>Content</div>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    const inner = outer?.firstElementChild as HTMLElement;
    expect(inner).toHaveClass("custom-inner");
  });

  it("should reset the card transform on mouse leave", () => {
    const { container } = render(
      <CardContainer>
        <div>Content</div>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    const inner = outer?.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(inner);
    fireEvent.mouseLeave(inner);

    expect(inner.style.transform).toBe("rotateY(0deg) rotateX(0deg)");
  });

  it("should update the card transform on mouse move", () => {
    const { container } = render(
      <CardContainer>
        <div>Content</div>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    const inner = outer?.firstElementChild as HTMLElement;

    fireEvent.mouseMove(inner, { clientX: 50, clientY: 50 });

    expect(inner.style.transform).toMatch(/rotateY\(/);
    expect(inner.style.transform).toMatch(/rotateX\(/);
  });
});

describe("CardBody Component", () => {
  it("should render children inside the card body", () => {
    render(
      <CardBody>
        <span>Body content</span>
      </CardBody>,
    );

    expect(screen.getByText("Body content")).toBeInTheDocument();
  });

  it("should apply preserve-3d transform style", () => {
    const { container } = render(
      <CardBody>
        <span>Body content</span>
      </CardBody>,
    );

    const body = container.firstElementChild as HTMLElement;
    expect(body.className).toContain("[transform-style:preserve-3d]");
  });

  it("should merge custom className into the card body", () => {
    const { container } = render(
      <CardBody className="custom-body">
        <span>Body content</span>
      </CardBody>,
    );

    const body = container.firstElementChild as HTMLElement;
    expect(body).toHaveClass("custom-body");
  });
});

describe("CardItem Component", () => {
  it("should render children inside the item", () => {
    render(
      <CardContainer>
        <CardItem>
          <span>Item content</span>
        </CardItem>
      </CardContainer>,
    );

    expect(screen.getByText("Item content")).toBeInTheDocument();
  });

  it("should render as a custom element when as prop is provided", () => {
    const { container } = render(
      <CardContainer>
        <CardItem as="section">
          <span>Section item</span>
        </CardItem>
      </CardContainer>,
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("should merge custom className into the item", () => {
    const { container } = render(
      <CardContainer>
        <CardItem className="custom-item" data-testid="card-item">
          <span>Item content</span>
        </CardItem>
      </CardContainer>,
    );

    const item = container.querySelector('[data-testid="card-item"]');
    expect(item).toHaveClass("custom-item");
  });

  it("should forward additional props to the rendered element", () => {
    const { container } = render(
      <CardContainer>
        <CardItem data-testid="card-item" aria-label="Aria item">
          <span>Item content</span>
        </CardItem>
      </CardContainer>,
    );

    const item = container.querySelector('[data-testid="card-item"]');
    expect(item).toHaveAttribute("aria-label", "Aria item");
  });

  it("should apply translate and rotate transforms when the card is hovered", () => {
    const { container } = render(
      <CardContainer>
        <CardItem
          translateX={10}
          translateY={20}
          translateZ={30}
          rotateX={5}
          data-testid="card-item"
        >
          <span>Item content</span>
        </CardItem>
      </CardContainer>,
    );

    const outer = container.firstElementChild as HTMLElement;
    const hoverTarget = outer?.firstElementChild as HTMLElement;
    const item = container.querySelector<HTMLElement>(
      '[data-testid="card-item"]',
    )!;

    fireEvent.mouseEnter(hoverTarget);

    expect(item.style.transform).toContain("translateX(10px)");
    expect(item.style.transform).toContain("translateY(20px)");
    expect(item.style.transform).toContain("translateZ(30px)");
    expect(item.style.transform).toContain("rotateX(5deg)");
  });
});

describe("useMouseEnter hook", () => {
  it("should throw when used outside of a MouseEnterProvider", () => {
    const Consumer = () => {
      useMouseEnter();
      return null;
    };

    expect(() => render(<Consumer />)).toThrow(
      "useMouseEnter must be used within a MouseEnterProvider",
    );
  });

  it("should return the context value when used inside the provider", () => {
    const Consumer = () => {
      const [isMouseEntered] = useMouseEnter();
      return <span data-testid="context-value">{String(isMouseEntered)}</span>;
    };

    render(
      <CardContainer>
        <Consumer />
      </CardContainer>,
    );

    expect(screen.getByTestId("context-value")).toHaveTextContent("false");
  });
});
