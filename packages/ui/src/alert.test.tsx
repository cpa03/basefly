import React from "react";
import { ALERT_TOKENS } from "@saasfly/common";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert Component", () => {
  it("should render children content", () => {
    render(<Alert>Alert body</Alert>);
    expect(screen.getByText("Alert body")).toBeInTheDocument();
  });

  it("should render with role status by default or role alert for destructive variant", () => {
    const { rerender } = render(<Alert>Warning</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<Alert variant="destructive">Danger</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("should apply base alert classes and micro-interactions", () => {
    const { container } = render(<Alert>Base</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert).toHaveClass("rounded-lg");
    expect(alert).toHaveClass("border");
    expect(alert).toHaveClass("p-4");
    expect(alert).toHaveClass(ALERT_TOKENS.animations.hoverScale);
    expect(alert).toHaveClass(ALERT_TOKENS.animations.hoverShadow);
  });

  it("should apply default variant classes", () => {
    const { container } = render(<Alert>Default</Alert>);
    expect(container.firstChild).toHaveClass("bg-background");
    expect(container.firstChild).toHaveClass("text-foreground");
  });

  it("should apply destructive variant classes", () => {
    const { container } = render(<Alert variant="destructive">Danger</Alert>);
    expect(container.firstChild).toHaveClass("text-destructive");
    expect(container.firstChild).toHaveClass("border-destructive/50");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Alert className="custom-test-class">X</Alert>,
    );
    expect(container.firstChild).toHaveClass("custom-test-class");
  });

  it("should render with a stable display name", () => {
    expect(Alert.displayName).toBe("Alert");
  });

  it("should forward additional HTML attributes", () => {
    render(<Alert data-testid="test-alert">Attr</Alert>);
    expect(screen.getByTestId("test-alert")).toBeInTheDocument();
  });
});

describe("AlertTitle", () => {
  it("should render children content", () => {
    render(<AlertTitle>Error title</AlertTitle>);
    expect(screen.getByText("Error title")).toBeInTheDocument();
  });

  it("should render as an h5 heading", () => {
    const { container } = render(<AlertTitle>Heading</AlertTitle>);
    expect(container.querySelector("h5")).toBeInTheDocument();
  });

  it("should apply title classes", () => {
    const { container } = render(<AlertTitle>T</AlertTitle>);
    expect(container.querySelector("h5")).toHaveClass("font-medium");
    expect(container.querySelector("h5")).toHaveClass("leading-none");
  });
});

describe("AlertDescription", () => {
  it("should render children content", () => {
    render(<AlertDescription>Description body</AlertDescription>);
    expect(screen.getByText("Description body")).toBeInTheDocument();
  });

  it("should apply description classes", () => {
    const { container } = render(<AlertDescription>D</AlertDescription>);
    expect(container.firstChild).toHaveClass("text-sm");
  });
});

describe("Alert composition", () => {
  it("should compose title and description together", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Deployment failed</AlertTitle>
        <AlertDescription>Check the logs for details.</AlertDescription>
      </Alert>,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Deployment failed")).toBeInTheDocument();
    expect(screen.getByText("Check the logs for details.")).toBeInTheDocument();
  });
});
