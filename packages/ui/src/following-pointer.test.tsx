import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FollowerPointerCard, FollowPointer } from "./following-pointer";

describe("FollowerPointerCard Component", () => {
  it("should render children inside the card", () => {
    render(
      <FollowerPointerCard>
        <div>Pointer card content</div>
      </FollowerPointerCard>,
    );

    expect(screen.getByText("Pointer card content")).toBeInTheDocument();
  });

  it("should merge custom className into the card", () => {
    const { container } = render(
      <FollowerPointerCard className="custom-pointer-card">
        <div>Content</div>
      </FollowerPointerCard>,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("custom-pointer-card");
  });

  it("should apply a none cursor style", () => {
    const { container } = render(
      <FollowerPointerCard>
        <div>Content</div>
      </FollowerPointerCard>,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveStyle("cursor: none");
  });

  it("should show the pointer on mouse enter", () => {
    render(
      <FollowerPointerCard title="Pointer title">
        <div>Content</div>
      </FollowerPointerCard>,
    );

    expect(screen.queryByText("Pointer title")).not.toBeInTheDocument();

    const card = screen.getByText("Content").parentElement!;
    fireEvent.mouseEnter(card);

    expect(screen.getByText("Pointer title")).toBeInTheDocument();
  });

  it("should fade out the pointer on mouse leave", () => {
    render(
      <FollowerPointerCard title="Pointer title">
        <div>Content</div>
      </FollowerPointerCard>,
    );

    const card = screen.getByText("Content").parentElement!;
    fireEvent.mouseEnter(card);
    expect(screen.getByText("Pointer title")).toBeInTheDocument();

    fireEvent.mouseLeave(card);
    expect(screen.getByText("Pointer title")).toHaveStyle("opacity: 0");
  });
});

describe("FollowPointer Component", () => {
  it("should render the default title when none is provided", () => {
    render(
      <FollowPointer
        x={{ get: () => 0 } as never}
        y={{ get: () => 0 } as never}
      />,
    );

    expect(screen.getByText("William Shakespeare")).toBeInTheDocument();
  });

  it("should render the provided title", () => {
    render(
      <FollowPointer
        x={{ get: () => 0 } as never}
        y={{ get: () => 0 } as never}
        title="Custom pointer title"
      />,
    );

    expect(screen.getByText("Custom pointer title")).toBeInTheDocument();
  });

  it("should render ReactNode titles", () => {
    render(
      <FollowPointer
        x={{ get: () => 0 } as never}
        y={{ get: () => 0 } as never}
        title={<span>Node pointer title</span>}
      />,
    );

    expect(screen.getByText("Node pointer title")).toBeInTheDocument();
  });

  it("should render the pointer cursor svg", () => {
    const { container } = render(
      <FollowPointer
        x={{ get: () => 0 } as never}
        y={{ get: () => 0 } as never}
      />,
    );

    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should apply absolute positioning classes to the pointer", () => {
    const { container } = render(
      <FollowPointer
        x={{ get: () => 0 } as never}
        y={{ get: () => 0 } as never}
      />,
    );

    const pointer = container.querySelector(".absolute");
    expect(pointer).toBeInTheDocument();
    expect(pointer?.className).toContain("z-50");
    expect(pointer).toHaveStyle("pointer-events: none");
  });
});
