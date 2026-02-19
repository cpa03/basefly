import type { ClusterStatus, PlanId } from "@saasfly/common";

export interface Cluster {
  id: number;
  name: string;
  status: ClusterStatus | null;
  location: string;
  authUserId: string;
  plan: PlanId | null;
  network: string | null;
  createdAt: Date;
  updatedAt: Date;
  delete: boolean | null;
}

export type ClustersArray = Cluster[] | undefined;
