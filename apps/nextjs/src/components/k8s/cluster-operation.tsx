"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@saasfly/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@saasfly/ui/dropdown-menu";
import { Check, Copy, CopyDone, Ellipsis, Spinner, Trash } from "@saasfly/ui/icons";
import { toast } from "@saasfly/ui/use-toast";

import { trpc } from "~/trpc/client";
import type { Cluster } from "~/types/k8s";

async function deleteCluster(clusterId: number) {
  try {
    const res = await trpc.k8s.deleteCluster.mutate({ id: clusterId });
    if (!res?.success) {
      toast({
        title: "Something went wrong.",
        description: "Your cluster was not deleted. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  } catch (error) {
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
    return false;
  }
}

interface ClusterOperationsProps {
  cluster: Pick<Cluster, "id" | "name">;
  lang: string;
}

export function ClusterOperations({ cluster, lang }: ClusterOperationsProps) {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = React.useState<boolean>(false);
  const [hasCopied, setHasCopied] = React.useState<boolean>(false);

  const handleCopyId = React.useCallback(async () => {
    await navigator.clipboard.writeText(String(cluster.id));
    setHasCopied(true);
    toast({
      title: "Copied!",
      description: "Cluster ID copied to clipboard.",
    });
    // Reset the copied state after 2 seconds
    setTimeout(() => setHasCopied(false), 2000);
  }, [cluster.id]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md border transition-colors hover:bg-muted">
          <Ellipsis className="h-4 w-4" />
          <span className="sr-only">Open</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              href={`/${lang}/editor/cluster/${cluster.id}`}
              className="flex w-full"
            >
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2"
            onSelect={handleCopyId}
          >
            {hasCopied ? (
              <>
                <CopyDone className="h-4 w-4 text-green-500" aria-hidden="true" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>Copy ID</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this cluster?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (event) => {
                event.preventDefault();
                setIsDeleteLoading(true);
                try {
                  const deleted = await deleteCluster(cluster.id);

                  if (deleted) {
                    setShowDeleteAlert(false);
                    router.refresh();
                  }
                } finally {
                  setIsDeleteLoading(false);
                }
              }}
              className="bg-red-600 focus:ring-red-600"
              aria-busy={isDeleteLoading}
            >
              {isDeleteLoading ? (
                <Spinner className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Trash className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              <span>Delete</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
