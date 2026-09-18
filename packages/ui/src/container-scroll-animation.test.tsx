import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card, ContainerScroll, Header } from "./container-scroll-animation";

describe("ContainerScroll Component", () => {
  it("should render the title component", () => {
    render(
      <ContainerScroll titleComponent={<h1>Scroll title</h1>}>
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    expect(screen.getByText("Scroll title")).toBeInTheDocument();
  });

  it("should render string title components", () => {
    render(
      <ContainerScroll titleComponent="Plain title">
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    expect(screen.getByText("Plain title")).toBeInTheDocument();
  });

  it("should render the children inside the scroll card", () => {
    render(
      <ContainerScroll titleComponent="Title">
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    expect(screen.getByText("Scroll body")).toBeInTheDocument();
  });

  it("should apply relative positioning to the outer container", () => {
    const { container } = render(
      <ContainerScroll titleComponent="Title">
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveStyle("position: relative");
  });

  it("should apply perspective style to the inner wrapper", () => {
    const { container } = render(
      <ContainerScroll titleComponent="Title">
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    const outer = container.firstElementChild as HTMLElement;
    const inner = outer?.firstElementChild as HTMLElement;
    expect(inner).toHaveStyle("perspective: 1000px");
  });

  it("should apply fallback role, aria-label, and scale transition token classes", () => {
    const { container } = render(
      <ContainerScroll titleComponent="Title">
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveAttribute("role", "region");
    expect(outer).toHaveAttribute(
      "aria-label",
      "Interactive scroll animation container",
    );
    expect(outer.className).toContain("hover:scale-[1.002]");
    expect(outer.className).toContain("active:scale-[0.998]");
  });

  it("should allow overriding role and aria-label", () => {
    const { container } = render(
      <ContainerScroll
        titleComponent="Title"
        role="group"
        aria-label="Custom scroll section"
      >
        <div>Scroll body</div>
      </ContainerScroll>,
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveAttribute("role", "group");
    expect(outer).toHaveAttribute("aria-label", "Custom scroll section");
  });
});

describe("Header Component", () => {
  it("should render the title component", () => {
    render(
      <Header
        translate={{ get: () => 0 } as never}
        titleComponent="Header title"
      />,
    );

    expect(screen.getByText("Header title")).toBeInTheDocument();
  });

  it("should render ReactNode title components", () => {
    render(
      <Header
        translate={{ get: () => 0 } as never}
        titleComponent={<span>Node title</span>}
      />,
    );

    expect(screen.getByText("Node title")).toBeInTheDocument();
  });
});

describe("Card Component", () => {
  it("should render children inside the card", () => {
    render(
      <Card
        rotate={{ get: () => 0 } as never}
        scale={{ get: () => 1 } as never}
        translate={{ get: () => 0 } as never}
      >
        <span>Card body</span>
      </Card>,
    );

    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("should apply the card border and shadow classes", () => {
    const { container } = render(
      <Card
        rotate={{ get: () => 0 } as never}
        scale={{ get: () => 1 } as never}
        translate={{ get: () => 0 } as never}
      >
        <span>Card body</span>
      </Card>,
    );

    const card = container.querySelector(".rounded-\\[30px\\]");
    expect(card).toBeInTheDocument();
    expect(card?.className).toContain("border-4");
  });

  it("should render the inner content wrapper", () => {
    const { container } = render(
      <Card
        rotate={{ get: () => 0 } as never}
        scale={{ get: () => 1 } as never}
        translate={{ get: () => 0 } as never}
      >
        <span>Card body</span>
      </Card>,
    );

    const inner = container.querySelector(".overflow-hidden");
    expect(inner).toBeInTheDocument();
  });
});
