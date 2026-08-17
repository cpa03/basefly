import { notFound, redirect } from "next/navigation";
import dynamic from "next/dynamic";

import { authOptions, getCurrentUser, type User } from "@saasfly/auth";
import { db, rlsTransaction } from "@saasfly/db";

import { ClusterConfigSkeleton } from "~/components/k8s/cluster-config-skeleton";
import type { Cluster } from "~/types/k8s";

// Lazy-load the heavy cluster configuration form (react-hook-form + zod + tabs)
// so it is split out of the editor route's initial chunk (Issue #753).
const ClusterConfig = dynamic(
  () =>
    import("~/components/k8s/cluster-config").then((mod) => ({
      default: mod.ClusterConfig,
    })),
  {
    ssr: true,
    loading: () => <ClusterConfigSkeleton />,
  },
);

async function getClusterForUser(clusterId: Cluster["id"], userId: User["id"]) {
  return await rlsTransaction(db, userId, (trx) =>
    trx
      .selectFrom("K8sClusterConfig")
      .selectAll()
      .where("id", "=", Number(clusterId))
      .where("authUserId", "=", userId)
      .executeTakeFirst(),
  );
}

interface EditorClusterProps {
  params: Promise<{
    clusterId: number;
    lang: string;
  }>;
}

export default async function EditorClusterPage({
  params,
}: EditorClusterProps) {
  const { clusterId, lang } = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }

  const cluster = await getClusterForUser(clusterId, user.id);

  if (!cluster) {
    notFound();
  }
  return (
    <ClusterConfig
      cluster={{
        id: cluster.id,
        name: cluster.name,
        location: cluster.location,
      }}
      params={{ lang }}
    />
  );
}
