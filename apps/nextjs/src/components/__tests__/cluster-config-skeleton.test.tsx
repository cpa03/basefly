import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ClusterConfigSkeleton } from "../k8s/cluster-config-skeleton";

describe("ClusterConfigSkeleton", () => {
  it("renders a loading container with aria-busy set", () => {
    const { container } = render(<ClusterConfigSkeleton />);

    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).toBeInTheDocument();
  });

  it("exposes an accessible loading label", () => {
    render(<ClusterConfigSkeleton />);

    expect(
      screen.getByLabelText("Loading cluster configuration"),
    ).toBeInTheDocument();
  });

  it("renders skeleton placeholders for the form fields", () => {
    const { container } = render(<ClusterConfigSkeleton />);

    const skeletonDivs = container.querySelectorAll("div");
    expect(skeletonDivs.length).toBeGreaterThan(0);
  });

  it("renders a submit button placeholder", () => {
    const { container } = render(<ClusterConfigSkeleton />);

    const busy = container.querySelector("[aria-busy='true']");
    expect(busy).not.toBeNull();
    const placeholders = busy!.querySelectorAll("div");
    expect(placeholders.length).toBeGreaterThanOrEqual(10);
  });
});