import { redirect } from "next/navigation";

import { getCurrentUser } from "@saasfly/auth";
import { isAdminEmail } from "@saasfly/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@saasfly/ui/card";
import { Cluster, CreditCard, Dashboard, Users } from "@saasfly/ui/icons";

import { StatusBadge } from "@saasfly/ui/status-badge";

import { trpc } from "~/trpc/server";

export const metadata = {
  title: "Admin Dashboard",
};

interface AdminDashboardStats {
  totalUsers: number;
  totalClusters: number;
  activeSubscriptions: number;
  recentActivity: number;
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- tRPC proxy types are dynamically resolved */
async function fetchAdminStats(): Promise<AdminDashboardStats> {
  const result = await trpc.admin.getStats();
  return result as AdminDashboardStats;
}
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const stats: AdminDashboardStats = await fetchAdminStats().catch(
    (): AdminDashboardStats => ({
      totalUsers: 0,
      totalClusters: 0,
      activeSubscriptions: 0,
      recentActivity: 0,
    }),
  );

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      description: "Registered platform users",
      icon: Users,
    },
    {
      title: "Total Clusters",
      value: stats.totalClusters,
      description: "Kubernetes clusters created",
      icon: Cluster,
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      description: "Paid subscription plans",
      icon: CreditCard,
    },
    {
      title: "Recent Activity",
      value: stats.recentActivity,
      description: "Actions in last 24 hours",
      icon: Dashboard,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground">
          Monitor and manage your Basefly platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              User management and cluster monitoring features coming soon.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health and performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Status</span>
              <StatusBadge status="RUNNING" size="sm" showTooltip={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <StatusBadge status="RUNNING" size="sm" showTooltip={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stripe Integration</span>
              <StatusBadge status="RUNNING" size="sm" showTooltip={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
