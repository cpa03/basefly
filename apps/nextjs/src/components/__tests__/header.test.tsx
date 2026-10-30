import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardHeader } from "../header";

describe("DashboardHeader Component", () => {
  it("renders heading correctly", () => {
    render(<DashboardHeader heading="Dashboard Overview" />);
    expect(screen.getByRole("heading", { name: "Dashboard Overview" })).toBeInTheDocument();
  });

  it("renders subtext when provided", () => {
    render(
      <DashboardHeader
        heading="Settings"
        text="Manage your account preferences"
      />,
    );
    expect(screen.getByText("Manage your account preferences")).toBeInTheDocument();
  });

  it("renders children action elements when provided", () => {
    render(
      <DashboardHeader heading="Projects">
        <button>Create New Project</button>
      </DashboardHeader>,
    );
    expect(screen.getByRole("button", { name: "Create New Project" })).toBeInTheDocument();
  });

  it("supports landmark role and accessible aria-label attributes", () => {
    render(<DashboardHeader heading="Analytics" />);
    const headerElement = screen.getByRole("banner");
    expect(headerElement).toHaveAttribute("aria-label", "Dashboard header");
  });
});
