"use client";

import * as React from "react";
//navigate to new page
import { useRouter } from "next/navigation";

import { cn } from "@saasfly/ui";
//button self design
import { buttonVariants, type ButtonProps } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";
import { toast } from "@saasfly/ui/use-toast";

import { DEFAULT_CLUSTER_LOCATION } from "~/config/k8s";
import { trpc } from "~/trpc/client";

interface K8sCreateButtonProps extends ButtonProps {
  dict: Record<string, unknown>;
}

export function K8sCreateButton({
  className,
  variant,
  dict,
  ...props
}: K8sCreateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  async function onClick() {
    setIsLoading(true);
    const res = await trpc.k8s.createCluster.mutate({
      name: "Default Cluster",
      location: DEFAULT_CLUSTER_LOCATION,
    });
    setIsLoading(false);

    if (!res?.success) {
      return toast({
        title: "Something went wrong.",
        description: "Your cluster was not created. Please try again.",
        variant: "destructive",
      });
    }
    if (res) {
      const cluster = res;

      // This forces a cache invalidation.
      router.refresh();

      if (cluster?.id) {
        router.push(`/editor/cluster/${cluster.id}`);
      }
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
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Icons.Add className="mr-2 h-4 w-4" aria-hidden="true" />
      )}
      {dict.k8s?.new_cluster}
    </button>
  );
}
