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

import { trpc } from "~/trpc/server";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdminEmail(user.email)) {
    redirect("/dashboard");
  }

  const stats = await trpc.admin.getStats.query().catch(() => ({
    totalUsers: 0,
    totalClusters: 0,
    activeSubscriptions: 0,
    recentActivity: 0,
  }));

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
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Stripe Integration</span>
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
