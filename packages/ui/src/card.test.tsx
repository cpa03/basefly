import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card Component", () => {
  it("should render children content", () => {
    render(<Card>Card body</Card>);
    expect(screen.getByText("Card body")).toBeInTheDocument();
  });

  it("should apply base card classes", () => {
    const { container } = render(<Card>Base</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("rounded-lg");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("bg-card");
    expect(card).toHaveClass("shadow-sm");
  });

  it("should apply custom className", () => {
    const { container } = render(<Card className="custom-test-class">X</Card>);
    expect(container.firstChild).toHaveClass("custom-test-class");
  });

  it("should not add interactive classes by default", () => {
    const { container } = render(<Card>Default</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass("cursor-pointer");
    expect(card).not.toHaveClass("transition-all");
  });

  it("should add interactive classes when interactive is true", () => {
    const { container } = render(<Card interactive>Interactive</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass("cursor-pointer");
    expect(card).toHaveClass("transition-all");
    expect(card).toHaveClass("hover:scale-[1.005]");
    expect(card).toHaveClass("active:scale-[0.995]");
  });

  it("should render with a stable display name", () => {
    expect(Card.displayName).toBe("Card");
  });

  it("should forward additional HTML attributes", () => {
    render(<Card data-testid="test-card">Attr</Card>);
    expect(screen.getByTestId("test-card")).toBeInTheDocument();
  });
});

describe("CardHeader", () => {
  it("should render children content", () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText("Header content")).toBeInTheDocument();
  });

  it("should apply header classes", () => {
    const { container } = render(<CardHeader>H</CardHeader>);
    expect(container.firstChild).toHaveClass("flex");
    expect(container.firstChild).toHaveClass("p-6");
  });
});

describe("CardTitle", () => {
  it("should render children content", () => {
    render(<CardTitle>Title text</CardTitle>);
    expect(screen.getByText("Title text")).toBeInTheDocument();
  });

  it("should render as an h3 heading", () => {
    const { container } = render(<CardTitle>Heading</CardTitle>);
    expect(container.querySelector("h3")).toBeInTheDocument();
  });

  it("should apply title classes", () => {
    const { container } = render(<CardTitle>T</CardTitle>);
    expect(container.querySelector("h3")).toHaveClass("text-lg");
    expect(container.querySelector("h3")).toHaveClass("font-semibold");
  });
});

describe("CardDescription", () => {
  it("should render children content", () => {
    render(<CardDescription>Description text</CardDescription>);
    expect(screen.getByText("Description text")).toBeInTheDocument();
  });

  it("should render as a paragraph element", () => {
    const { container } = render(<CardDescription>Desc</CardDescription>);
    expect(container.querySelector("p")).toBeInTheDocument();
  });

  it("should apply description classes", () => {
    const { container } = render(<CardDescription>D</CardDescription>);
    expect(container.querySelector("p")).toHaveClass("text-sm");
    expect(container.querySelector("p")).toHaveClass("text-muted-foreground");
  });
});

describe("CardContent", () => {
  it("should render children content", () => {
    render(<CardContent>Content body</CardContent>);
    expect(screen.getByText("Content body")).toBeInTheDocument();
  });

  it("should apply content classes", () => {
    const { container } = render(<CardContent>C</CardContent>);
    expect(container.firstChild).toHaveClass("p-6");
    expect(container.firstChild).toHaveClass("pt-0");
  });
});

describe("CardFooter", () => {
  it("should render children content", () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("should apply footer classes", () => {
    const { container } = render(<CardFooter>F</CardFooter>);
    expect(container.firstChild).toHaveClass("flex");
    expect(container.firstChild).toHaveClass("p-6");
  });
});

describe("Card composition", () => {
  it("should compose header, title, content, and footer together", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Your subscription</CardDescription>
        </CardHeader>
        <CardContent>Details</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Your subscription")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });
});
