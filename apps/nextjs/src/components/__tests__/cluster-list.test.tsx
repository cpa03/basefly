import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ClusterList } from "../dashboard/cluster-list";
import type { Cluster } from "~/types/k8s";

// Mock tRPC server module
const mockGetClusters = vi.fn();
vi.mock("~/trpc/server", () => ({
  trpc: {
    k8s: {
      getClusters: (...args: unknown[]) => mockGetClusters(...args),
    },
  },
}));

// Mock sub-components used in ClusterList
vi.mock("../empty-placeholder", () => ({
  EmptyPlaceholder: Object.assign(
    ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div role="status" data-testid="empty-placeholder" {...props}>
        <div>{children}</div>
      </div>
    ),
    {
      Icon: ({ name }: { name: string }) => (
        <span data-testid="empty-placeholder-icon" data-icon-name={name} />
      ),
      Title: ({ children }: { children: React.ReactNode }) => (
        <h2 data-testid="empty-placeholder-title">{children}</h2>
      ),
      Description: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p data-testid="empty-placeholder-description" {...props} />
      ),
    },
  ),
}));

vi.mock("../k8s/cluster-create-button", () => ({
  K8sCreateButton: ({
    variant,
    dict,
    lang,
  }: {
    variant?: string;
    dict: Record<string, unknown>;
    lang: string;
  }) => (
    <button
      data-testid="k8s-create-button"
      data-variant={variant}
      data-lang={lang}
    >
      {(dict.k8s as Record<string, string>)?.new_cluster ?? "New Cluster"}
    </button>
  ),
}));

vi.mock("../k8s/cluster-item", () => ({
  ClusterItem: ({
    cluster,
    lang,
  }: {
    cluster: { id: number; name: string };
    lang: string;
  }) => (
    <tr data-testid="cluster-item" data-cluster-id={cluster.id} data-lang={lang}>
      <td>{cluster.name}</td>
    </tr>
  ),
}));

vi.mock("../k8s/cluster-operation", () => ({
  ClusterOperations: ({
    cluster,
    lang,
  }: {
    cluster: { id: number; name: string };
    lang: string;
  }) => (
    <div
      data-testid="cluster-operations"
      data-cluster-id={cluster.id}
      data-lang={lang}
    >
      Actions
    </div>
  ),
}));

// Mock @saasfly/ui/table
vi.mock("@saasfly/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
  TableHead: ({
    children,
    scope,
    className,
  }: {
    children: React.ReactNode;
    scope?: string;
    className?: string;
  }) => (
    <th scope={scope} className={className}>
      {children}
    </th>
  ),
  TableCaption: ({ children }: { children: React.ReactNode }) => (
    <caption>{children}</caption>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <td className={className}>{children}</td>,
}));

// Mock @saasfly/ui/status-badge (for mobile card view)
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

// Mock ~/lib/utils
vi.mock("~/lib/utils", () => ({
  formatDate: (date: Date) => `Formatted: ${date.toISOString()}`,
}));

// Helper: create mock cluster
const createMockCluster = (overrides: Partial<Cluster> = {}): Cluster => ({
  id: 1,
  name: "test-cluster",
  status: "RUNNING",
  location: "us-east-1",
  authUserId: "user_123",
  plan: "PRO",
  network: null,
  createdAt: new Date("2026-06-01T10:00:00Z"),
  updatedAt: new Date("2026-06-15T10:00:00Z"),
  delete: false,
  ...overrides,
});

// Mock BusinessDictionary
const createMockDict = () => ({
  common: {
    dashboard: {
      table_caption: "List of your clusters",
      col_name: "Name",
      col_location: "Location",
      col_updated_at: "Last Updated",
      col_plan: "Plan",
      col_status: "Status",
      col_actions: "Actions",
      label_plan: "Plan",
      label_status: "Status",
      label_updated: "Updated",
    },
  },
  k8s: {
    no_cluster_title: "No clusters created",
    no_cluster_content: "You haven't created any clusters yet. Get started by creating your first cluster.",
    new_cluster: "New Cluster",
  },
});

describe("ClusterList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("empty state", () => {
    it("renders EmptyPlaceholder when no clusters exist", async () => {
      mockGetClusters.mockResolvedValue([]);

      const Component = await ClusterList({
        lang: "en",
        dict: createMockDict(),
      });
      render(Component);

      expect(screen.getByTestId("empty-placeholder")).toBeInTheDocument();
      expect(screen.getByTestId("empty-placeholder-icon")).toHaveAttribute(
        "data-icon-name",
        "Cluster",
      );
      expect(screen.getByTestId("empty-placeholder-title")).toHaveTextContent(
        "No clusters created",
      );
      expect(
        screen.getByTestId("empty-placeholder-description"),
      ).toHaveTextContent(
        "You haven't created any clusters yet.",
      );
    });

    it("renders K8sCreateButton in empty state", async () => {
      mockGetClusters.mockResolvedValue([]);

      const Component = await ClusterList({
        lang: "en",
        dict: createMockDict(),
      });
      render(Component);

      const createButton = screen.getByTestId("k8s-create-button");
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveAttribute("data-variant", "outline");
      expect(createButton).toHaveAttribute("data-lang", "en");
      expect(createButton).toHaveTextContent("New Cluster");
    });

    it("passes dict and lang correctly to K8sCreateButton", async () => {
      const dict = createMockDict();
      dict.k8s.new_cluster = "Create Cluster";
      mockGetClusters.mockResolvedValue([]);

      const Component = await ClusterList({
        lang: "fr",
        dict,
      });
      render(Component);

      const createButton = screen.getByTestId("k8s-create-button");
      expect(createButton).toHaveTextContent("Create Cluster");
      expect(createButton).toHaveAttribute("data-lang", "fr");
    });
  });

  describe("populated state", () => {
    const mockClusters: Cluster[] = [
      createMockCluster({
        id: 1,
        name: "prod-cluster",
        location: "us-east-1",
        plan: "PRO",
        status: "RUNNING",
      }),
      createMockCluster({
        id: 2,
        name: "dev-cluster",
        location: "eu-west-1",
        plan: "FREE",
        status: "STOPPED",
      }),
    ];

    it("renders table with correct headers", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const dict = createMockDict();
      const Component = await ClusterList({ lang: "en", dict });
      render(Component);

      const table = screen.getByTestId("table");

      expect(table).toBeInTheDocument();

      expect(screen.getByText("List of your clusters")).toBeInTheDocument();

      expect(within(table).getByText("Name")).toBeInTheDocument();
      expect(within(table).getByText("Location")).toBeInTheDocument();
      expect(within(table).getByText("Last Updated")).toBeInTheDocument();
      expect(within(table).getByText("Plan")).toBeInTheDocument();
      expect(within(table).getByText("Status")).toBeInTheDocument();
      expect(within(table).getByText("Actions")).toBeInTheDocument();
    });

    it("renders ClusterItem for each cluster", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      const items = screen.getAllByTestId("cluster-item");
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveAttribute("data-cluster-id", "1");
      expect(items[1]).toHaveAttribute("data-cluster-id", "2");
    });

    it("passes lang to each ClusterItem", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "de", dict: createMockDict() });
      render(Component);

      const items = screen.getAllByTestId("cluster-item");
      items.forEach((item) => {
        expect(item).toHaveAttribute("data-lang", "de");
      });
    });

    it("renders mobile card view for each cluster", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      const articles = document.querySelectorAll("article");
      expect(articles).toHaveLength(2);

      expect(articles[0]).toHaveTextContent("prod-cluster");
      expect(articles[0]).toHaveTextContent("us-east-1");

      expect(articles[1]).toHaveTextContent("dev-cluster");
      expect(articles[1]).toHaveTextContent("eu-west-1");
    });

    it("renders cluster names as links in mobile view", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      const links = document.querySelectorAll("article a");
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute("href", "/en/editor/cluster/1");
      expect(links[1]).toHaveAttribute("href", "/en/editor/cluster/2");
    });

    it("renders StatusBadge for each cluster in mobile view", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      const badges = screen.getAllByTestId("status-badge");
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveAttribute("data-status", "RUNNING");
      expect(badges[1]).toHaveAttribute("data-status", "STOPPED");
    });

    it("renders ClusterOperations for each cluster in mobile view", async () => {
      mockGetClusters.mockResolvedValue(mockClusters);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      const ops = screen.getAllByTestId("cluster-operations");
      expect(ops).toHaveLength(2);
      expect(ops[0]).toHaveAttribute("data-cluster-id", "1");
      expect(ops[1]).toHaveAttribute("data-cluster-id", "2");
    });

    it("shows dash for null status in mobile view", async () => {
      const clustersWithNullStatus: Cluster[] = [
        createMockCluster({ id: 1, name: "pending-cluster", status: null }),
      ];
      mockGetClusters.mockResolvedValue(clustersWithNullStatus);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      expect(screen.queryByTestId("status-badge")).not.toBeInTheDocument();
      expect(screen.getByText("-")).toBeInTheDocument();
    });

    it("handles undefined clusters gracefully", async () => {
      mockGetClusters.mockResolvedValue(undefined);

      const Component = await ClusterList({ lang: "en", dict: createMockDict() });
      render(Component);

      expect(screen.getByTestId("empty-placeholder")).toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("renders empty state when tRPC call rejects", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockGetClusters.mockRejectedValue(new Error("tRPC error"));

      await expect(
        ClusterList({ lang: "en", dict: createMockDict() }),
      ).rejects.toThrow("tRPC error");

      consoleErrorSpy.mockRestore();
    });
  });
});
