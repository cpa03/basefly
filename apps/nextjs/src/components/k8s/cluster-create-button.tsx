"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button, type ButtonProps } from "@saasfly/ui/button";
import { Add } from "@saasfly/ui/icons";
import type { ToastProps } from "@saasfly/ui/toast";
import { toast as _toast } from "@saasfly/ui/use-toast";

import { DEFAULT_CLUSTER_CONFIG } from "~/config/k8s";
import { trpc } from "~/trpc/client";

// Type assertion to satisfy ESLint while maintaining functionality
const toast = _toast as (
  props: Omit<ToastProps, "id"> & {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: "default" | "destructive";
  },
) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };

interface K8sCreateButtonProps extends ButtonProps {
  dict: Record<string, unknown>;
  lang: string;
}

export function K8sCreateButton({
  className,
  variant,
  dict,
  lang,
  ...props
}: K8sCreateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onClick() {
    setIsLoading(true);
    try {
      const res = await trpc.k8s.createCluster.mutate({
        name: DEFAULT_CLUSTER_CONFIG.name,
        location: DEFAULT_CLUSTER_CONFIG.location,
      });

      const response = res as {
        success?: boolean;
        id?: number;
        errors?: { message?: string }[];
      };
      if (!response?.success) {
        toast({
          title:
            (dict.k8s as Record<string, Record<string, string>>)?.errors
              ?.create_failed_title ?? "Something went wrong.",
          description:
            (dict.k8s as Record<string, Record<string, string>>)?.errors
              ?.create_failed_desc ??
            "Your cluster was not created. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // This forces a cache invalidation.
      router.refresh();

      if (response.id) {
        router.push(`/${lang}/editor/cluster/${response.id}`);
      }
    } catch {
      toast({
        title:
          (dict.k8s as Record<string, Record<string, string>>)?.errors
            ?.unexpected_error_title ?? "Error",
        description:
          (dict.k8s as Record<string, Record<string, string>>)?.errors
            ?.unexpected_error_desc ??
          "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      isLoading={isLoading}
      className={className}
      {...props}
    >
      {!isLoading && <Add className="mr-2 h-4 w-4" aria-hidden="true" />}
      {(dict.k8s as Record<string, string>)?.new_cluster ?? "New Cluster"}
    </Button>
  );
}
