"use client";

import * as React from "react";
//navigate to new page
import { useRouter } from "next/navigation";

import { cn } from "@saasfly/ui";
//button self design
import { buttonVariants, type ButtonProps } from "@saasfly/ui/button";
import { Add, Spinner } from "@saasfly/ui/icons";
import type { ToastProps } from "@saasfly/ui/toast";

import { toast as _toast } from "@saasfly/ui/use-toast";

// Type assertion to satisfy ESLint while maintaining functionality
const toast = _toast as (props: Omit<ToastProps, "id"> & { 
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
}) => { id: string; dismiss: () => void; update: (props: ToastProps) => void };

import { DEFAULT_CLUSTER_CONFIG } from "~/config/k8s";
import { trpc } from "~/trpc/client";

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

      if (!res?.success) {
        toast({
          title: (dict.k8s?.errors as Record<string, string>)?.create_failed_title ?? "Something went wrong.",
          description: (dict.k8s?.errors as Record<string, string>)?.create_failed_desc ?? "Your cluster was not created. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // This forces a cache invalidation.
      router.refresh();

      if (res.id) {
        router.push(`/${lang}/editor/cluster/${res.id}`);
      }
    } catch (error) {
      toast({
        title: (dict.k8s?.errors as Record<string, string>)?.unexpected_error_title ?? "Error",
        description: (dict.k8s?.errors as Record<string, string>)?.unexpected_error_desc ?? "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        buttonVariants({ variant }),
        {
          "cursor-not-allowed opacity-60": isLoading,
        },
        className,
      )}
      disabled={isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <Spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Add className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {dict.k8s?.new_cluster}
    </button>
  );
}
