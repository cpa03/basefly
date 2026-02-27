import * as React from "react";

// @see https://usehooks.com/useLockBodyScroll.
export function useLockBody() {
  React.useEffect((): (() => void) => {
    // Guard against SSR - window/document may not exist during server rendering
    if (typeof window === "undefined" || typeof document === "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {};
    }

    const originalStyle: string = window.getComputedStyle(
      document.body,
    ).overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = originalStyle);
  }, []);
}
