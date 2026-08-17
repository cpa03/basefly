import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClusterConfig } from "../k8s/cluster-config";

const { trpcMock, toastMock } = vi.hoisted(() => ({
  trpcMock: {
    k8s: {
      updateCluster: {
        mutate: vi.fn(),
      },
    },
  },
  toastMock: vi.fn(),
}));

// Mock @saasfly/common constants used by the form schema and labels
vi.mock("@saasfly/common", () => ({
  CLUSTER_VALIDATION: {
    displayName: { minLength: 2, maxLength: 32 },
  },
  FORM_DESCRIPTIONS: {
    createCluster: "Deploy your new k8s cluster in one-click.",
    editCluster: "Update your existing k8s cluster configuration.",
  },
  FORM_LABELS: {
    name: "Name",
    region: "Region",
    submit: "Submit",
  },
  PLACEHOLDER_TEXT: {
    clusterName: "Enter cluster name",
    selectRegion: "Select region",
  },
  TOAST_MESSAGES: {
    error: {
      somethingWentWrong: "Something went wrong.",
      clusterNotSaved: "Your cluster was not saved.",
    },
    success: {
      clusterSaved: "Cluster saved successfully.",
    },
  },
}));

// Mock ~/config/k8s - cluster location constants
vi.mock("~/config/k8s", () => ({
  CLUSTER_LOCATIONS: ["China", "Hong Kong", "Singapore", "Tokyo", "US-West"],
  isValidClusterLocation: (location: string) =>
    ["China", "Hong Kong", "Singapore", "Tokyo", "US-West"].includes(location),
}));

// Mock ~/trpc/client - update cluster mutation
vi.mock("~/trpc/client", () => ({
  trpc: trpcMock,
}));

// Mock @saasfly/ui/button
vi.mock("@saasfly/ui/button", () => ({
  Button: ({
    children,
    type,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    type?: string;
    disabled?: boolean;
    className?: string;
  }) => (
    <button type={type} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// Mock @saasfly/ui/card
vi.mock("@saasfly/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-title">{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-footer">{children}</div>
  ),
}));

// Mock @saasfly/ui/form - use the real react-hook-form provider/controller
vi.mock("@saasfly/ui/form", async () => {
  const { Controller, FormProvider } = await import("react-hook-form");
  return {
    Form: FormProvider,
    FormField: Controller,
    FormItem: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="form-item">{children}</div>
    ),
    FormLabel: ({ children }: { children: React.ReactNode }) => (
      <label>{children}</label>
    ),
    FormControl: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="form-control">{children}</div>
    ),
    FormMessage: () => null,
  };
});

// Mock @saasfly/ui/icons
vi.mock("@saasfly/ui/icons", () => ({
  Spinner: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      data-testid="icon-spinner"
      className={(props as Record<string, string>)?.className}
    />
  ),
}));

// Mock @saasfly/ui/input - real input so form values can be changed
vi.mock("@saasfly/ui/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}));

// Mock @saasfly/ui/label
vi.mock("@saasfly/ui/label", () => ({
  Label: ({
    children,
    htmlFor,
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label htmlFor={htmlFor}>{children}</label>,
}));

// Mock @saasfly/ui/select (Radix-based)
vi.mock("@saasfly/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
  }) => (
    <select
      data-testid="select"
      value={value}
      onChange={(event) => onValueChange?.(event.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <option value="">{placeholder}</option>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectLabel: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
}));

// Mock @saasfly/ui/tabs (Radix-based)
vi.mock("@saasfly/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs">{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="tabs-trigger">{children}</button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-content">{children}</div>
  ),
}));

// Mock @saasfly/ui/use-toast
vi.mock("@saasfly/ui/use-toast", () => ({
  toast: toastMock,
}));

const mockCluster = {
  id: 1,
  name: "test-cluster",
  location: "US-West" as const,
};

describe("ClusterConfig", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the edit cluster card title and description", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    expect(screen.getByText("Edit cluster")).toBeInTheDocument();
    expect(
      screen.getByText("Update your existing k8s cluster configuration."),
    ).toBeInTheDocument();
  });

  it("pre-fills the cluster name from the cluster prop", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    const nameInput = screen.getByDisplayValue("test-cluster");
    expect(nameInput).toBeInTheDocument();
  });

  it("renders the Name and Region form labels", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Region")).toBeInTheDocument();
  });

  it("renders all cluster location options", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    const select = screen.getByTestId("select");
    expect(select).toBeInTheDocument();
    ["China", "Hong Kong", "Singapore", "Tokyo", "US-West"].forEach(
      (location) => {
        expect(screen.getByText(location)).toBeInTheDocument();
      },
    );
  });

  it("renders the Marketplace tabs", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("CI/CD")).toBeInTheDocument();
    expect(screen.getByText("Monitoring")).toBeInTheDocument();
  });

  it("renders the submit button with the submit label", () => {
    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("calls updateCluster mutation and shows success toast on valid submit", async () => {
    const mutateMock = vi.mocked(trpcMock.k8s.updateCluster.mutate);
    mutateMock.mockResolvedValue({ success: true });

    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        id: 1,
        name: "test-cluster",
        location: "US-West",
      });
    });
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        description: "Cluster saved successfully.",
      });
    });
  });

  it("shows error toast when updateCluster returns failure", async () => {
    const mutateMock = vi.mocked(trpcMock.k8s.updateCluster.mutate);
    mutateMock.mockResolvedValue({ success: false });

    render(<ClusterConfig cluster={mockCluster} params={{ lang: "en" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: "Something went wrong.",
        description: "Your cluster was not saved.",
        variant: "destructive",
      });
    });
  });
});
