import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClusterOperations } from "../k8s/cluster-operation";

// Mock @saasfly/ui/dropdown-menu (Radix-based)
vi.mock("@saasfly/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      data-testid="dropdown-trigger"
      className={className}
      aria-label="Cluster actions"
      {...props}
    >
      {children}
    </button>
  ),
  DropdownMenuContent: ({
    children,
    align,
  }: {
    children: React.ReactNode;
    align?: string;
  }) => (
    <div data-testid="dropdown-content" data-align={align}>
      {children}
    </div>
  ),
  DropdownMenuItem: ({
    children,
    className,
    onSelect,
    disabled,
  }: {
    children: React.ReactNode;
    className?: string;
    onSelect?: () => void;
    disabled?: boolean;
  }) => (
    <button
      data-testid="dropdown-item"
      className={className}
      onClick={onSelect}
      onKeyDown={onSelect ? (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onSelect(); } : undefined}
      aria-disabled={disabled}
      data-disabled={disabled}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
    >
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

// Mock @saasfly/ui/alert-dialog
vi.mock("@saasfly/ui/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (
    <div data-testid="alert-dialog" data-open={open}>
      {/* Only render children when open to simulate behavior */}
      {open ? children : null}
    </div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="alert-dialog-title">{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="alert-dialog-description">{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    className,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    className?: string;
  }) => (
    <button
      data-testid="alert-dialog-action"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock @saasfly/ui/icons
vi.mock("@saasfly/ui/icons", () => ({
  Ellipsis: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-ellipsis" className={(props as Record<string, string>)?.className} />
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-copy" className={(props as Record<string, string>)?.className} />
  ),
  CopyDone: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-copy-done" className={(props as Record<string, string>)?.className} />
  ),
  Spinner: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-spinner" className={(props as Record<string, string>)?.className} />
  ),
  Trash: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-trash" className={(props as Record<string, string>)?.className} />
  ),
}));

// Mock ~/env.mjs to prevent tRPC client dependency chain from failing
vi.mock("~/env.mjs", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

// Mock @saasfly/ui/use-toast
vi.mock("@saasfly/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock @saasfly/common/config/ui - constants
vi.mock("@saasfly/common/config/ui", () => ({
  FEEDBACK_TIMING: {
    tooltipDelay: 0,
    copySuccess: 3000,
  },
  SEMANTIC_COLORS: {
    success: {
      icon: "text-green-500",
      text: "text-green-700",
    },
    destructive: {
      background: "bg-red-600",
      ring: "ring-red-600",
    },
  },
  TRANSITION_PRESETS: {
    interactive: "transition-all duration-200",
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockCluster = { id: 1, name: "test-cluster" };

const defaultDict = {
  k8s: {
    actions: {
      edit: "Edit",
      copy_id: "Copy ID",
      copying: "Copying...",
      copied: "Copied!",
      copy_success_title: "Copied!",
      copy_success_desc: "Cluster ID copied to clipboard.",
      delete: "Delete",
      cancel: "Cancel",
    },
    delete_dialog: {
      title: "Delete cluster?",
      description: "This action cannot be undone.",
    },
    errors: {
      delete_failed_title: "Delete failed",
      delete_failed_desc: "Please try again.",
      unexpected_error_title: "Error",
      unexpected_error_desc: "An unexpected error occurred.",
    },
  },
};

describe("ClusterOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dropdown trigger button", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    const trigger = screen.getByTestId("dropdown-trigger");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-label", "Cluster actions");
  });

  it("renders the Ellipsis icon", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    expect(screen.getByTestId("icon-ellipsis")).toBeInTheDocument();
  });

  it("renders dropdown menu with actions", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    const items = screen.getAllByTestId("dropdown-item");
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it("renders Edit link with correct href", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    const editLink = screen.getByText("Edit");
    expect(editLink).toBeInTheDocument();
    expect(editLink.closest("a")).toHaveAttribute(
      "href",
      "/en/editor/cluster/1",
    );
  });

  it("renders Copy ID option", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    expect(screen.getByText("Copy ID")).toBeInTheDocument();
  });

  it("renders Delete option", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders delete dialog only when triggered", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    // AlertDialog should not be visible initially (open is false)
    expect(screen.queryByTestId("alert-dialog-title")).not.toBeInTheDocument();
  });

  it("renders separators between menu items", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={defaultDict}
      />,
    );

    const separators = screen.getAllByTestId("dropdown-separator");
    expect(separators.length).toBe(2); // Two separators: before Copy ID and before Delete
  });

  it("uses fallback text when dict is incomplete", () => {
    render(
      <ClusterOperations
        cluster={mockCluster}
        lang="en"
        dict={{}}
      />,
    );

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Copy ID")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
