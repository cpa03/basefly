import { useCallback, useEffect, useState } from "react";

export default function useScroll(threshold: number) {
  const [scrolled, setScrolled] = useState(false);

  const onScroll = useCallback(() => {
    // Guard against SSR - window may not exist during server rendering
    if (typeof window === "undefined") {
      return;
    }
    setScrolled(window.pageYOffset > threshold);
  }, [threshold]);

  useEffect(() => {
    // Guard against SSR - window may not exist during server rendering
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return scrolled;
}
