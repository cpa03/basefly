"use client";

import { FEEDBACK_TIMING } from "@saasfly/common";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";
import { useToast } from "./use-toast";

/**
 * Toaster - Accessible toast notification container
 *
 * Renders toast notifications with proper accessibility support:
 * - Screen reader announcements via aria-live regions (handled by Radix)
 * - Keyboard dismissible (Escape key)
 * - Auto-dismiss after configurable duration
 * - Swipe-to-dismiss on mobile
 */
export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider
      // Accessible label for screen readers describing notification type
      label="Notifications"
      // Auto-dismiss duration (can be overridden per-toast)
      duration={FEEDBACK_TIMING.toastDisplay}
      // Prevent focus from moving to toast when it appears
      // This keeps the user's focus where it was
      focusOnOpen={false}
    >
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
