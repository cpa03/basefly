import React from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

describe("Accordion Component", () => {
  it("should render successfully with correct default structures", () => {
    const { getByTestId } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" data-testid="accordion-item">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const accordionItem = getByTestId("accordion-item");
    expect(accordionItem).toBeInTheDocument();
    expect(accordionItem).toHaveClass("border-b");
  });

  it("should apply Accordion design tokens to Trigger", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const trigger = container.querySelector("button");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass("flex");
    expect(trigger).toHaveClass("flex-1");
    expect(trigger).toHaveClass("items-center");
    expect(trigger).toHaveClass("justify-between");
    expect(trigger).toHaveClass("hover:scale-[1.015]");
    expect(trigger).toHaveClass("active:scale-[0.985]");
  });

  it("should render ChevronDown with correct classes in Trigger", () => {
    const { container } = render(
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("h-4");
    expect(svg).toHaveClass("w-4");
    expect(svg).toHaveClass("shrink-0");
  });

  it("should apply Accordion design tokens to Content padding", () => {
    const { container } = render(
      <Accordion type="single" collapsible value="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Test Content</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    // Get the inner div with content padding
    const innerDiv = container.querySelector("div[class*='pb-4']");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass("pb-4");
    expect(innerDiv).toHaveClass("pt-0");
  });
});
