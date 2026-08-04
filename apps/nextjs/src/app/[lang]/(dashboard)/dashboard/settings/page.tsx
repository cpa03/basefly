import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { authOptions, getCurrentUser } from "@saasfly/auth";

import { DashboardHeader } from "~/components/header";
import { DashboardShell } from "~/components/shell";

// Lazy-load the heavy account form (react-hook-form + zod) so it is split
// into a separate chunk instead of inflating the initial settings payload.
const UserNameForm = dynamic(
  () =>
    import("~/components/user-name-form").then((mod) => ({
      default: mod.UserNameForm,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
    ),
  },
);

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(authOptions?.pages?.signIn ?? "/login");
  }
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and website settings."
      />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name ?? "" }} />
      </div>
    </DashboardShell>
  );
}
