import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KEYBOARD_SHORTCUTS_TOKENS } from "@saasfly/common";

import { KeyboardShortcutsHelp } from "../keyboard-shortcuts-help";

describe("KeyboardShortcutsHelp", () => {
  it("renders overlay when '?' key is pressed", () => {
    render(<KeyboardShortcutsHelp />);

    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });

    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();
    expect(
      screen.getByText("Press any of the following keys to quickly navigate and interact with the app."),
    ).toBeInTheDocument();
  });

  it("closes overlay when Escape key is pressed", () => {
    render(<KeyboardShortcutsHelp />);

    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });

    expect(screen.getByText("Keyboard Shortcuts")).toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("does not trigger when typing inside input elements", () => {
    render(
      <div>
        <input data-testid="text-input" />
        <KeyboardShortcutsHelp />
      </div>,
    );

    const input = screen.getByTestId("text-input");
    act(() => {
      fireEvent.keyDown(input, { key: "?" });
    });

    expect(screen.queryByText("Keyboard Shortcuts")).not.toBeInTheDocument();
  });

  it("references KEYBOARD_SHORTCUTS_TOKENS classes and micro-UX scale transitions", () => {
    render(<KeyboardShortcutsHelp />);

    act(() => {
      fireEvent.keyDown(window, { key: "?" });
    });

    const categoryHeading = screen.getByText("Navigation");
    expect(categoryHeading.className).toContain(
      KEYBOARD_SHORTCUTS_TOKENS.categoryTitle,
    );

    const shortcutDescription = screen.getByText("Show keyboard shortcuts");
    const shortcutItemContainer = shortcutDescription.parentElement;
    expect(shortcutItemContainer?.className).toContain(
      "hover:scale-[1.01]",
    );
    expect(shortcutItemContainer?.className).toContain(
      "active:scale-[0.99]",
    );

    const kbdElement = screen.getAllByText("Ctrl")[0];
    expect(kbdElement?.className).toContain("active:scale-95");
    expect(kbdElement?.className).toContain("focus-visible:ring-2");
  });
});
