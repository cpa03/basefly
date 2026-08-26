import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu Component", () => {
  it("should render the trigger and not the content when closed", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Open menu")).toBeInTheDocument();
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("should open the menu when the trigger is clicked", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.pointerDown(screen.getByText("Open menu"));
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("should apply base content classes", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = screen.getByRole("menu");
    expect(content).toHaveClass("z-50");
    expect(content).toHaveClass("min-w-[8rem]");
    expect(content).toHaveClass("rounded-md");
    expect(content).toHaveClass("border");
    expect(content).toHaveClass("bg-popover");
  });

  it("should apply custom className to the content", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-menu-class">
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("menu")).toHaveClass("custom-menu-class");
  });

  it("should render menu items with role menuitem and tactile scale classes", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const menuItem = screen.getByRole("menuitem", { name: "Profile" });
    expect(menuItem).toBeInTheDocument();
    expect(menuItem).toHaveClass("hover:scale-[1.01]");
    expect(menuItem).toHaveClass("active:scale-[0.99]");
  });

  it("should apply tactile scale classes to checkbox and radio items", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Show status
          </DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="free">
            <DropdownMenuRadioItem value="free">Free</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const checkboxItem = screen.getByRole("menuitemcheckbox", { name: "Show status" });
    const radioItem = screen.getByRole("menuitemradio", { name: "Free" });

    expect(checkboxItem).toHaveClass("hover:scale-[1.01]");
    expect(checkboxItem).toHaveClass("active:scale-[0.99]");
    expect(radioItem).toHaveClass("hover:scale-[1.01]");
    expect(radioItem).toHaveClass("active:scale-[0.99]");
  });

  it("should render a label and separator", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Account")).toBeInTheDocument();
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("should render a shortcut", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("⌘C")).toBeInTheDocument();
  });

  it("should render a checkbox item with role menuitemcheckbox", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Show status
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Show status" }),
    ).toBeInTheDocument();
  });

  it("should render radio items within a radio group", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="free">
            <DropdownMenuRadioItem value="free">Free</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="pro">Pro</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(
      screen.getByRole("menuitemradio", { name: "Free" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: "Pro" }),
    ).toBeInTheDocument();
  });
});
