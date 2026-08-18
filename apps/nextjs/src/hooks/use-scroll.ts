import { useCallback, useSyncExternalStore } from "react";

export default function useScroll(threshold: number) {
  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") {
      return () => undefined;
    }

    window.addEventListener("scroll", callback, { passive: true });
    return () => window.removeEventListener("scroll", callback);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.scrollY > threshold;
  }, [threshold]);

  return useSyncExternalStore(subscribe, getSnapshot);
}
