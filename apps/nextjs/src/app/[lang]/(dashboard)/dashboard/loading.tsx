import { DashboardSkeleton } from "~/components/dashboard-skeleton";
import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="kubernetes"
        text="Create and manage clusters."
      ></DashboardHeader>
      <DashboardSkeleton />
    </DashboardShell>
  );
}
