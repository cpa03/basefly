import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";
import { DashboardSkeleton } from "~/components/dashboard-skeleton";

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
