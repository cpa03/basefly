import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { K8sCreateButton } from "../k8s/cluster-create-button";

// Mock @saasfly/ui/button
vi.mock("@saasfly/ui/button", () => ({
  Button: ({
    children,
    variant,
    onClick,
    isLoading,
    className,
    ...props
  }: {
    children: React.ReactNode;
    variant?: string;
    onClick?: () => void;
    isLoading?: boolean;
    className?: string;
  }) => (
    <button
      data-variant={variant}
      data-loading={isLoading}
      onClick={onClick}
      className={className}
      data-testid="cluster-create-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock @saasfly/ui/icons
vi.mock("@saasfly/ui/icons", () => ({
  Add: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-add" className={(props as Record<string, string>)?.className} />
  ),
}));

// Mock @saasfly/ui/use-toast
vi.mock("@saasfly/ui/use-toast", () => ({
  toast: vi.fn(),
}));

// Mock ~/trpc/client
vi.mock("~/trpc/client", () => ({
  trpc: {
    k8s: {
      createCluster: {
        mutate: vi.fn(),
      },
    },
  },
}));

// Mock ~/config/k8s
vi.mock("~/config/k8s", () => ({
  DEFAULT_CLUSTER_CONFIG: {
    name: "my-cluster",
    location: "us-east",
  },
}));

const defaultDict = {
  k8s: {
    new_cluster: "New Cluster",
    errors: {
      create_failed_title: "Creation failed",
      create_failed_desc: "Please try again.",
      unexpected_error_title: "Error",
      unexpected_error_desc: "An unexpected error occurred.",
    },
  },
};

describe("K8sCreateButton", () => {
  it("renders the button with default text", () => {
    render(<K8sCreateButton dict={defaultDict} lang="en" />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("New Cluster")).toBeInTheDocument();
  });

  it("renders the Add icon when not loading", () => {
    render(<K8sCreateButton dict={defaultDict} lang="en" />);

    expect(screen.getByTestId("icon-add")).toBeInTheDocument();
  });

  it("sets loading state on button when isLoading is passed", () => {
    render(<K8sCreateButton dict={defaultDict} lang="en" />);

    // Button should not be loading initially
    expect(screen.getByTestId("cluster-create-button")).toHaveAttribute(
      "data-loading",
      "false",
    );
  });

  it("applies custom className", () => {
    const { container } = render(
      <K8sCreateButton dict={defaultDict} lang="en" className="custom-class" />,
    );

    const button = container.querySelector(".custom-class");
    expect(button).toBeInTheDocument();
  });

  it("renders with fallback text when dict is incomplete", () => {
    render(
      <K8sCreateButton
        dict={{ k8s: {} }}
        lang="en"
      />,
    );

    expect(screen.getByText("New Cluster")).toBeInTheDocument();
  });

  it("passes variant to the button", () => {
    render(
      <K8sCreateButton dict={defaultDict} lang="en" variant="outline" />,
    );

    expect(screen.getByTestId("cluster-create-button")).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });
});
