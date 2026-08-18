import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs Component", () => {
  it("should render tabs list with triggers", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="usage">Usage content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Usage" })).toBeInTheDocument();
  });

  it("should render the active tab content by default", () => {
    render(
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="usage">Usage content</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.queryByText("Usage content")).not.toBeInTheDocument();
  });

  it("should mark the active trigger with data-state=active", () => {
    render(
      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview content</TabsContent>
        <TabsContent value="usage">Usage content</TabsContent>
      </Tabs>,
    );
    const usageTab = screen.getByRole("tab", { name: "Usage" });
    const overviewTab = screen.getByRole("tab", { name: "Overview" });
    expect(usageTab).toHaveAttribute("data-state", "active");
    expect(overviewTab).toHaveAttribute("data-state", "inactive");
  });

  it("should apply base list classes", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const list = container.querySelector('[role="tablist"]');
    expect(list).toHaveClass("inline-flex");
    expect(list).toHaveClass("h-10");
    expect(list).toHaveClass("rounded-md");
    expect(list).toHaveClass("bg-muted");
  });

  it("should apply active styles to the active trigger", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const trigger = container.querySelector(
      '[role="tab"][data-state="active"]',
    );
    expect(trigger).toHaveClass("data-[state=active]:bg-background");
    expect(trigger).toHaveClass("data-[state=active]:text-foreground");
  });

  it("should apply content base classes", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const content = container.querySelector('[role="tabpanel"]');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass("mt-2");
  });

  it("should apply custom className to list, trigger, and content", () => {
    const { container } = render(
      <Tabs defaultValue="a">
        <TabsList className="custom-list">
          <TabsTrigger value="a" className="custom-trigger">
            A
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a" className="custom-content">
          A content
        </TabsContent>
      </Tabs>,
    );
    expect(container.querySelector('[role="tablist"]')).toHaveClass(
      "custom-list",
    );
    expect(container.querySelector('[role="tab"]')).toHaveClass(
      "custom-trigger",
    );
    expect(container.querySelector('[role="tabpanel"]')).toHaveClass(
      "custom-content",
    );
  });

  it("should disable a trigger when disabled prop is set", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b" disabled>
            B
          </TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
        <TabsContent value="b">B content</TabsContent>
      </Tabs>,
    );
    const disabledTab = screen.getByRole("tab", { name: "B" });
    expect(disabledTab).toBeDisabled();
  });

  it("should apply tactile spring micro-interaction transition scale classes to trigger", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
        <TabsContent value="a">A content</TabsContent>
      </Tabs>,
    );
    const trigger = screen.getByRole("tab", { name: "A" });
    expect(trigger).toHaveClass("hover:scale-[1.01]");
    expect(trigger).toHaveClass("active:scale-[0.99]");
  });
});
