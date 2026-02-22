import { Z_INDEX } from "@saasfly/common";

import { BackToTop } from "~/components/back-to-top";
import { DocsSidebarNav } from "~/components/docs/sidebar-nav";
import { getDocsConfig } from "~/config/ui/docs";

export default async function DocsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}) {
  const { lang } = await params;
  return (
    <div className="flex-1 md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
      <aside className={`fixed top-14 ${Z_INDEX.sidebar} hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r py-6 pr-2 md:sticky md:block lg:py-10`}>
        <DocsSidebarNav items={getDocsConfig(`${lang}`).sidebarNav} />
      </aside>
      {children}
      <BackToTop />
    </div>
  );
}
