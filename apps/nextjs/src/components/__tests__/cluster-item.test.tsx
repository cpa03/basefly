import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ClusterItem } from "../k8s/cluster-item";

// Mock @saasfly/ui/status-badge
vi.mock("@saasfly/ui/status-badge", () => ({
  StatusBadge: ({
    status,
    size,
  }: {
    status: string;
    size?: string;
  }) => (
    <span data-testid="status-badge" data-status={status} data-size={size}>
      {status}
    </span>
  ),
}));

// Mock @saasfly/ui/table
vi.mock("@saasfly/ui/table", () => ({
  TableRow: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <tr className={className}>{children}</tr>,
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <td className={className}>{children}</td>,
}));

// Mock @saasfly/ui/tooltip
vi.mock("@saasfly/ui/tooltip", () => ({
  TooltipProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip">{children}</div>
  ),
  TooltipTrigger: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="tooltip-trigger">{children}</div>,
  TooltipContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="tooltip-content" className={className}>
      {children}
    </div>
  ),
}));

// Mock @saasfly/common for ANIMATION and FEEDBACK_TIMING constants
vi.mock("@saasfly/common", () => ({
  ANIMATION: {
    duration: {
      fast: "duration-200",
    },
    easing: {
      default: "ease-in-out",
    },
  },
  FEEDBACK_TIMING: {
    tooltipDelay: 0,
  },
  LOCATION_BADGE_TOKENS: {
    container: "mock-location-badge-container",
  },
}));

vi.mock("@saasfly/common/config/ui", () => ({
  FEEDBACK_TIMING: {
    tooltipDelay: 0,
  },
}));

// Mock ~/components/k8s/cluster-operation
vi.mock("~/components/k8s/cluster-operation", () => ({
  ClusterOperations: ({
    cluster,
    lang,
  }: {
    cluster: { id: number; name: string };
    lang: string;
  }) => (
    <div data-testid="cluster-operations" data-cluster-id={cluster.id} data-lang={lang}>
      Cluster Operations
    </div>
  ),
}));

// Mock ~/lib/utils
vi.mock("~/lib/utils", () => ({
  formatDate: (date: Date) => `Formatted: ${date.toISOString()}`,
}));

// Mock next/link (already in setup, but override for explicit href check)
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

const mockCluster: {
  id: number;
  name: string;
  location: string;
  plan: "PRO" | null;
  status: "RUNNING";
  updatedAt: Date;
} = {
  id: 42,
  name: "production-cluster",
  location: "us-east-1",
  plan: "PRO",
  status: "RUNNING",
  updatedAt: new Date("2026-06-01T10:00:00Z"),
};

describe("ClusterItem", () => {
  const renderWithTable = (ui: React.ReactElement) => {
    return render(
      <table>
        <tbody>{ui}</tbody>
      </table>,
    );
  };

  it("renders cluster name as a link", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    // Cluster name appears both in the link and tooltip — use getAllByText
    const nameLinks = screen.getAllByText("production-cluster");
    expect(nameLinks.length).toBeGreaterThanOrEqual(2);

    // The link should have the correct href
    const anchor = nameLinks.find((el) => el.closest("a"));
    expect(anchor?.closest("a")).toHaveAttribute(
      "href",
      "/en/editor/cluster/42",
    );
  });

  it("renders cluster location", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    expect(screen.getByText("us-east-1")).toBeInTheDocument();
  });

  it("renders cluster plan", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    expect(screen.getByText("PRO")).toBeInTheDocument();
  });

  it("renders cluster status badge", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute("data-status", "RUNNING");
  });

  it("renders formatted updated date", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    expect(screen.getByText(/Formatted:/)).toBeInTheDocument();
  });

  it("renders ClusterOperations component", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    const ops = screen.getByTestId("cluster-operations");
    expect(ops).toBeInTheDocument();
    expect(ops).toHaveAttribute("data-cluster-id", "42");
    expect(ops).toHaveAttribute("data-lang", "en");
  });

  it("renders tooltip with cluster info", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    expect(screen.getByTestId("tooltip-provider")).toBeInTheDocument();
    expect(screen.getByText("Click to edit cluster")).toBeInTheDocument();
  });

  it("shows fallback for missing plan", () => {
    const clusterWithoutPlan = { ...mockCluster, plan: null };
    renderWithTable(<ClusterItem cluster={clusterWithoutPlan} lang="en" />);

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("shows fallback for missing status", () => {
    const clusterWithoutStatus = { ...mockCluster, status: null };
    renderWithTable(<ClusterItem cluster={clusterWithoutStatus} lang="en" />);

    // Should render "-" instead of status badge
    expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
  });

  it("renders time element with datetime attribute", () => {
    renderWithTable(<ClusterItem cluster={mockCluster} lang="en" />);

    const time = screen.getByText(/Formatted:/).closest("time");
    // happy-dom formats dates differently than real browsers
    expect(time).toHaveAttribute("dateTime");
    expect(time?.getAttribute("dateTime")).toBeTruthy();
  });
});
