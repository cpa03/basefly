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
import { Copy, CopyDone, Ellipsis, Spinner, Trash } from "@saasfly/ui/icons";
import { toast } from "@saasfly/ui/use-toast";

import { trpc } from "~/trpc/client";
import type { Cluster } from "~/types/k8s";

interface ClusterOperationsProps {
  cluster: Pick<Cluster, "id" | "name">;
  lang: string;
  dict?: Record<string, unknown>;
}

export function ClusterOperations({ cluster, lang, dict }: ClusterOperationsProps) {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = React.useState<boolean>(false);
  const [isDeleteLoading, setIsDeleteLoading] = React.useState<boolean>(false);
  const [hasCopied, setHasCopied] = React.useState<boolean>(false);

  const k8sDict = dict?.k8s as Record<string, unknown> | undefined;
  const actionsDict = k8sDict?.actions as Record<string, string> | undefined;
  const errorsDict = k8sDict?.errors as Record<string, string> | undefined;
  const deleteDialogDict = k8sDict?.delete_dialog as Record<string, string> | undefined;

  const handleCopyId = React.useCallback(async () => {
    await navigator.clipboard.writeText(String(cluster.id));
    setHasCopied(true);
    toast({
      title: actionsDict?.copy_success_title ?? "Copied!",
      description: actionsDict?.copy_success_desc ?? "Cluster ID copied to clipboard.",
    });
    setTimeout(() => setHasCopied(false), 2000);
  }, [cluster.id, actionsDict]);

  async function deleteCluster(clusterId: number) {
    try {
      const res = await trpc.k8s.deleteCluster.mutate({ id: clusterId });
      if (!res?.success) {
        toast({
          title: errorsDict?.delete_failed_title ?? "Something went wrong.",
          description: errorsDict?.delete_failed_desc ?? "Your cluster was not deleted. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      return true;
    } catch (error) {
      toast({
        title: errorsDict?.unexpected_error_title ?? "Error",
        description: errorsDict?.unexpected_error_desc ?? "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 items-center justify-center rounded-md border transition-all duration-150 ease-out hover:bg-muted hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Cluster actions"
        >
          <Ellipsis className="h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link
              href={`/${lang}/editor/cluster/${cluster.id}`}
              className="flex w-full"
            >
              {actionsDict?.edit ?? "Edit"}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 transition-colors duration-150"
            onSelect={handleCopyId}
          >
            {hasCopied ? (
              <>
                <CopyDone className="h-4 w-4 text-green-500" aria-hidden="true" />
                <span className="text-green-600 font-medium">{actionsDict?.copied ?? "Copied!"}</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" />
                <span>{actionsDict?.copy_id ?? "Copy ID"}</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex cursor-pointer items-center text-destructive focus:text-destructive"
            onSelect={() => setShowDeleteAlert(true)}
          >
            {actionsDict?.delete ?? "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteDialogDict?.title ?? "Are you sure you want to delete this cluster?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialogDict?.description ?? "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{actionsDict?.cancel ?? "Cancel"}</AlertDialogCancel>
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
              <span>{actionsDict?.delete ?? "Delete"}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
