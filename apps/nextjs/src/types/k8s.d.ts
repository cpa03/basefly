import type { ClusterStatus } from "@saasfly/common";

type ClusterPlan = "FREE" | "BUSINESS" | "PRO";

export interface Cluster {
  id: number;
  name: string;
  status: ClusterStatus | null;
  location: string;
  authUserId: string;
  plan: ClusterPlan | null;
  network: string | null;
  createdAt: Date;
  updatedAt: Date;
  delete: boolean | null;
}

export type ClustersArray = Cluster[] | undefined;
