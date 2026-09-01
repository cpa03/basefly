"use client";

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CARD_3D_TOKENS } from "@saasfly/common";

import { CardBody, CardContainer, CardItem, useMouseEnter } from "./3d-card";

// Helper component to test useMouseEnter hook error handling
const TestHookConsumer = () => {
  useMouseEnter();
  return <div>Hook Consumer</div>;
};

describe("3D Card Component", () => {
  it("renders container with default aria-label and CARD_3D_TOKENS styles", () => {
    render(
      <CardContainer>
        <CardBody>
          <CardItem>3D Content</CardItem>
        </CardBody>
      </CardContainer>,
    );

    const container = screen.getByLabelText(CARD_3D_TOKENS.defaultAriaLabel);
    expect(container).toBeDefined();
    expect(container.className).toContain("py-20");
    expect(screen.getByText("3D Content")).toBeDefined();
  });

  it("supports custom aria-label fallback override", () => {
    render(
      <CardContainer aria-label="Custom 3D Card">
        <CardBody>
          <CardItem>Test Item</CardItem>
        </CardBody>
      </CardContainer>,
    );

    expect(screen.getByLabelText("Custom 3D Card")).toBeDefined();
  });

  it("applies tactile spring scale classes on CardContainer inner wrapper", () => {
    render(
      <CardContainer>
        <CardBody>
          <CardItem>Scaled Item</CardItem>
        </CardBody>
      </CardContainer>,
    );

    const container = screen.getByLabelText(CARD_3D_TOKENS.defaultAriaLabel);
    const innerDiv = container.firstElementChild;
    expect(innerDiv).not.toBeNull();
    expect(innerDiv?.className).toContain(CARD_3D_TOKENS.container.hoverScale);
    expect(innerDiv?.className).toContain(CARD_3D_TOKENS.container.activeScale);
  });

  it("calculates and applies 3D rotation transform on mouseMove", () => {
    render(
      <CardContainer containerClassName="test-container">
        <CardBody>
          <CardItem>Hover Item</CardItem>
        </CardBody>
      </CardContainer>,
    );

    const container = screen.getByLabelText(CARD_3D_TOKENS.defaultAriaLabel);
    const innerDiv = container.firstElementChild as HTMLElement;

    // Mock getBoundingClientRect for calculations
    innerDiv.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      bottom: 200,
      right: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseEnter(innerDiv);
    fireEvent.mouseMove(innerDiv, { clientX: 150, clientY: 150 });

    // x = (150 - 0 - 100) / 25 = 2deg
    // y = (150 - 0 - 100) / 25 = 2deg
    expect(innerDiv.style.transform).toBe("rotateY(2deg) rotateX(2deg)");
  });

  it("resets transform on mouseLeave", () => {
    render(
      <CardContainer>
        <CardBody>
          <CardItem>Leave Item</CardItem>
        </CardBody>
      </CardContainer>,
    );

    const container = screen.getByLabelText(CARD_3D_TOKENS.defaultAriaLabel);
    const innerDiv = container.firstElementChild as HTMLElement;

    fireEvent.mouseLeave(innerDiv);
    expect(innerDiv.style.transform).toBe("rotateY(0deg) rotateX(0deg)");
  });

  it("supports polymorphic 'as' prop on CardItem", () => {
    render(
      <CardContainer>
        <CardBody>
          <CardItem as="button" data-testid="card-button">
            Clickable Card Item
          </CardItem>
        </CardBody>
      </CardContainer>,
    );

    const button = screen.getByTestId("card-button");
    expect(button.tagName.toLowerCase()).toBe("button");
  });

  it("throws error when useMouseEnter is used outside CardContainer provider", () => {
    expect(() => render(<TestHookConsumer />)).toThrow(
      "useMouseEnter must be used within a MouseEnterProvider",
    );
  });
});
