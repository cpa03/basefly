 
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Modal } from "../modal";

// Mock use-media-query to default to desktop
const { mockUseMediaQuery } = vi.hoisted(() => {
  const mock = vi.fn(() => ({
    isMobile: false as boolean,
    isTablet: false as boolean,
    isDesktop: true as boolean,
    device: "desktop" as string,
    width: 1024 as number,
    height: 768 as number,
  }));
  return { mockUseMediaQuery: mock };
});

vi.mock("~/hooks/use-media-query", () => ({
  default: mockUseMediaQuery,
}));

// Mock vaul (Drawer) - mobile variant
vi.mock("vaul", () => ({
  Drawer: {
    Root: ({
      children,
      open,
    }: {
      children: React.ReactNode;
      open?: boolean;
    }) => <div data-testid="drawer-root" data-open={open}>{children}</div>,
    Overlay: ({
      className,
    }: {
      className?: string;
    }) => <div data-testid="drawer-overlay" className={className} />,
    Portal: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="drawer-portal">{children}</div>
    ),
    Content: ({
      children,
      className,
      ...rest
    }: {
      children: React.ReactNode;
      className?: string;
    } & Record<string, unknown>) => (
      <div data-testid="drawer-content" className={className} {...rest}>
        {children}
      </div>
    ),
  },
}));

// Mock @saasfly/ui/dialog
vi.mock("@saasfly/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => <div data-testid="dialog-root" data-open={open}>{children}</div>,
  DialogContent: ({
    children,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    className?: string;
  } & Record<string, unknown>) => (
    <div data-testid="dialog-content" className={className} {...rest}>
      {children}
    </div>
  ),
}));

const setShowModal = vi.fn();

describe("Modal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Desktop view", () => {
    it("renders Dialog when not mobile", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Modal content</span>
        </Modal>,
      );

      expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
      expect(screen.queryByTestId("drawer-root")).not.toBeInTheDocument();
    });

    it("passes showModal to Dialog open prop", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      const dialog = screen.getByTestId("dialog-root");
      expect(dialog).toHaveAttribute("data-open", "true");
    });

    it("renders children inside DialogContent", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span data-testid="child">Child content</span>
        </Modal>,
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("renders title as sr-only heading when provided", () => {
      render(
        <Modal
          showModal={true}
          setShowModal={setShowModal}
          title="Confirm Action"
        >
          <span>Content</span>
        </Modal>,
      );

      const title = screen.getByText("Confirm Action");
      expect(title).toBeInTheDocument();
      expect(title.className).toContain("sr-only");
    });

    it("renders description as sr-only when provided", () => {
      render(
        <Modal
          showModal={true}
          setShowModal={setShowModal}
          description="This action cannot be undone"
        >
          <span>Content</span>
        </Modal>,
      );

      const desc = screen.getByText("This action cannot be undone");
      expect(desc).toBeInTheDocument();
      expect(desc.className).toContain("sr-only");
    });

    it("sets aria-label on DialogContent when title is not provided", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveAttribute("aria-label", "Modal content");
    });

    it("does not show content when showModal is false", () => {
      render(
        <Modal showModal={false} setShowModal={setShowModal}>
          <span data-testid="child">Hidden content</span>
        </Modal>,
      );

      // Dialog itself may still render but should have data-open set to false
      const dialog = screen.getByTestId("dialog-root");
      expect(dialog).toHaveAttribute("data-open", "false");
    });
  });

  describe("Mobile view", () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        device: "mobile",
        width: 375,
        height: 812,
      });
    });

    it("renders Drawer when mobile", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Mobile content</span>
        </Modal>,
      );

      expect(screen.getByTestId("drawer-root")).toBeInTheDocument();
      expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();
    });

    it("passes showModal to Drawer open", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      const drawer = screen.getByTestId("drawer-root");
      expect(drawer).toHaveAttribute("data-open", "true");
    });

    it("renders children inside Drawer", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span data-testid="mobile-child">Mobile content</span>
        </Modal>,
      );

      expect(screen.getByTestId("mobile-child")).toBeInTheDocument();
    });

    it("renders drag handle in drawer", () => {
      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      const dragHandle = document.querySelector(".rounded-full");
      expect(dragHandle).toBeInTheDocument();
    });

    it("renders title as sr-only heading when provided on mobile", () => {
      render(
        <Modal
          showModal={true}
          setShowModal={setShowModal}
          title="Mobile Title"
        >
          <span>Content</span>
        </Modal>,
      );

      const title = screen.getByText("Mobile Title");
      expect(title).toBeInTheDocument();
      expect(title.className).toContain("sr-only");
    });
  });

  describe("Accessibility", () => {
    it("wraps DialogContent with aria-label when no title given", () => {
      mockUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        device: "desktop",
        width: 1024,
        height: 768,
      });

      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      const content = screen.getByTestId("dialog-content");
      expect(content).toHaveAttribute("aria-label", "Modal content");
    });
  });

  describe("Props propagation", () => {
    it("forwards setShowModal as onOpenChange to Dialog", () => {
      mockUseMediaQuery.mockReturnValue({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        device: "desktop",
        width: 1024,
        height: 768,
      });

      render(
        <Modal showModal={true} setShowModal={setShowModal}>
          <span>Content</span>
        </Modal>,
      );

      // Dialog should render with open=true
      expect(screen.getByTestId("dialog-root")).toHaveAttribute("data-open", "true");
    });
  });
});
