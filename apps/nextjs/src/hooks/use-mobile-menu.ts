"use client";

import * as React from "react";

interface UseMobileMenuOptions {
  /**
   * Callback fired when mobile menu closes
   */
  onClose?: () => void;
}

interface UseMobileMenuReturn {
  /**
   * Whether the mobile menu is currently open
   */
  isOpen: boolean;
  /**
   * Toggle the mobile menu open/closed
   */
  toggle: () => void;
  /**
   * Open the mobile menu
   */
  open: () => void;
  /**
   * Close the mobile menu
   */
  close: () => void;
}

/**
 * Shared hook for managing mobile navigation menu state.
 * 
 * Provides consistent mobile menu behavior across MainNav and MobileNav components.
 * Handles state management, keyboard navigation (Escape to close), and focus management.
 * 
 * @example
 * ```tsx
 * const { isOpen, toggle, open, close } = useMobileMenu();
 * ```
 */
export function useMobileMenu(options: UseMobileMenuOptions = {}): UseMobileMenuReturn {
  const { onClose } = options;
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = React.useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  // Handle Escape key to close menu
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  // Focus management: move focus to first menu item when mobile menu opens
  React.useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const firstLink = document.querySelector<HTMLAnchorElement>(
        "#mobile-navigation a, #mobile-navigation button"
      );
      firstLink?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
  };
}
