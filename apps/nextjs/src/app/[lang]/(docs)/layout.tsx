import { Suspense } from "react";

import { getCurrentUser } from "@saasfly/auth";

import { NavBar } from "~/components/navbar";
import { NavbarSkeleton } from "~/components/navbar-skeleton";
import { SiteFooter } from "~/components/site-footer";
import { SkipLink } from "~/components/skip-link";
import type { Locale } from "~/config/i18n-config";
import { getMarketingConfig } from "~/config/ui/marketing";
import { getDictionary } from "~/lib/get-dictionary";

interface DocsLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

export default async function DocsLayout({
  children,
  params,
}: DocsLayoutProps) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col">
      <SkipLink />
      <Suspense fallback={<NavbarSkeleton />}>
        <NavBar
          items={
            (await getMarketingConfig({ params: { lang: `${lang}` } })).mainNav
          }
          params={{ lang: `${lang}` }}
          scroll={true}
          user={user ?? undefined}
          marketing={dict.marketing}
          dropdown={dict.dropdown}
        />
      </Suspense>
      <main id="main-content" className="container flex-1">
        {children}
      </main>
      <SiteFooter
        className="border-t"
        params={{ lang: `${lang}` }}
        dict={dict.common}
      />
    </div>
  );
}
