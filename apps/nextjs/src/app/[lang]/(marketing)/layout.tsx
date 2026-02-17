import { Suspense } from "react";

import { getCurrentUser } from "@saasfly/auth";

import { ModalProvider } from "~/components/modal-provider";
import { NavBar } from "~/components/navbar";
import { NavbarSkeleton } from "~/components/navbar-skeleton";
import { SiteFooter } from "~/components/site-footer";
import { BackToTop } from "~/components/back-to-top";
import { SkipLink } from "~/components/skip-link";
import type { Locale } from "~/config/i18n-config";
import { getMarketingConfig } from "~/config/ui/marketing";
import { getDictionary } from "~/lib/get-dictionary";

export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}) {
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
      <ModalProvider dict={dict.login} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter
        className="border-t border-border"
        params={{ lang: `${lang}` }}
        dict={dict.common}
      />
      <BackToTop />
    </div>
  );
}
