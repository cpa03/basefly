import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

describe("Command Component", () => {
  it("should render children inside the command root", () => {
    render(<Command>Command content</Command>);
    expect(screen.getByText("Command content")).toBeInTheDocument();
  });

  it("should apply base root classes", () => {
    const { container } = render(<Command>Content</Command>);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("flex");
    expect(root).toHaveClass("h-full");
    expect(root).toHaveClass("w-full");
    expect(root).toHaveClass("overflow-hidden");
    expect(root).toHaveClass("rounded-md");
  });

  it("should apply custom className to the root", () => {
    const { container } = render(
      <Command className="custom-command">Content</Command>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass("custom-command");
  });

  it("should render the input with a search icon", () => {
    render(
      <Command>
        <CommandInput placeholder="Search..." />
      </Command>,
    );
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("should render items and groups", () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem>Create cluster</CommandItem>
            <CommandItem>View billing</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText("Create cluster")).toBeInTheDocument();
    expect(screen.getByText("View billing")).toBeInTheDocument();
  });

  it("should render the empty state", () => {
    render(
      <Command>
        <CommandEmpty>No results found</CommandEmpty>
      </Command>,
    );
    const empty = document.querySelector("[cmdk-empty]");
    expect(empty).not.toBeNull();
    expect(empty).toHaveTextContent("No results found");
  });

  it("should render a separator", () => {
    const { container } = render(
      <Command>
        <CommandSeparator />
      </Command>,
    );
    const separator = container.querySelector("[cmdk-separator]");
    expect(separator).not.toBeNull();
  });

  it("should render the shortcut", () => {
    render(<CommandShortcut>⌘K</CommandShortcut>);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });
});
