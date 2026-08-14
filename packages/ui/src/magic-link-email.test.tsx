import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@react-email/components", () => {
  const createElement = (Tag: keyof React.JSX.IntrinsicElements, name: string) => {
    const Component = ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement(Tag, props, children);
    Component.displayName = name;
    return Component;
  };

  const Button = ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    React.createElement("a", { href, ...props }, children);
  Button.displayName = "Button";

  return {
    Html: createElement("div", "Html"),
    Head: createElement("div", "Head"),
    Body: createElement("div", "Body"),
    Container: createElement("div", "Container"),
    Section: createElement("div", "Section"),
    Text: createElement("p", "Text"),
    Button,
    Hr: createElement("hr", "Hr"),
    Preview: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    Tailwind: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

import { MagicLinkEmail } from "./magic-link-email";

describe("MagicLinkEmail Component", () => {
  it("should render the preview text for login mail type", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/login"
        firstName="Alice"
        mailType="login"
        siteName="Basefly"
      />,
    );

    expect(
      screen.getByText(/Click to sign in your Basefly account/),
    ).toBeInTheDocument();
  });

  it("should render the preview text for register mail type", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/register"
        firstName="Alice"
        mailType="register"
        siteName="Basefly"
      />,
    );

    expect(
      screen.getByText(/Click to activate your Basefly account/),
    ).toBeInTheDocument();
  });

  it("should render the greeting with the first name", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/login"
        firstName="Alice"
        mailType="login"
        siteName="Basefly"
      />,
    );

    expect(screen.getByText(/Hi Alice/)).toBeInTheDocument();
  });

  it("should render the login button with the action URL", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/magic-link"
        firstName="Alice"
        mailType="login"
        siteName="Basefly"
      />,
    );

    const link = screen.getByText("Sign in");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/magic-link",
    );
  });

  it("should render the activate button for register mail type", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/activate"
        firstName="Alice"
        mailType="register"
        siteName="Basefly"
      />,
    );

    const link = screen.getByText("Activate Account");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute(
      "href",
      "https://example.com/activate",
    );
  });

  it("should render the welcome message with the site name", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/login"
        firstName="Alice"
        mailType="login"
        siteName="Basefly"
      />,
    );

    expect(screen.getByText(/Welcome to Basefly/)).toBeInTheDocument();
  });

  it("should render the expiry note and footer", () => {
    render(
      <MagicLinkEmail
        actionUrl="https://example.com/login"
        firstName="Alice"
        mailType="login"
        siteName="Basefly"
      />,
    );

    expect(
      screen.getByText(/This link expires in 24 hours/),
    ).toBeInTheDocument();
    expect(screen.getByText("saasfly.io")).toBeInTheDocument();
  });
});