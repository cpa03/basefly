"use client";

import * as React from "react";

import { ANIMATION } from "@saasfly/common";

interface NetworkStatus {
  /** Whether the browser is online */
  isOnline: boolean;
  /** Whether the connection has been checked (avoids initial false offline state) */
  isReady: boolean;
  /** Time when the connection status last changed */
  lastChanged: Date | null;
  /** The type of connection (wifi, 4g, etc.) if available */
  connectionType: string | null;
  /** Estimated effective bandwidth in Mbps if available */
  downlink: number | null;
  /** Estimated round-trip time in ms if available */
  rtt: number | null;
  /** Whether the connection is considered slow */
  isSlowConnection: boolean;
}

interface UseNetworkStatusReturn extends NetworkStatus {
  /** Force a connection check */
  checkConnection: () => Promise<boolean>;
}

/**
 * Hook for monitoring network connection status with enhanced features.
 *
 * Features:
 * - Detects online/offline state changes
 * - Provides connection type information (if supported by browser)
 * - Detects slow connections
 * - Handles initial state hydration safely
 * - Allows manual connection checks
 *
 * @example
 * ```tsx
 * const { isOnline, isReady, checkConnection } = useNetworkStatus();
 *
 * if (!isReady) return null;
 *
 * return (
 *   <div>
 *     {isOnline ? "Connected" : "Offline"}
 *     <button onClick={checkConnection}>Check connection</button>
 *   </div>
 * );
 * ```
 */
export function useNetworkStatus(): UseNetworkStatusReturn {
  const [status, setStatus] = React.useState<NetworkStatus>({
    isOnline: true,
    isReady: false,
    lastChanged: null,
    connectionType: null,
    downlink: null,
    rtt: null,
    isSlowConnection: false,
  });

  // Get connection info from Network Information API if available
  const getConnectionInfo = React.useCallback(() => {
    if (typeof navigator === "undefined") {
      return {
        connectionType: null,
        downlink: null,
        rtt: null,
        isSlowConnection: false,
      };
    }

    // Network Information API is not fully typed in TypeScript DOM lib
    interface NetworkInformation {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      type?: string;
      addEventListener?: (type: string, listener: () => void) => void;
      removeEventListener?: (type: string, listener: () => void) => void;
    }

    interface NavigatorWithConnection extends Navigator {
      connection?: NetworkInformation;
    }

    const connection = (navigator as NavigatorWithConnection).connection;

    if (!connection) {
      return {
        connectionType: null,
        downlink: null,
        rtt: null,
        isSlowConnection: false,
      };
    }

    const effectiveType = connection.effectiveType;
    const downlink = connection.downlink;
    const rtt = connection.rtt;

    // Consider slow if on 2g or slower, or if RTT is high
    const isSlowConnection =
      effectiveType === "2g" ||
      effectiveType === "slow-2g" ||
      (typeof rtt === "number" && rtt > 500);

    return {
      connectionType: effectiveType ?? connection.type ?? null,
      downlink,
      rtt,
      isSlowConnection,
    };
  }, []);

  // Check actual connection by pinging
  const checkConnection = React.useCallback(async (): Promise<boolean> => {
    try {
      // Try to fetch a tiny resource to verify actual connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const isOnline = response.ok;

      setStatus((prev) => ({
        ...prev,
        isOnline,
        isReady: true,
        lastChanged: new Date(),
      }));

      return isOnline;
    } catch {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        isReady: true,
        lastChanged: new Date(),
      }));
      return false;
    }
  }, []);

  React.useEffect(() => {
    // Guard against SSR
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: true,
        lastChanged: new Date(),
        ...getConnectionInfo(),
      }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({
        ...prev,
        isOnline: false,
        lastChanged: new Date(),
      }));
    };

    // Set initial state
    setStatus({
      isOnline: navigator.onLine,
      isReady: true,
      lastChanged: new Date(),
      ...getConnectionInfo(),
    });

    // Listen for network status changes
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [getConnectionInfo]);

  return {
    ...status,
    checkConnection,
  };
}

/**
 * CSS class constants for connection status styling
 * Used to maintain consistency across connection-related components
 */
export const CONNECTION_STYLES = {
  /** Container styles for the status indicator */
  container: {
    base: "fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm",
    online:
      "border-green-200 bg-green-50/90 text-green-800 dark:border-green-800 dark:bg-green-950/90 dark:text-green-200",
    offline:
      "border-red-200 bg-red-50/90 text-red-800 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200",
    slow: "border-amber-200 bg-amber-50/90 text-amber-800 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-200",
  },
  /** Icon styles */
  icon: {
    online: "text-green-600 dark:text-green-400",
    offline: "text-red-600 dark:text-red-400",
    slow: "text-amber-600 dark:text-amber-400",
  },
  /** Animation classes */
  animation: {
    enter: `animate-in slide-in-from-bottom-5 fade-in ${ANIMATION.duration.medium} ${ANIMATION.easing.default}`,
    exit: `animate-out slide-out-to-bottom-5 fade-out ${ANIMATION.duration.medium} ${ANIMATION.easing.default}`,
  },
} as const;

export type { NetworkStatus, UseNetworkStatusReturn };
