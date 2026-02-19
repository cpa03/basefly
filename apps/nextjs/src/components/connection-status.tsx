"use client";

import * as React from "react";
import { Wifi, WifiOff, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { ANIMATION } from "@saasfly/common";
import { cn } from "@saasfly/ui";
import { Button } from "@saasfly/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@saasfly/ui/tooltip";

import {
  useNetworkStatus,
  CONNECTION_STYLES,
} from "~/hooks/use-network-status";

interface ConnectionStatusProps {
  /**
   * Position of the indicator on screen
   * @default "bottom-left"
   */
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
  /**
   * Whether to show the retry button when offline
   * @default true
   */
  showRetry?: boolean;
  /**
   * Callback when connection is restored
   */
  onReconnect?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ConnectionStatus - A micro-UX component for network connectivity feedback
 *
 * Provides real-time visual feedback about the user's network connection status.
 * Shows a subtle indicator when online, and a prominent alert when offline with
 * a retry mechanism.
 *
 * Micro-UX Improvements:
 * - Smooth slide-in/slide-out animations with reduced motion support
 * - Color-coded states (green=online, red=offline, amber=slow)
 * - Retry button with loading state for manual reconnection attempts
 * - Tooltip with detailed connection info
 * - Auto-hides online status after 3 seconds (stays visible when offline)
 * - Connection type detection (wifi, 4g, etc.) when available
 * - Slow connection warnings for better performance awareness
 *
 * @example
 * ```tsx
 * // Basic usage - shows in bottom-left corner
 * <ConnectionStatus />
 *
 * // Custom position with callback
 * <ConnectionStatus
 *   position="top-right"
 *   onReconnect={() => toast({ title: "Back online!" })}
 * />
 *
 * // In your root layout for global visibility
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {children}
 *       <ConnectionStatus />
 *     </>
 *   );
 * }
 * ```
 */
function ConnectionStatus({
  position = "bottom-left",
  showRetry = true,
  onReconnect,
  className,
}: ConnectionStatusProps) {
  const {
    isOnline,
    isReady,
    lastChanged,
    connectionType,
    downlink,
    rtt,
    isSlowConnection,
    checkConnection,
  } = useNetworkStatus();

  const shouldReduceMotion = useReducedMotion();
  const [isChecking, setIsChecking] = React.useState(false);
  const [showOnlineIndicator, setShowOnlineIndicator] = React.useState(false);

  // Handle online indicator auto-hide
  React.useEffect(() => {
    if (!isReady) return;

    if (isOnline) {
      // Briefly show online indicator when coming back online
      setShowOnlineIndicator(true);
      const timer = setTimeout(() => {
        setShowOnlineIndicator(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Always show when offline
      setShowOnlineIndicator(true);
    }
  }, [isOnline, isReady]);

  // Call reconnect callback when coming back online
  const wasOffline = React.useRef(!isOnline);
  React.useEffect(() => {
    if (wasOffline.current && isOnline && isReady) {
      onReconnect?.();
    }
    wasOffline.current = !isOnline;
  }, [isOnline, isReady, onReconnect]);

  const handleRetry = React.useCallback(async () => {
    setIsChecking(true);
    await checkConnection();
    setIsChecking(false);
  }, [checkConnection]);

  // Don't render until we've determined initial state
  if (!isReady || !showOnlineIndicator) {
    return null;
  }

  // Determine status configuration
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        label: "Offline",
        description: "No internet connection",
        variant: "offline" as const,
      };
    }

    if (isSlowConnection) {
      return {
        icon: AlertCircle,
        label: "Slow Connection",
        description: connectionType
          ? `Connected via ${connectionType}`
          : "Connection may be slow",
        variant: "slow" as const,
      };
    }

    return {
      icon: Wifi,
      label: "Online",
      description: connectionType
        ? `Connected via ${connectionType}`
        : "Connected",
      variant: "online" as const,
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Position classes
  const positionClasses = {
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
  };

  // Format last changed time
  const formatLastChanged = () => {
    if (!lastChanged) return "";
    const now = new Date();
    const diff = now.getTime() - lastChanged.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  // Animation variants
  const variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.95,
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isOnline ? "online" : "offline"}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={{
          duration: ANIMATION.seconds.medium,
          ease: ANIMATION.bezier.default,
        }}
        className={cn(
          "fixed z-50",
          positionClasses[position],
          className,
        )}
      >
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  CONNECTION_STYLES.container.base,
                  CONNECTION_STYLES.container[config.variant],
                  "flex items-center gap-3",
                )}
                role="status"
                aria-live="polite"
                aria-label={`Connection status: ${config.label}`}
              >
                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      CONNECTION_STYLES.icon[config.variant],
                      isOnline && !isSlowConnection && "motion-safe:animate-pulse",
                    )}
                    aria-hidden="true"
                  />
                  {/* Pulse ring for offline */}
                  {!isOnline && (
                    <span className="absolute inset-0 -m-1 rounded-full bg-red-500/30 motion-safe:animate-ping" />
                  )}
                </div>

                {/* Text content */}
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{config.label}</span>
                  {lastChanged && (
                    <span className="text-xs opacity-70">
                      {formatLastChanged()}
                    </span>
                  )}
                </div>

                {/* Retry button (offline only) */}
                {!isOnline && showRetry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isChecking}
                    className="ml-2 h-7 px-2 text-xs hover:bg-red-100 dark:hover:bg-red-900/50"
                    aria-label="Retry connection"
                  >
                    {isChecking ? (
                      <RefreshCw
                        className="h-3.5 w-3.5 motion-safe:animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <>
                        <RefreshCw className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        Retry
                      </>
                    )}
                  </Button>
                )}
              </div>
            </TooltipTrigger>

            {/* Detailed tooltip */}
            <TooltipContent
              side={position.includes("top") ? "bottom" : "top"}
              align={position.includes("left") ? "start" : "end"}
              className="max-w-xs"
            >
              <div className="space-y-1">
                <p className="font-medium">{config.description}</p>
                {isOnline && connectionType && (
                  <div className="text-xs text-muted-foreground">
                    {downlink && <p>Speed: {downlink} Mbps</p>}
                    {rtt && <p>Latency: {rtt} ms</p>}
                  </div>
                )}
                {lastChanged && (
                  <p className="text-xs text-muted-foreground">
                    Changed: {formatLastChanged()}
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    </AnimatePresence>
  );
}

export { ConnectionStatus, type ConnectionStatusProps };
