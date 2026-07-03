import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UserAvatar } from "../user-avatar";

// Mock @saasfly/ui/avatar
vi.mock("@saasfly/ui/avatar", () => ({
  Avatar: ({ children, ...props }: { children: React.ReactNode; className?: string }) =>
    React.createElement("div", { "data-testid": "avatar", ...props }, children),
  AvatarImage: ({ alt, src }: { alt?: string; src?: string }) =>
    React.createElement("img", { "data-testid": "avatar-image", alt, src }),
  AvatarFallback: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "avatar-fallback" }, children),
}));

// Mock @saasfly/ui/icons
vi.mock("@saasfly/ui/icons", () => ({
  User: (props: { className?: string }) =>
    React.createElement("svg", { "data-testid": "user-icon", className: props.className }),
}));

describe("UserAvatar", () => {
  it("renders the avatar wrapper", () => {
    render(<UserAvatar user={{ name: "John Doe", image: null }} />);

    expect(screen.getByTestId("avatar")).toBeInTheDocument();
  });

  it("renders avatar image when user has an image", () => {
    render(
      <UserAvatar
        user={{ name: "John Doe", image: "https://example.com/avatar.jpg" }}
      />,
    );

    const image = screen.getByTestId("avatar-image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("sets alt text with user name when image is present", () => {
    render(
      <UserAvatar
        user={{ name: "Jane Doe", image: "https://example.com/jane.jpg" }}
      />,
    );

    const image = screen.getByTestId("avatar-image");
    expect(image).toHaveAttribute("alt", "Jane Doe's avatar");
  });

  it("renders fallback icon when user has no image", () => {
    render(<UserAvatar user={{ name: "John Doe", image: null }} />);

    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("renders fallback when user has undefined image", () => {
    render(<UserAvatar user={{ name: "John Doe" }} />);

    expect(screen.getByTestId("avatar-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("sets generic alt when user name is not provided but image exists", () => {
    render(
      <UserAvatar
        user={{ name: null, image: "https://example.com/avatar.jpg" }}
      />,
    );

    const image = screen.getByTestId("avatar-image");
    expect(image).toHaveAttribute("alt", "User avatar");
  });

  it("renders user name as screen-reader text in fallback", () => {
    render(<UserAvatar user={{ name: "John Doe", image: null }} />);

    const srSpan = screen.getByText("John Doe");
    expect(srSpan).toHaveClass("sr-only");
  });

  it("does not render image when user.image is null", () => {
    render(<UserAvatar user={{ name: "John Doe", image: null }} />);

    expect(screen.queryByTestId("avatar-image")).not.toBeInTheDocument();
  });

  it("passes additional props to Avatar component", () => {
    render(
      <UserAvatar
        user={{ name: "John Doe", image: null }}
        className="custom-class"
      />,
    );

    const avatar = screen.getByTestId("avatar");
    expect(avatar).toHaveClass("custom-class");
  });
});
